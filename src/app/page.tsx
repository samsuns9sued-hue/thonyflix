import Link from 'next/link';
import pool from '@/src/lib/db'; // Importa nossa conexão

// Define o tipo dos dados para o TypeScript não reclamar
type Filme = {
  id: number;
  titulo: string;
  sinopse: string;
  capa_url: string;
  video_url: string;
};

// Note o "async" aqui na função principal
export default async function Home() {
  
  // 1. Conecta no banco e pede todos os filmes
  // Se não tiver filmes cadastrados, a lista virá vazia
  const { rows: filmes } = await pool.query<Filme>('SELECT * FROM filmes ORDER BY criado_em DESC');

  return (
    <main className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl mb-8 font-bold">Meus Filmes</h1>
      
      {filmes.length === 0 ? (
        <p className="text-gray-400">Nenhum filme encontrado no banco de dados.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filmes.map((filme) => (
            <Link 
              href={`/assistir/${filme.id}`} 
              key={filme.id}
              className="block group focus:scale-105 transition-transform duration-200 outline-none"
            >
              <div className="border-4 border-transparent group-focus:border-yellow-400 rounded-lg overflow-hidden relative aspect-[2/3]">
                {/* Usando img normal para simplicidade na TV, mas Image do Next é melhor se puder configurar */}
                <img 
                  src={filme.capa_url} 
                  alt={filme.titulo} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-center text-sm md:text-base font-semibold group-focus:text-yellow-400 truncate">
                {filme.titulo}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}