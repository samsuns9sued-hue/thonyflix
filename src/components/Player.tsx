// components/Player.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  PictureInPicture2,
  RotateCcw,
  ChevronLeft,
  Loader2,
} from "lucide-react";

interface PlayerProps {
  src: string;
  poster: string;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  autoPlay?: boolean;
}

export default function Player({
  src,
  poster,
  title = "Título do Filme",
  subtitle = "Temporada 1: Episódio 1",
  onBack,
  autoPlay = false,
}: PlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Format time helper
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1
      );
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  // Control handlers
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = previousVolume;
        setVolume(previousVolume);
      } else {
        setPreviousVolume(volume);
        videoRef.current.volume = 0;
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
      setCurrentTime(percent * duration);
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setHoverTime(percent * duration);
      setHoverPosition(e.clientX - rect.left);
    }
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      setShowSettings(false);
    }
  };

  // Função para resetar o timer de esconder controles
  const resetHideControlsTimer = useCallback(() => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Mouse movement handler
  const handleMouseMove = () => {
    setShowControls(true);
    resetHideControlsTimer();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  // Touch handler para mobile e TV
  const handleTouchStart = () => {
    setShowControls(true);
    resetHideControlsTimer();
  };

  // Handler para clique no vídeo (funciona para touch e mouse)
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    // Se os controles não estão visíveis, apenas mostra eles
    if (!showControls) {
      setShowControls(true);
      resetHideControlsTimer();
      return;
    }

    // Se os controles já estão visíveis, faz play/pause
    togglePlay();
  };

  // Handler para clique no container (área fora do vídeo em alguns casos)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Verifica se o clique foi diretamente no container (não em um filho)
    if (e.target === e.currentTarget) {
      if (!showControls) {
        setShowControls(true);
        resetHideControlsTimer();
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mostra controles ao pressionar qualquer tecla
      setShowControls(true);
      resetHideControlsTimer();

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          break;
        case "arrowup":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, volume + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;
        case "arrowdown":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, volume - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            if (newVol === 0) setIsMuted(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, volume, resetHideControlsTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Labels dinâmicos para acessibilidade
  const playPauseLabel = isPlaying ? "Pausar vídeo" : "Reproduzir vídeo";
  const muteLabel = isMuted || volume === 0 ? "Ativar som" : "Silenciar";
  const fullscreenLabel = isFullscreen ? "Sair da tela cheia" : "Tela cheia";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleContainerClick}
      role="region"
      aria-label={`Player de vídeo: ${title}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        poster={poster}
        preload="metadata"
        autoPlay={autoPlay}
        onClick={handleVideoClick}
        onDoubleClick={toggleFullscreen}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label={`Vídeo: ${title}`}
      >
        <source src={src} type="video/mp4" />
        Seu navegador não suporta este vídeo.
      </video>

      {/* Loading Spinner */}
      {isLoading && hasStarted && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 z-20"
          role="status"
          aria-label="Carregando vídeo"
        >
          <Loader2 className="w-16 h-16 text-red-600 animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando vídeo...</span>
        </div>
      )}

      {/* Play Button Overlay (before starting) */}
      {!hasStarted && !isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 cursor-pointer"
          onClick={togglePlay}
          role="button"
          aria-label="Iniciar reprodução do vídeo"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              togglePlay();
            }
          }}
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/30 border border-white/30">
            <Play className="w-12 h-12 text-white ml-1" fill="white" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Gradient Overlays */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Top Controls */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 flex items-center gap-4 transition-all duration-500 ${
          showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }`}
        aria-hidden={!showControls}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Voltar para a página anterior"
            tabIndex={showControls ? 0 : -1}
          >
            <ChevronLeft className="w-8 h-8 text-white" aria-hidden="true" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold drop-shadow-lg">
            {title}
          </h1>
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Center Play/Pause Animation */}
      {hasStarted && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div
            className={`transform transition-all duration-300 ${
              !isPlaying && showControls ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Pause className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-6 pb-6 transition-all duration-500 ${
          showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
        role="toolbar"
        aria-label="Controles do player"
        aria-hidden={!showControls}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative w-full h-1 group/progress cursor-pointer mb-4 hover:h-1.5 transition-all duration-200"
          onClick={handleProgressClick}
          onMouseMove={handleProgressHover}
          onMouseLeave={handleProgressLeave}
          role="slider"
          aria-label="Progresso do vídeo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
          tabIndex={showControls ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              skip(-10);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              skip(10);
            }
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-white/30 rounded-full" />
          
          {/* Buffered */}
          <div
            className="absolute top-0 left-0 h-full bg-white/50 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          
          {/* Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          >
            {/* Progress Handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-lg" />
          </div>

          {/* Hover Time Preview */}
          {hoverTime !== null && (
            <div
              className="absolute -top-10 transform -translate-x-1/2 bg-black/90 text-white text-sm px-2 py-1 rounded pointer-events-none"
              style={{ left: hoverPosition }}
              aria-hidden="true"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95"
              aria-label={playPauseLabel}
              tabIndex={showControls ? 0 : -1}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white" aria-hidden="true" />
              ) : (
                <Play className="w-7 h-7 text-white" fill="white" aria-hidden="true" />
              )}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => skip(-10)}
              className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95 hidden sm:block"
              aria-label="Retroceder 10 segundos"
              tabIndex={showControls ? 0 : -1}
            >
              <div className="relative">
                <RotateCcw className="w-6 h-6 text-white" aria-hidden="true" />
                <span 
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  aria-hidden="true"
                >
                  10
                </span>
              </div>
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => skip(10)}
              className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95 hidden sm:block"
              aria-label="Avançar 10 segundos"
              tabIndex={showControls ? 0 : -1}
            >
              <div className="relative">
                <RotateCcw className="w-6 h-6 text-white scale-x-[-1]" aria-hidden="true" />
                <span 
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  aria-hidden="true"
                >
                  10
                </span>
              </div>
            </button>

            {/* Volume */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95"
                aria-label={muteLabel}
                tabIndex={showControls ? 0 : -1}
              >
                <VolumeIcon className="w-6 h-6 text-white" aria-hidden="true" />
              </button>

              {/* Volume Slider */}
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  showVolumeSlider ? "w-24 opacity-100 ml-1" : "w-0 opacity-0"
                }`}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label={`Volume: ${Math.round(volume * 100)}%`}
                  tabIndex={showControls && showVolumeSlider ? 0 : -1}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-125"
                  style={{
                    background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%)`,
                  }}
                />
              </div>
            </div>

            {/* Time Display */}
            <div 
              className="text-white text-sm ml-2 font-medium tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              <span aria-label={`Tempo atual: ${formatTime(currentTime)}`}>{formatTime(currentTime)}</span>
              <span className="text-white/50 mx-1" aria-hidden="true">/</span>
              <span className="text-white/70" aria-label={`Duração total: ${formatTime(duration)}`}>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Skip Intro Button (example) */}
            {currentTime > 5 && currentTime < 30 && (
              <button
                onClick={() => skip(25)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded transition-all border border-white/40 mr-4"
                aria-label="Pular introdução, avançar 25 segundos"
                tabIndex={showControls ? 0 : -1}
              >
                Pular Intro
              </button>
            )}

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowSpeedMenu(false);
                }}
                className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95"
                aria-label={`Configurações, velocidade atual: ${playbackSpeed}x`}
                aria-expanded={showSettings}
                aria-haspopup="menu"
                tabIndex={showControls ? 0 : -1}
              >
                <Settings className="w-6 h-6 text-white" aria-hidden="true" />
              </button>

              {/* Settings Menu */}
              {showSettings && (
                <div 
                  className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg overflow-hidden shadow-2xl border border-white/10 min-w-[200px]"
                  role="menu"
                  aria-label="Menu de configurações"
                >
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="w-full px-4 py-3 text-white text-sm hover:bg-white/10 flex items-center justify-between transition-colors"
                    role="menuitem"
                    aria-expanded={showSpeedMenu}
                    aria-haspopup="menu"
                  >
                    <span>Velocidade</span>
                    <span className="text-white/60">{playbackSpeed}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div 
                      className="border-t border-white/10"
                      role="menu"
                      aria-label="Opções de velocidade de reprodução"
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changePlaybackSpeed(speed)}
                          className={`w-full px-4 py-2 text-sm hover:bg-white/10 flex items-center justify-between transition-colors ${
                            playbackSpeed === speed
                              ? "text-red-500"
                              : "text-white"
                          }`}
                          role="menuitemradio"
                          aria-checked={playbackSpeed === speed}
                          aria-label={speed === 1 ? "Velocidade normal" : `Velocidade ${speed}x`}
                        >
                          <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                          {playbackSpeed === speed && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtitles */}
            <button 
              className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95 hidden sm:block"
              aria-label="Legendas e áudio"
              tabIndex={showControls ? 0 : -1}
            >
              <Subtitles className="w-6 h-6 text-white" aria-hidden="true" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={togglePictureInPicture}
              className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95 hidden sm:block"
              aria-label="Picture in Picture - assistir em janela flutuante"
              tabIndex={showControls ? 0 : -1}
            >
              <PictureInPicture2 className="w-6 h-6 text-white" aria-hidden="true" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-md hover:bg-white/10 transition-all active:scale-95"
              aria-label={fullscreenLabel}
              tabIndex={showControls ? 0 : -1}
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6 text-white" aria-hidden="true" />
              ) : (
                <Maximize className="w-6 h-6 text-white" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Skip Buttons on sides */}
      <button
        onClick={() => skip(-10)}
        className={`absolute left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all ${
          showControls ? "opacity-100" : "opacity-0"
        } hidden md:block`}
        aria-label="Retroceder 10 segundos"
        tabIndex={showControls ? 0 : -1}
        aria-hidden={!showControls}
      >
        <SkipBack className="w-8 h-8 text-white" aria-hidden="true" />
      </button>

      <button
        onClick={() => skip(10)}
        className={`absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all ${
          showControls ? "opacity-100" : "opacity-0"
        } hidden md:block`}
        aria-label="Avançar 10 segundos"
        tabIndex={showControls ? 0 : -1}
        aria-hidden={!showControls}
      >
        <SkipForward className="w-8 h-8 text-white" aria-hidden="true" />
      </button>
    </div>
  );
}