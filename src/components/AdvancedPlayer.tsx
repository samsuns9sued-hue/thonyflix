// src/components/AdvancedPlayer.tsx

'use client';

import { useRef, useEffect } from 'react';
import { usePlyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import Hls from 'hls.js';

// As opções do player podem ficar fora do componente, pois não mudam.
const plyrOptions: Plyr.Options = {
  settings: ['quality', 'speed', 'loop'],
  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
  keyboard: { focused: true, global: true },
  tooltips: { controls: true, seek: true },
};

interface AdvancedPlayerProps {
  src: string; // O link .m3u8
  poster: string;
}

const AdvancedPlayer = ({ src, poster }: AdvancedPlayerProps) => {
  // 1. Criamos uma ref para o elemento <video>
  const ref = useRef(null);

  // 2. O hook 'usePlyr' é chamado com a ref e as opções.
  //    Ele retorna outra ref que nos dará acesso à instância do player.
  const playerInstanceRef = usePlyr(ref, {
    options: plyrOptions,
    source: {
      type: 'video',
      poster: poster,
      // A fonte inicial é vazia, pois o HLS irá carregá-la dinamicamente.
      sources: [],
    },
  });

  // 3. O useEffect é o coração da solução. Ele gerencia o HLS.
  useEffect(() => {
    let hls: Hls | null = null;
    
    // Pegamos o elemento <video> real da nossa ref.
    const videoElement = ref.current;

    if (videoElement && Hls.isSupported()) {
      hls = new Hls();
      // Carregamos a URL do streaming no HLS.
      hls.loadSource(src);
      // Anexamos o HLS ao elemento <video>.
      hls.attachMedia(videoElement);
    }

    // 4. Função de limpeza: Isso é MUITO importante.
    //    Ela é executada quando o componente "morre" ou o 'src' muda.
    //    Isso previne vazamentos de memória.
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]); // Este efeito roda novamente sempre que a URL do vídeo (src) mudar.

  // 5. O componente renderiza um elemento <video> simples.
  //    O hook 'usePlyr' e o 'useEffect' fazem toda a mágica por trás dos panos.
  return (
    <div className="plyr-container">
      <video ref={ref} className="plyr-react plyr"></video>
    </div>
  );
};

export default AdvancedPlayer;