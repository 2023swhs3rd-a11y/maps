export type Lang = 'ko' | 'en' | 'ja' | 'zh';
export const LANGS: Lang[] = ['ko', 'en', 'ja', 'zh'];

/** 다국어 문자열. ko·en은 필수, ja·zh가 없으면 en으로 대체합니다. */
export type L10n = { ko: string; en: string; ja?: string; zh?: string };

export type WorkType = 'drama' | 'film' | 'anime' | 'literature';

/** 나라 코드. 길찾기 앱·데이터 출처가 나라마다 다릅니다. */
export type Country = 'KR' | 'JP';
export const COUNTRIES: Country[] = ['KR', 'JP'];

/**
 * 스포일러 등급
 * 0: 안전. 홍보물·예고편 수준이라 진행도와 상관없이 늘 공개합니다.
 * 1: 경미. 장소는 공개하지만 상세 설명은 해당 지점까지 봐야 공개합니다.
 * 2: 핵심. 반전·결말과 관련되어 해당 지점까지 보기 전에는 장소 자체를 숨깁니다(검색 불가).
 */
export type SpoilerLevel = 0 | 1 | 2;

export interface Work {
  id: string;
  type: WorkType;
  title: L10n;
  /** 검색용 별칭(원제 로마자, 약칭 등) */
  aliases?: string[];
  year: number;
  creator: L10n; // 작가 또는 감독
  /** 진행 구간. 드라마는 '1화'…, 영화·소설은 '도입/전개/절정/결말' */
  segments: L10n[];
  /** 스포일러 없는 한두 문장 소개. 영화·드라마는 TMDB 줄거리가 있으면 그것을 우선 씁니다. */
  summary?: L10n;
  /** 작품이 만들어진 나라(TMDB 검색 언어). 기본값 KR */
  country?: Country;
  /** TMDB 검색 힌트. 생략하면 한국어 제목과 연도로 찾습니다. id를 알면 바로 지정합니다. */
  tmdb?: { id?: number; query?: string; kind?: 'movie' | 'tv' };
  /** 자동으로 가져온 데이터의 출처 */
  source?: 'wikidata';
  qid?: string;
  /** 인기도(위키백과 언어판 수). 목록 정렬에 씁니다. */
  popularity?: number;
}

export interface Place {
  id: string;
  workId: string;
  name: L10n;
  address: L10n;
  lat: number;
  lng: number;
  /** segments 배열의 인덱스. 이 구간에서 처음 등장합니다. */
  appearsAt: number;
  spoiler: SpoilerLevel;
  /** 스포일러 없는 설명 */
  descSafe: L10n;
  /** 스포일러가 포함될 수 있는 상세 설명 */
  descFull?: L10n;
  /** 'filming': 촬영지, 'setting': 작품 속 배경지, 'memorial': 기념관·문학관 */
  kind: 'filming' | 'setting' | 'memorial';
  /** 좌표·사실관계를 검수했는지 여부 */
  verified: boolean;
  /** 장소가 있는 나라. 기본값 KR */
  country?: Country;
  source?: 'wikidata';
  qid?: string;
  /** TourAPI 검색어(생략하면 장소 이름). 공식 관광지 이름과 다를 때 지정합니다. */
  tourKeyword?: string;
}
