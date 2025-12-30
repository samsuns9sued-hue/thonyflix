// src/app/series/[id]/page.tsx

import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Ícones inline para não precisar de dependências extras
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface Episode {
  id: number;
  season_number: number;
  episode_number: number;
  title?: string;
  duration?: number;
  thumbnail_url?: string;
}

interface Series {
  id: number;
  title: string;
  sinopsis: string;
  cover_url: string;
  episodes: Episode[];
  year?: number;
  rating?: string;
  genres?: string[];
}

async function getSeriesDetails(id: number): Promise<Series | null> {
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

// Agrupa episódios por temporada
function groupEpisodesBySeason(episodes: Episode[]) {
  return episodes.reduce((acc, ep) => {
    const season = ep.season_number;
    if (!acc[season]) acc[season] = [];
    acc[season].push(ep);
    return acc;
  }, {} as Record<number, Episode[]>);
}

export default async function SeriesPage({ params: paramsPromise }: { params: any }) {
  const params = await paramsPromise;
  const seriesId = Number(params.id);
  const series = await getSeriesDetails(seriesId);
  
  if (!series) {
    notFound();
  }

  const episodesBySeason = groupEpisodesBySeason(series.episodes);
  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);
  const totalEpisodes = series.episodes.length;
  const firstEpisode = series.episodes[0];

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*                        HERO SECTION                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] min-h-[600px]">
        
        {/* Background Image com múltiplos gradientes */}
        <div className="absolute inset-0">
          <img 
            src={series.cover_url} 
            alt={`Capa de ${series.title}`}
            className="w-full h-full object-cover object-center"
          />
          
          {/* Gradiente de baixo para cima (principal) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          
          {/* Gradiente lateral esquerdo para legibilidade do texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
          
          {/* Gradiente sutil do topo */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/80 via-transparent to-transparent h-32" />
          
          {/* Overlay escuro geral */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Botão Voltar */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-4 py-2 rounded-full 
                       bg-black/40 backdrop-blur-md border border-white/10
                       hover:bg-white/20 transition-all duration-300
                       hover:scale-105 active:scale-95"
          >
            <ArrowLeftIcon />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 
                           -ml-2 group-hover:ml-0 transition-all duration-300">
              Voltar
            </span>
          </Link>
        </div>

        {/* Conteúdo do Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 z-10">
          <div className="max-w-4xl space-y-6">
            
            {/* Badge "SÉRIE" */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold tracking-wider 
                             bg-red-600 rounded-sm uppercase">
                Série
              </span>
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {seasons.length} Temporada{seasons.length > 1 ? 's' : ''}
              </span>
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {totalEpisodes} Episódios
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight
                          drop-shadow-2xl leading-none">
              {series.title}
            </h1>

            {/* Sinopse */}
            <p className="text-base md:text-lg text-gray-200 max-w-2xl leading-relaxed
                         line-clamp-3 md:line-clamp-4">
              {series.sinopsis}
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/assistir/${firstEpisode?.id}`}
                className="group flex items-center gap-3 px-8 py-3 
                          bg-white text-black font-bold rounded-md
                          hover:bg-white/80 transition-all duration-200
                          hover:scale-105 active:scale-95
                          shadow-lg shadow-white/20"
              >
                <PlayIcon />
                <span>Assistir</span>
              </Link>
              
              <button
                className="group flex items-center gap-3 px-8 py-3 
                          bg-gray-500/50 backdrop-blur-sm font-bold rounded-md
                          hover:bg-gray-500/70 transition-all duration-200
                          hover:scale-105 active:scale-95
                          border border-white/10"
              >
                <InfoIcon />
                <span>Mais Informações</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*                     SEÇÃO DE EPISÓDIOS                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pb-16 -mt-16">
        
        {seasons.map((seasonNumber) => (
          <div key={seasonNumber} className="mb-12">
            
            {/* Cabeçalho da Temporada */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                <span className="w-1 h-8 bg-red-600 rounded-full"></span>
                Temporada {seasonNumber}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({episodesBySeason[seasonNumber].length} episódios)
                </span>
              </h2>
            </div>

            {/* Grid de Episódios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {episodesBySeason[seasonNumber].map((ep, index) => (
                <Link 
                  href={`/assistir/${ep.id}`} 
                  key={ep.id}
                  className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden
                            hover:bg-[#2a2a2a] transition-all duration-300
                            hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50
                            focus:outline-none focus:ring-2 focus:ring-red-500
                            border border-white/5 hover:border-white/10"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Thumbnail do Episódio */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900
                                overflow-hidden">
                    {/* Placeholder visual quando não há thumbnail */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl font-black text-white/10">
                        {seasonNumber}.{ep.episode_number}
                      </div>
                    </div>
                    
                    {/* Overlay escuro no hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 
                                  transition-all duration-300" />
                    
                    {/* Ícone de Play centralizado no hover */}
                    <div className="absolute inset-0 flex items-center justify-center 
                                  opacity-0 group-hover:opacity-100 transition-all duration-300
                                  transform scale-50 group-hover:scale-100">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center 
                                    justify-center shadow-lg">
                        <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Badge do número do episódio */}
                    <div className="absolute top-2 right-2 px-2 py-1 
                                  bg-black/70 backdrop-blur-sm rounded text-xs font-bold
                                  border border-white/10">
                      E{String(ep.episode_number).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Informações do Episódio */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white group-hover:text-red-400 
                                   transition-colors duration-200">
                        Episódio {ep.episode_number}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ClockIcon />
                        <span>45min</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2">
                      S{String(ep.season_number).padStart(2, '0')}E{String(ep.episode_number).padStart(2, '0')} • Clique para assistir
                    </p>

                    {/* Barra de progresso fake (visual) */}
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-3">
                      <div 
                        className="h-full bg-red-600 rounded-full transition-all duration-500
                                  group-hover:bg-red-500"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>

                  {/* Linha de destaque na borda inferior no hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 
                                bg-gradient-to-r from-red-600 to-orange-500
                                transform scale-x-0 group-hover:scale-x-100 
                                transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </div>
          </div>
        ))}

      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*                      FOOTER MINIMALISTA                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 px-6 md:px-12 lg:px-16 py-8">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>© 2024 Streaming Platform</p>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}