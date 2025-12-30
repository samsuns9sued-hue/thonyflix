// src/app/assistir/[id]/page.tsx

import pool from '@/lib/db';
import { notFound } from 'next/navigation';
// Importe o novo player super leve
import SimplePlayer from '@/components/SimplePlayer';

async function getEpisodeData(episodeId: number) {
  const { rows } = await pool.query(
    'SELECT video_url, s.cover_url AS series_cover FROM episodes e JOIN series s ON e.series_id = s.id WHERE e.id = $1;',
    [episodeId]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export default async function PaginaAssistir({ params: paramsPromise }: { params: any }) {
  const params = await paramsPromise;
  const episodeId = Number(params.id);

  if (isNaN(episodeId)) {
    notFound();
  }

  const episodeData = await getEpisodeData(episodeId);

  if (!episodeData) {
    notFound();
  }

  // Agora, em vez de passar dezenas de props para seu player complexo,
  // nós apenas renderizamos o player mais simples possível com o mínimo de dados.
  return (
    <SimplePlayer 
      src={episodeData.video_url} 
      poster={episodeData.series_cover} 
    />
  );
}