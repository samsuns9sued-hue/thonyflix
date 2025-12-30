// src/app/assistir/[id]/page.tsx

import pool from '@/lib/db';
import Player from '@/components/Player'; // Seu player customizado
import { notFound } from 'next/navigation';

// Função para buscar o episódio E os dados da série a que ele pertence
async function getEpisodeData(episodeId: number) {
  const { rows } = await pool.query(`
    SELECT 
      e.video_url, 
      e.season_number,
      e.episode_number,
      s.title AS series_title, -- Pega o título da tabela 'series'
      s.cover_url AS series_cover -- Pega a capa da tabela 'series'
    FROM episodes e
    JOIN series s ON e.series_id = s.id -- Junta as duas tabelas
    WHERE e.id = $1; -- Filtra pelo ID do episódio
  `, [episodeId]);

  if (rows.length === 0) return null;
  return rows[0];
}


export default async function PaginaAssistir({ params: paramsPromise }: { params: any }) {
  const params = await paramsPromise;
  const episodeId = Number(params.id);

  if (isNaN(episodeId)) {
    return notFound();
  }

  const episodeData = await getEpisodeData(episodeId);

  if (!episodeData) {
    return notFound();
  }

  // Agora usamos os novos nomes que definimos na query
  // Ex: series_title em vez de titulo
  return (
    <Player 
      src={episodeData.video_url} 
      poster={episodeData.series_cover}
      title={episodeData.series_title}
      subtitle={`Temporada ${episodeData.season_number}: Episódio ${episodeData.episode_number}`}
      // A função de voltar (onBack) pode ser um link para a página da série no futuro
    />
  );
}