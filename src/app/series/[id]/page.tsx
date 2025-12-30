// src/app/series/[id]/page.tsx

import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getSeriesDetails(id: number) {
  // Verificação extra para garantir que não enviamos NaN para o banco
  if (isNaN(id)) {
    return null;
  }
  
  const { rows } = await pool.query(`
    SELECT
      s.id, s.title, s.sinopsis, s.cover_url,
      json_agg(
        json_build_object(
          'id', e.id,
          'season_number', e.season_number,
          'episode_number', e.episode_number
        ) ORDER BY e.season_number, e.episode_number
      ) as episodes
    FROM series s
    JOIN episodes e ON s.id = e.series_id
    WHERE s.id = $1
    GROUP BY s.id;
  `, [id]);

  if (rows.length === 0) return null;
  return rows[0];
}

// A correção principal está aqui na função principal do componente
export default async function SeriesPage({ params: paramsPromise }: { params: any }) {
  // ✅ CORREÇÃO: Esperamos a promessa ser resolvida ANTES de usar os parâmetros.
  const params = await paramsPromise;
  const seriesId = Number(params.id);

  const series = await getSeriesDetails(seriesId);
  
  if (!series) {
    notFound();
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Background com a capa */}
      <div className="absolute inset-0 h-[60vh] opacity-30 pointer-events-none">
        <img src={series.cover_url} className="w-full h-full object-cover object-top" alt={`Pôster de ${series.title}`}/>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
      </div>
      
      {/* Conteúdo */}
      <div className="relative p-8 md:p-16">
        <Link href="/" className="text-yellow-400 hover:text-yellow-300 mb-8 inline-block">
          &larr; Voltar para a Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{series.title}</h1>
        <p className="max-w-2xl mt-4 text-gray-300">{series.sinopsis}</p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Episódios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {series.episodes.map((ep: { id: number; season_number: number; episode_number: number }) => (
            <Link 
              href={`/assistir/${ep.id}`} 
              key={ep.id} 
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <h3 className="font-bold text-lg">
                S{String(ep.season_number).padStart(2, '0')}E{String(ep.episode_number).padStart(2, '0')}
              </h3>
              <p className="text-sm text-gray-400">Assistir Episódio</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}