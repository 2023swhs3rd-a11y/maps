import raw from './enrich.json';
import type { Lang } from '../types';

/** scripts/enrich.mjs 가 만드는 외부 API 보강 데이터 */
export interface WorkExtra {
  tmdbId: number;
  kind: 'movie' | 'tv';
  url: string;
  title: Partial<Record<Lang, string>>;
  overview: Partial<Record<Lang, string>>;
  genres: Partial<Record<Lang, string[]>>;
  poster: Partial<Record<Lang, string>>;
  backdrop?: string;
  rating?: number;
  network?: string;
  episodes?: number;
  runtime?: number;
  cast?: { name: string; character?: string; profile?: string }[];
  providers?: { name: string; logo: string }[];
  providersLink?: string;
}

export interface PlaceExtra {
  contentId: string;
  title: string;
  addr?: string;
  lat: number;
  lng: number;
  distKm: number;
  image?: string;
  thumb?: string;
  /** 공공누리 유형 (Type1: 출처표시, Type3: 출처표시+변경금지) */
  license?: string;
}

interface Enrich { generatedAt?: string; works: Record<string, WorkExtra>; places: Record<string, PlaceExtra> }

const data = raw as unknown as Enrich;
export const workExtra = (id: string): WorkExtra | undefined => data.works?.[id];
export const placeExtra = (id: string): PlaceExtra | undefined => data.places?.[id];
export const enrichedAt = data.generatedAt;

export const tmdbImg = (path: string | undefined, size: 'w92' | 'w185' | 'w342' | 'w780' = 'w342') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined;

/** 언어별 값이 없으면 영어 → 한국어 순으로 대체 */
export function pick<T>(m: Partial<Record<Lang, T>> | undefined, lang: Lang): T | undefined {
  return m?.[lang] ?? m?.en ?? m?.ko;
}

/** 이름으로 찾은 TourAPI 결과가 우리 좌표에서 3km 이내면 같은 장소로 보고 공식 좌표를 씁니다 */
export const officialCoord = (e?: PlaceExtra) => !!e && e.distKm <= 3;
