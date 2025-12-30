// src/app/assistir/[id]/page.tsx

import pool from '@/lib/db';
// ✅ Voltamos a importar o seu Player simples!
import Player from '@/components/Player'; 
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PaginaAssistir({ params: paramsPromise }: { params: any }) {
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

    // ✅ Voltamos para a estrutura original da página
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
          {/* ✅ Usando o seu componente <Player /> novamente */}
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