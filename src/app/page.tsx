// src/app/page.tsx
import Link from 'next/link';
import pool from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

// Tipos para os dados do banco
type Episode = { id: number; season_number: number; episode_number: number; };
type Series = { id: number; title: string; sinopsis: string; cover_url: string; episodes: Episode[] };

// Função para buscar e agrupar os dados
async function getGroupedSeries(): Promise<Series[]> {
  noStore(); // Garante que os dados sejam sempre frescos
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
    GROUP BY s.id
    ORDER BY s.title;
  `);
  return rows;
}

export default async function Home() {
  const allSeries = await getGroupedSeries();

  return (
    <main className="p-4 md:p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl mb-8 font-bold">Minhas Séries</h1>
      
      {allSeries.length === 0 ? (
        <p>Nenhuma série encontrada.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {allSeries.map((series) => (
            <div key={series.id} className="group">
              {/* O pôster agora leva para a página da série, não do episódio */}
              <Link href={`/series/${series.id}`} className="block relative aspect-[2/3] rounded-lg overflow-hidden border-4 border-transparent focus:border-yellow-400 transition-all focus:scale-105 outline-none">
                <img src={series.cover_url} alt={series.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="font-bold">{series.title}</h3>
                  <p className="text-xs">{series.episodes.length} episódios</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}