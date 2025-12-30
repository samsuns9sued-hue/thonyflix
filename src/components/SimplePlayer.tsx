// src/components/SimplePlayer.tsx

// Este componente não tem 'use client' porque é 100% HTML renderizado no servidor.
// É o mais leve e compatível possível.

interface SimplePlayerProps {
  src: string;
  poster: string;
}

export default function SimplePlayer({ src, poster }: SimplePlayerProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video
        controls
        autoPlay
        src={src} // Passando o src diretamente
        poster={poster}
        style={{ maxWidth: '100%', maxHeight: '100%', outline: 'none' }}
      >
        {/* A tag <source> pode causar problemas em alguns navegadores antigos.
            Colocar o 'src' direto no <video> é mais seguro. */}
        Desculpe, seu navegador não suporta a reprodução deste vídeo.
      </video>
    </div>
  );
}