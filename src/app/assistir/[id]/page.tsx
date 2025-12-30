import pool from '@/lib/db';
import Player from '@/components/Player'; 
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PaginaAssistir({ params }: { params: { id: string } }) {
  console.log('--- INICIANDO PÁGINA DE ASSISTIR ---');
  console.log('Parâmetros da URL recebidos:', params);

  const id = Number(params.id);
  console.log('ID convertido para número:', id);

  if (isNaN(id)) {
    console.log('ERRO: ID não é um número. Mostrando 404.');
    return notFound();
  }

  try {
    console.log(`Executando query no banco: SELECT * FROM filmes WHERE id = ${id}`);
    
    // Usando uma query mais robusta para evitar problemas de tipo
    const { rows } = await pool.query('SELECT * FROM filmes WHERE id = $1::integer', [id]);
    const filme = rows[0];

    console.log('Resultado da busca no banco:', filme || 'Nenhum filme encontrado.');

    if (!filme) {
      console.log('ERRO: Nenhum filme encontrado com este ID. Mostrando 404.');
      return notFound();
    }

    console.log('Filme encontrado! Renderizando a página...');
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
    console.error('--- ERRO CRÍTICO NA CONEXÃO COM O BANCO ---', error);
    // Em caso de erro de conexão, também mostramos 404 para não expor detalhes
    return notFound();
  }
}