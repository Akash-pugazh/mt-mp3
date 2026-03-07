import { API_BASE_URL } from '../config';
import type { ApiEnvelope, MovieListData, SongsData } from '../types/api';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export async function listLatestMovies(page = 1): Promise<MovieListData> {
  const data = await fetchJson<ApiEnvelope<MovieListData>>(
    `/api/v1/movies?source=latest-updates&page=${page}`,
  );
  return data.data;
}

export async function getMovieSongs(slug: string): Promise<SongsData> {
  const data = await fetchJson<ApiEnvelope<SongsData>>(`/api/v1/movies/${encodeURIComponent(slug)}/songs`);
  return data.data;
}
