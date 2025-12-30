// src/app/series/[id]/page.tsx
import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getSeriesDetails(id: number) {
  // A query é a mesma da Home, mas com um filtro "WHERE"
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
    WHERE s.id = $1  -- Esta linha filtra para pegar apenas a série com o ID que queremos
    GROUP BY s.id;
  `, [id]); // O [id] aqui passa o número para o $1 da query

  if (rows.length === 0) return null;
  return rows[0];
}

export default async function SeriesPage({ params }: { params: { id: string } }) {
    const series = await getSeriesDetails(Number(params.id));
    if (!series) notFound();

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            {/* Background com a capa */}
            <div className="absolute inset-0 h-[60vh] opacity-30">
                <img src={series.cover_url} className="w-full h-full object-cover object-top" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            </div>
            
            {/* Conteúdo */}
            <div className="relative p-8 md:p-16">
                <h1 className="text-5xl font-bold">{series.title}</h1>
                <p className="max-w-2xl mt-4 text-gray-300">{series.sinopsis}</p>

                <h2 className="text-2xl font-semibold mt-12 mb-4">Episódios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {series.episodes.map((ep: any) => (
                        <Link href={`/assistir/${ep.id}`} key={ep.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <h3 className="font-bold">
                                S{String(ep.season_number).padStart(2, '0')}E{String(ep.episode_number).padStart(2, '0')}
                            </h3>
                            {/* Poderia adicionar ep.episode_title aqui se cadastrar */}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}