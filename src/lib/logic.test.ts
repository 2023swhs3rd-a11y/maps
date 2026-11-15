import { describe, expect, it } from 'vitest';
import { places } from '../data/places';
import { works } from '../data/works';
import { visibilityOf } from './spoiler';
import { searchPlaces, searchWorks, toChoseong } from './search';
import { directionLinks } from './geo';

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

describe('일본', () => {
  it('일본 작품을 일본어·한국어·초성으로 찾음', () => {
    expect(searchWorks('君の名は', works)[0].id).toBe('your-name');
    expect(searchWorks('ㅅㄹㄷㅋ', works)[0].id).toBe('slam-dunk');
  });
  it('결말 장소(스가 신사)는 스포일러로 숨김', () => {
    expect(searchPlaces('스가', places, {}, false)).toHaveLength(0);
    expect(searchPlaces('스가', places, { 'your-name': 3 }, false)).toHaveLength(1);
  });
  it('일본 장소 길찾기는 카카오·네이버 대신 구글·애플', () => {
    expect(directionLinks('x', 35, 139, 'JP').map((l) => l.app)).toEqual(['google', 'apple']);
    expect(directionLinks('x', 37, 127).map((l) => l.app)).toEqual(['kakao', 'naver', 'google']);
  });
});

describe('데이터 무결성', () => {
  it('모든 장소가 실제 작품과 유효한 구간을 가리킴', () => {
    for (const p of places) {
      const w = works.find((x) => x.id === p.workId);
      expect(w, p.id).toBeDefined();
      expect(p.appearsAt).toBeLessThan(w!.segments.length);
      const [la0, la1, ln0, ln1] = (p.country ?? 'KR') === 'JP' ? [24, 46, 122, 154] : [33, 39, 124, 132];
      expect(p.lat, p.id).toBeGreaterThan(la0); expect(p.lat, p.id).toBeLessThan(la1);
      expect(p.lng, p.id).toBeGreaterThan(ln0); expect(p.lng, p.id).toBeLessThan(ln1);
    }
  });
});
