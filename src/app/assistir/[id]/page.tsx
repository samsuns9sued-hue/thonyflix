// src/app/assistir/[id]/page.tsx

import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// Importe APENAS o player novo
import AdvancedPlayer from '@/components/AdvancedPlayer';

export default async function PaginaAssistir({ params: paramsPromise }: { params: any }) {
  // --- NADA MUDA AQUI ---
  // A lógica para buscar o filme continua exatamente a mesma.
  const params = await paramsPromise;
  const id = Number(params.id);

  if (isNaN(id)) {
    return notFound();
  }

  try {
    const { rows } = await pool.query('SELECT * FROM filmes WHERE id = $1', [id]);
    const filme = rows[0];

    if (!filme) {
      return notFound();
    }
    // --- FIM DA LÓGICA DO BANCO ---


    // ✅ MUDANÇA PRINCIPAL: A ESTRUTURA DA PÁGINA
    // Agora o layout é focado 100% no player.
    return (
      <div className="w-screen h-screen bg-black">
        {/* Botão de Voltar para a Home */}
        <Link 
          href="/" 
          className="absolute top-5 left-5 z-20 text-white bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full transition-all"
          aria-label="Voltar para a home"
        >
          {/* Ícone de seta (SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        
        {/* O Player Avançado ocupando todo o espaço */}
        <div className="w-full h-full">
          <AdvancedPlayer 
            src={filme.video_url} // Aqui vai o link .m3u8 do Cloudflare Stream
            poster={filme.capa_url} 
          />
        </div>
      </div>
    );

  } catch (error) {
    console.error('Erro ao buscar filme no banco:', error);
    return notFound();
  }
}