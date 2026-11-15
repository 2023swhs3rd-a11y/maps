export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export type DirApp = 'kakao' | 'naver' | 'google' | 'apple';

/** 나라별 길찾기 앱. 카카오맵·네이버 지도는 일본 길찾기를 지원하지 않습니다. */
export function directionLinks(name: string, lat: number, lng: number, country: 'KR' | 'JP' = 'KR'): { app: DirApp; url: string }[] {
  const n = encodeURIComponent(name);
  const google = { app: 'google' as const, url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` };
  if (country === 'JP') {
    return [google, { app: 'apple', url: `https://maps.apple.com/?daddr=${lat},${lng}&q=${n}` }];
  }
  return [
    { app: 'kakao', url: `https://map.kakao.com/link/to/${n},${lat},${lng}` },
    { app: 'naver', url: `https://map.naver.com/p/search/${n}?c=${lng},${lat},15,0,0,0,dh` },
    google,
  ];
}
