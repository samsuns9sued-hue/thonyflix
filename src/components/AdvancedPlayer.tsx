// src/components/AdvancedPlayer.tsx

'use client';

import { useRef, useEffect } from 'react';
import { usePlyr } from 'plyr-react';
import 'plyr-react/plyr.css';

// Importando os tipos diretamente da biblioteca principal do Plyr
import Plyr, { PlyrOptions, PlyrSource } from 'plyr';

// Importe a biblioteca H.js para tocar o streaming
import Hls from 'hls.js';

// As propriedades que nosso componente recebe (src e poster)
interface AdvancedPlayerProps {
  src: string;
  poster: string;
}

const AdvancedPlayer = ({ src, poster }: AdvancedPlayerProps) => {
  const ref = useRef(null);

  const source: PlyrSource = {
    type: 'video',
    sources: [
      {
        src: src, // O link .m3u8 do Cloudflare Stream
        type: 'application/x-mpegURL',
      },
    ],
    poster: poster,
  };

  const options: PlyrOptions = {
    settings: ['quality', 'speed', 'loop'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
  };

  // O 'usePlyr' é o Hook que substitui o componente <Plyr />
  // Ele anexa o player de vídeo ao elemento referenciado pelo 'ref'
  const playerInstance = usePlyr(ref, {
    source: source,
    options: options,
  });

  // Este useEffect garante que o HLS seja carregado corretamente
  useEffect(() => {
    if (playerInstance.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      // 'plyr.media' é o elemento <video> real dentro do player
      hls.attachMedia(playerInstance.current.plyr.media);
    }
  }, [playerInstance, src]);

  // O componente agora retorna um elemento <video> simples,
  // e o Hook 'usePlyr' fará a mágica de transformá-lo no player avançado.
  return (
    <div className="plyr-container">
      <video ref={ref} className="plyr-react plyr"></video>
    </div>
  );
};

export default AdvancedPlayer;