// components/Player.tsx
export default function Player({ src, poster }: { src: string, poster: string }) {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <video
        controls
        className="w-full max-h-screen focus:border-4 focus:border-white outline-none"
        poster={poster}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Seu navegador não suporta este vídeo.
      </video>
    </div>
  );
}