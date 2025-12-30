// src/components/AdvancedPlayer.tsx

// 'use client' é obrigatório para componentes com interatividade
'use client';

import Plyr, { PlyrProps, APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';
import { useRef } from 'react';

// Importe a biblioteca H.js para tocar o streaming
import Hls from 'hls.js';

export default function AdvancedPlayer({ src, poster }: { src: string, poster: string }) {
  const ref = useRef<APITypes>(null);

  const source: PlyrProps['source'] = {
    type: 'video',
    sources: [
      {
        src: src, // O link .m3u8 do Cloudflare Stream
        type: 'application/x-mpegURL',
      },
    ],
    poster: poster,
  };

  const options: PlyrProps['options'] = {
    // Configurações do menu
    settings: ['quality', 'speed', 'loop'],
    // Opções de velocidade
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    // Teclas de atalho (setas para pular, 'f' para tela cheia, etc.)
    keyboard: { focused: true, global: false },
    tooltips: { controls: true, seek: true },
  };

  // Lógica para carregar o HLS
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    // @ts-ignore
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const plyrInstance = ref.current?.plyr;
      if (plyrInstance) {
        // @ts-ignore
        hls.attachMedia(plyrInstance.media);
      }
    });
  }

  return <Plyr ref={ref} source={source} options={options} />;
}