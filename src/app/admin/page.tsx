// src/app/admin/page.tsx
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default function AdminPage() {

  // Esta função roda EXCLUSIVAMENTE no servidor (Server Action)
  async function criarFilme(formData: FormData) {
    'use server'

    // 1. Pegar os dados do formulário
    const senha = formData.get('senha') as string;
    const titulo = formData.get('titulo') as string;
    const sinopse = formData.get('sinopse') as string;
    const capa_url = formData.get('capa_url') as string;
    const video_url = formData.get('video_url') as string;
    const categoria = formData.get('categoria') as string;

    // 2. Verificar segurança
    if (senha !== process.env.ADMIN_PASSWORD) {
      // Se quiser ser mais chique, poderia retornar erro, mas aqui vamos redirecionar
      throw new Error('Senha incorreta!');
    }

    // 3. Inserir no Banco de Dados
    await pool.query(
      `INSERT INTO filmes (titulo, sinopse, capa_url, video_url, categoria) 
       VALUES ($1, $2, $3, $4, $5)`,
      [titulo, sinopse, capa_url, video_url, categoria]
    );

    // 4. Atualizar a Home para o filme aparecer na hora e limpar cache
    revalidatePath('/');
    
    // 5. Redirecionar para a Home
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-yellow-400 text-center">Adicionar Novo Filme</h1>
        
        <form action={criarFilme} className="space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Título do Filme</label>
            <input 
              name="titulo" 
              required 
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-400 outline-none" 
              placeholder="Ex: Matrix"
            />
          </div>

          {/* Sinopse */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Sinopse</label>
            <textarea 
              name="sinopse" 
              required 
              rows={3}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-400 outline-none" 
              placeholder="Resumo do filme..."
            />
          </div>

          {/* Link da Capa */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">URL da Capa (Imagem)</label>
            <input 
              name="capa_url" 
              type="url"
              required 
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-400 outline-none" 
              placeholder="https://..."
            />
          </div>

          {/* Link do Vídeo (O arquivo .mp4) */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">URL do Vídeo (.mp4)</label>
            <input 
              name="video_url" 
              type="url"
              required 
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-400 outline-none" 
              placeholder="https://meu-bucket.r2.dev/filme.mp4"
            />
          </div>

          {/* Categoria (Opcional) */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Categoria</label>
            <input 
              name="categoria" 
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-400 outline-none" 
              placeholder="Ação, Drama..."
            />
          </div>

          {/* Senha de Admin (Segurança) */}
          <div className="pt-4 border-t border-gray-700">
            <label className="block text-sm mb-1 text-yellow-400 font-bold">Senha de Administrador</label>
            <input 
              name="senha" 
              type="password"
              required 
              className="w-full p-2 rounded bg-gray-700 border border-red-500 focus:border-red-400 outline-none" 
              placeholder="Sua senha definida no .env"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded transition-colors mt-4"
          >
            Salvar Filme
          </button>
        </form>
      </div>
    </div>
  );
}