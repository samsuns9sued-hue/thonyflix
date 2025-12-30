import pool from '@/src/lib/db';
import Player from '@/components/Player'; // Certifique-se que seu Player.tsx está na pasta components
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PaginaAssistir({ params }: { params: { id: string } }) {
  // O Next.js já nos dá o ID pela URL
  const { id } = params;

  // Busca apenas o filme com esse ID
  const { rows } = await pool.query('SELECT * FROM filmes WHERE id = $1', [id]);
  const filme = rows[0];

  // Se o ID não existir no banco, mostra erro 404
  if (!filme) {
    return notFound();
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* Botão de Voltar (Importante para TV) */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/" 
          className="bg-gray-800 px-4 py-2 rounded text-white hover:bg-gray-700 focus:bg-yellow-500 focus:text-black outline-none font-bold"
        >
          ← Voltar
        </Link>
      </div>

      {/* O Player */}
      <div className="flex-1 flex items-center justify-center">
        <Player src={filme.video_url} poster={filme.capa_url} />
      </div>

      {/* Título e Sinopse abaixo do vídeo */}
      <div className="p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">{filme.titulo}</h1>
        <p className="text-gray-400">{filme.sinopse}</p>
      </div>
    </div>
  );
}