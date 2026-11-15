import type { Place } from '../types';

/** 작품별로 어디까지 봤는지(segments 인덱스). 없으면 '아직 안 봄'입니다. */
export type Progress = Record<string, number | undefined>;

export type Visibility =
  | 'full'    // 장소와 상세 설명을 모두 공개
  | 'safe'    // 장소는 공개하고 설명은 안전 버전만
  | 'hidden'; // 장소 자체를 숨김(검색·지도·목록에서 제외)

/**
 * 스포일러 규칙
 * - 사용자가 등장 시점 이상까지 봤거나 '전체 공개'를 켰다면 → full
 * - 등급 0 → full (애초에 스포일러가 아님)
 * - 등급 1 → safe
 * - 등급 2 → hidden
 */
export function visibilityOf(place: Place, progress: Progress, revealAll: boolean): Visibility {
  const seen = progress[place.workId];
  if (revealAll || (seen !== undefined && seen >= place.appearsAt)) return 'full';
  if (place.spoiler === 0) return 'full';
  if (place.spoiler === 1) return 'safe';
  return 'hidden';
}

export function partition(list: Place[], progress: Progress, revealAll: boolean) {
  const visible: { place: Place; vis: Exclude<Visibility, 'hidden'> }[] = [];
  let hidden = 0;
  for (const place of list) {
    const vis = visibilityOf(place, progress, revealAll);
    if (vis === 'hidden') hidden++;
    else visible.push({ place, vis });
  }
  return { visible, hidden };
}
