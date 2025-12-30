import pool from '@/lib/db';
import Player from '@/components/Player'; 
import Link from 'next/link';
import { notFound } from 'next/navigation';

// A tipagem das props é um pouco mais genérica para aceitar a "Promise"
export default async function PaginaAssistir({ params: paramsPromise }: { params: any }) {
  
  // ✅ A CORREÇÃO MÁGICA ESTÁ AQUI!
  // Esperamos a "promessa" dos parâmetros ser resolvida.
  const params = await paramsPromise;
  
  const id = Number(params.id);

  if (isNaN(id)) {
    // Se, mesmo depois de esperar, o ID não for um número, mostramos 404.
    return notFound();
  }

  try {
    const { rows } = await pool.query('SELECT * FROM filmes WHERE id = $1', [id]);
    const filme = rows[0];

    if (!filme) {
      return notFound();
    }

    // Se tudo deu certo, mostramos a página
    return (
      <div className="bg-black min-h-screen text-white flex flex-col">
        <div className="absolute top-4 left-4 z-10">
          <Link 
            href="/" 
            className="bg-gray-800 px-4 py-2 rounded text-white hover:bg-gray-700 focus:bg-yellow-500 focus:text-black outline-none font-bold"
          >
            ← Voltar
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Player src={filme.video_url} poster={filme.capa_url} />
        </div>
        <div className="p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-2">{filme.titulo}</h1>
          <p className="text-gray-400">{filme.sinopse || 'Sem sinopse disponível.'}</p>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Erro ao buscar filme no banco:', error);
    return notFound();
  }
}