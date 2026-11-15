import type { L10n, Place, Work } from '../types';
import type { Progress } from './spoiler';
import { visibilityOf } from './spoiler';

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

/** '기생충' → 'ㄱㅅㅊ' (한글 음절이 아닌 문자는 그대로 둡니다) */
export function toChoseong(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.charCodeAt(0) - 0xac00;
    out += c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch;
  }
  return out;
}

const isChoseongOnly = (q: string) => /^[ㄱ-ㅎ\s]+$/.test(q);

export function normalize(s: string) {
  return s.toLowerCase().normalize('NFKC').replace(/[\s·\-_:'"()（）「」]/g, '');
}

/** 검색어가 텍스트에 얼마나 잘 맞는지 점수를 매깁니다(0이면 불일치). */
export function matchScore(query: string, texts: string[]): number {
  const q = normalize(query);
  if (!q) return 0;
  const cho = isChoseongOnly(query);
  let best = 0;
  for (const t of texts) {
    const n = normalize(cho ? toChoseong(t) : t);
    if (n === q) best = Math.max(best, 100);
    else if (n.startsWith(q)) best = Math.max(best, 80);
    else if (n.includes(q)) best = Math.max(best, 60);
  }
  return best;
}

const all = (l?: L10n) => (l ? [l.ko, l.en, l.ja ?? '', l.zh ?? ''] : []);

export function searchWorks(query: string, works: Work[]) {
  return works
    .map((w) => ({ w, s: matchScore(query, [...all(w.title), ...(w.aliases ?? []), ...all(w.creator)]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.w);
}

/**
 * 장소 검색. 숨겨진(스포일러 2등급) 장소는 아예 후보에서 빠지고,
 * 상세 설명(descFull)은 'full' 공개일 때만 검색 대상이 됩니다.
 * → 스포일러 내용을 검색어로 넣어도 결과가 나오지 않습니다.
 */
export function searchPlaces(query: string, places: Place[], progress: Progress, revealAll: boolean) {
  return places
    .map((p) => {
      const vis = visibilityOf(p, progress, revealAll);
      if (vis === 'hidden') return { p, s: 0 };
      const texts = [...all(p.name), ...all(p.address), ...all(p.descSafe)];
      if (vis === 'full') texts.push(...all(p.descFull));
      return { p, s: matchScore(query, texts) };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}
