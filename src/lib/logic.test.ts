import { describe, expect, it } from 'vitest';
import { places } from '../data/places';
import { works } from '../data/works';
import { visibilityOf } from './spoiler';
import { searchPlaces, searchWorks, toChoseong } from './search';

const jecheon = places.find((p) => p.id === 'buckwheat-jecheon')!;
const stairs = places.find((p) => p.id === 'parasite-stairs')!;

describe('스포일러 규칙', () => {
  it('2등급 장소는 아직 안 봤으면 숨김', () => {
    expect(visibilityOf(jecheon, {}, false)).toBe('hidden');
    expect(visibilityOf(jecheon, { buckwheat: 2 }, false)).toBe('hidden');
  });
  it('등장 지점까지 보면 공개', () => {
    expect(visibilityOf(jecheon, { buckwheat: 3 }, false)).toBe('full');
  });
  it('1등급은 장소만 공개, 설명은 잠금', () => {
    expect(visibilityOf(stairs, {}, false)).toBe('safe');
  });
  it('전체 공개 토글', () => {
    expect(visibilityOf(jecheon, {}, true)).toBe('full');
  });
});

describe('검색', () => {
  it('스포일러 내용으로 검색해도 숨겨진 장소는 나오지 않음', () => {
    expect(searchPlaces('제천', places, {}, false)).toHaveLength(0);
    expect(searchPlaces('왼손잡이', places, {}, false)).toHaveLength(0);
    expect(searchPlaces('제천', places, { buckwheat: 3 }, false).map((p) => p.id)).toContain('buckwheat-jecheon');
  });
  it('1등급 장소의 상세 설명은 검색 대상이 아님', () => {
    expect(searchPlaces('폭우', places, {}, false)).toHaveLength(0);
    expect(searchPlaces('폭우', places, { parasite: 2 }, false)).toHaveLength(1);
  });
  it('초성·영문·일본어 제목 검색', () => {
    expect(toChoseong('기생충')).toBe('ㄱㅅㅊ');
    expect(searchWorks('ㄱㅅㅊ', works)[0].id).toBe('parasite');
    expect(searchWorks('parasite', works)[0].id).toBe('parasite');
    expect(searchWorks('トッケビ', works)[0].id).toBe('goblin');
    expect(searchWorks('鬼怪', works)[0].id).toBe('goblin');
  });
});

describe('데이터 무결성', () => {
  it('모든 장소가 실제 작품과 유효한 구간을 가리킴', () => {
    for (const p of places) {
      const w = works.find((x) => x.id === p.workId);
      expect(w, p.id).toBeDefined();
      expect(p.appearsAt).toBeLessThan(w!.segments.length);
      expect(p.lat).toBeGreaterThan(33); expect(p.lat).toBeLessThan(39);
      expect(p.lng).toBeGreaterThan(124); expect(p.lng).toBeLessThan(132);
    }
  });
});
