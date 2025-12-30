// src/app/admin/actions.ts
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Ação para BUSCAR séries enquanto digita
export async function searchSeries(query: string) {
  if (!query) return [];
  const { rows } = await pool.query(
    "SELECT id, title FROM series WHERE title ILIKE $1 LIMIT 10",
    [`%${query}%`]
  );
  return rows;
}

// Ação para ADICIONAR o item (série nova ou episódio)
export async function addItem(formData: FormData) {
  const password = formData.get('password') as string;
  if (password !== process.env.ADMIN_PASSWORD) {
    throw new Error('Senha incorreta!');
  }

  const existingSeriesId = formData.get('series_id') as string;
  const season_number = Number(formData.get('season_number'));
  const episode_number = Number(formData.get('episode_number'));
  const video_url = formData.get('video_url') as string;

  let seriesIdToUse: number;

  if (existingSeriesId) {
    // Caso 2: Adicionando episódio a uma série existente
    seriesIdToUse = Number(existingSeriesId);
  } else {
    // Caso 1: Criando uma série nova E o primeiro episódio
    const title = formData.get('title') as string;
    const sinopsis = formData.get('sinopsis') as string;
    const cover_url = formData.get('cover_url') as string;
    
    const newSeriesResult = await pool.query(
      "INSERT INTO series (title, sinopsis, cover_url) VALUES ($1, $2, $3) RETURNING id",
      [title, sinopsis, cover_url]
    );
    seriesIdToUse = newSeriesResult.rows[0].id;
  }

  // Inserir o episódio
  await pool.query(
    `INSERT INTO episodes (series_id, season_number, episode_number, video_url) 
     VALUES ($1, $2, $3, $4)`,
    [seriesIdToUse, season_number, episode_number, video_url]
  );

  revalidatePath('/');
  redirect('/');
}