// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { searchSeries, addItem } from './actions';

type Series = { id: number; title: string };

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setResults([]);
      return;
    }
    
    const handler = setTimeout(() => {
      searchSeries(searchTerm).then(setResults);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setSearchTerm(series.title);
    setResults([]);
  };
  
  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await addItem(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ocorreu um erro.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center p-4">
      <form action={handleFormSubmit} className="bg-gray-800 p-8 rounded-lg w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-center text-yellow-400">Adicionar Item</h1>

        {/* Campo de Busca */}
        <div className="relative">
          <label className="block text-sm mb-1">Buscar Série Existente (ou digite um novo título)</label>
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedSeries(null);
            }}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="Digite 'Stran' para buscar..."
          />
          {results.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-600 rounded-b-lg border border-t-0 border-gray-500">
              {results.map((series) => (
                <li key={series.id} onClick={() => handleSelectSeries(series)} className="px-4 py-2 hover:bg-yellow-500 hover:text-black cursor-pointer">
                  {series.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Campos para NOVA série (condicional) */}
        {!selectedSeries && (
          <>
            <input name="title" value={searchTerm} type="hidden" /> {/* Passa o título novo */}
            <div>
              <label>Sinopse da Nova Série</label>
              <textarea name="sinopsis" required className="w-full p-2 rounded bg-gray-700" />
            </div>
            <div>
              <label>URL da Capa da Nova Série</label>
              <input name="cover_url" type="url" required className="w-full p-2 rounded bg-gray-700" />
            </div>
          </>
        )}

        {/* Campos do EPISÓDIO (sempre visíveis) */}
        {selectedSeries && <input type="hidden" name="series_id" value={selectedSeries.id} />}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Nº da Temporada</label>
            <input name="season_number" type="number" required className="w-full p-2 rounded bg-gray-700" />
          </div>
          <div>
            <label>Nº do Episódio</label>
            <input name="episode_number" type="number" required className="w-full p-2 rounded bg-gray-700" />
          </div>
        </div>
        <div>
          <label>URL do Vídeo (.mp4)</label>
          <input name="video_url" type="url" required className="w-full p-2 rounded bg-gray-700" />
        </div>

        {/* Senha e Botão */}
        <div className="pt-4 border-t border-gray-700">
          <label className="font-bold text-yellow-400">Senha de Admin</label>
          <input name="password" type="password" required className="w-full p-2 rounded bg-gray-700 border-red-500" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-500 text-black font-bold py-3 rounded disabled:bg-gray-500">
          {isSubmitting ? 'Salvando...' : 'Salvar Item'}
        </button>
      </form>
    </div>
  );
}