import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MLMap, type StyleSpecification, type ExpressionSpecification } from 'maplibre-gl';
import type { Lang, Place, WorkType } from '../types';
import { tr } from '../i18n';

export const TYPE_COLOR: Record<WorkType, string> = {
  drama: '#e8590c',
  film: '#3b5bdb',
  anime: '#c2255c',
  literature: '#2f9e44',
};

// 작품 유형별 작은 글리프(TV / 필름 / 책)
export const GLYPH: Record<WorkType, string> = {
  drama: '<rect x="7" y="7.5" width="10" height="7" rx="1.2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M10 17h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  film: '<rect x="7" y="7" width="10" height="9" rx="1.2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M10.5 9.6v3.8l3.2-1.9z" fill="#fff"/>',
  anime: '<path d="M12 6.8l1.5 3.7 3.7 1.5-3.7 1.5L12 17.2l-1.5-3.7L6.8 12l3.7-1.5z" fill="#fff"/>',
  literature: '<path d="M12 9c-1.5-1.1-3.2-1.4-5-1.2v7.6c1.8-.2 3.5.1 5 1.2 1.5-1.1 3.2-1.4 5-1.2V7.8c-1.8-.2-3.5.1-5 1.2zM12 9v7.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>',
};

/** OpenFreeMap: 키 없이 쓰는 무료 벡터 타일(OpenStreetMap 데이터) */
// 지도 가독성을 위해 다크 모드에서도 밝고 색이 분명한 liberty 스타일을 씁니다.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/**
 * 지도 글자 언어. OSM의 name:xx 번역을 우선 쓰고,
 * 번역이 없으면 로마자 표기(name:latin) → 원래 이름 순으로 대체합니다.
 */
function labelExpr(lang: Lang): ExpressionSpecification {
  if (lang === 'ko') return ['coalesce', ['get', 'name:ko'], ['get', 'name']];
  return ['coalesce', ['get', `name:${lang}`], ['get', 'name:latin'], ['get', 'name_en'], ['get', 'name']];
}

function applyLanguage(map: MLMap, lang: Lang) {
  const style = map.getStyle() as StyleSpecification | undefined;
  if (!style) return;
  for (const layer of style.layers) {
    if (layer.type !== 'symbol') continue;
    const tf = layer.layout?.['text-field'];
    // 도로 번호(ref)·건물 번호 등은 그대로 두고, 이름을 쓰는 레이어만 바꿉니다
    if (tf === undefined || !JSON.stringify(tf).includes('name')) continue;
    map.setLayoutProperty(layer.id, 'text-field', labelExpr(lang));
  }
}

function pinHTML(type: WorkType, state: 'normal' | 'selected' | 'dim', num: number | undefined, label: string) {
  const size = state === 'selected' ? 46 : 34;
  const inner = num !== undefined
    ? `<text x="12" y="15.4" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${num}</text>`
    : GLYPH[type];
  const tag = state === 'selected' ? `<span class="pin-label">${label.replace(/</g, '&lt;')}</span>` : '';
  return `${tag}<svg viewBox="0 0 24 26" width="${size}" height="${size}"><path d="M12 25s-8.5-8.2-8.5-14.2A8.5 8.5 0 0 1 20.5 10.8C20.5 16.8 12 25 12 25z" fill="${TYPE_COLOR[type]}" stroke="#fff" stroke-width="1.5"/>${inner}</svg>`;
}

/** 반경 원을 지도에 그리기 위한 다각형 */
function circle(center: [number, number], km: number, steps = 72): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lat, lng] = center;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const dLat = (km / 111.32) * Math.sin(a);
    const dLng = (km / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.cos(a);
    coords.push([lng + dLng, lat + dLat]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } };
}

/** 사이드 패널(데스크톱)과 하단 시트(모바일)에 가려지지 않는 여백 */
function padding() {
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  return mobile
    ? { top: 170, left: 40, right: 72, bottom: Math.round(window.innerHeight * 0.5) + 48 }
    : { top: 60, left: 480, right: 80, bottom: 60 };
}

export interface MapPlace { place: Place; type: WorkType; num?: number }

interface Props {
  lang: Lang;
  items: MapPlace[];
  selectedId?: string;
  onSelect: (p: Place) => void;
  user?: [number, number];
  radiusKm?: number;
  fitKey: string;
  onLocate: () => void;
  locating: boolean;
  labels: { zoomIn: string; zoomOut: string; locate: string };
}

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export function MapView(props: Props) {
  const { items, selectedId, onSelect, user, radiusKm, lang, fitKey } = props;
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap>();
  const markers = useRef(new Map<string, maplibregl.Marker>());
  const userMarker = useRef<maplibregl.Marker>();
  const [ready, setReady] = useState(0); // 스타일이 (다시) 로드될 때마다 증가
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // ── 지도 생성 ──
  useEffect(() => {
    const map = new maplibregl.Map({
      container: el.current!,
      style: STYLE_URL,
      center: [127.9, 36.3],
      zoom: 6.2,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: { compact: true },
      // 한글·한자·가나는 기기 글꼴로 그려서 글리프 다운로드를 줄입니다
      localIdeographFontFamily: "'Pretendard Variable', 'Apple SD Gothic Neo', 'Hiragino Sans', 'PingFang SC', 'Noto Sans CJK KR', sans-serif",
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.on('style.load', () => setReady((n) => n + 1));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = undefined; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 언어 ──
  useEffect(() => {
    const map = mapRef.current;
    if (map && ready) applyLanguage(map, lang);
  }, [lang, ready]);

  // ── 반경 레이어 (스타일이 바뀌면 다시 추가) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (!map.getSource('radius')) {
      map.addSource('radius', { type: 'geojson', data: EMPTY });
      map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-color': '#4c6ef5', 'fill-opacity': 0.07 } });
      map.addLayer({ id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-color': '#4c6ef5', 'line-width': 1.2, 'line-opacity': 0.6 } });
    }
    (map.getSource('radius') as maplibregl.GeoJSONSource).setData(user && radiusKm ? circle(user, radiusKm) : EMPTY);
  }, [ready, user, radiusKm]);

  // ── 장소 마커 ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const keep = new Set<string>();
    for (const { place, type, num } of items) {
      const state = place.id === selectedId ? 'selected' : selectedId ? 'dim' : 'normal';
      const key = place.id;
      keep.add(key);
      const html = pinHTML(type, state, num, tr(place.name, lang));
      let m = markers.current.get(key);
      if (!m) {
        const node = document.createElement('button');
        node.type = 'button';
        node.addEventListener('click', (e) => { e.stopPropagation(); onSelectRef.current(place); });
        m = new maplibregl.Marker({ element: node, anchor: 'bottom' }).setLngLat([place.lng, place.lat]).addTo(map);
        markers.current.set(key, m);
      }
      const node = m.getElement();
      if (node.dataset.html !== html) { node.innerHTML = html; node.dataset.html = html; }
      node.className = `pin pin-${state}`;
      node.setAttribute('aria-label', tr(place.name, lang));
      node.style.zIndex = state === 'selected' ? '3' : state === 'normal' ? '2' : '1';
    }
    for (const [key, m] of markers.current) {
      if (!keep.has(key)) { m.remove(); markers.current.delete(key); }
    }
  }, [items, selectedId, lang]);

  // ── 내 위치 ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!user) { userMarker.current?.remove(); userMarker.current = undefined; return; }
    if (!userMarker.current) {
      const node = document.createElement('div');
      node.className = 'user-dot';
      node.innerHTML = '<span></span>';
      userMarker.current = new maplibregl.Marker({ element: node }).setLngLat([user[1], user[0]]).addTo(map);
    } else userMarker.current.setLngLat([user[1], user[0]]);
  }, [user]);

  // ── 화면 맞추기 ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pad = padding();
    const sel = items.find((i) => i.place.id === selectedId)?.place;
    if (sel) {
      map.flyTo({ center: [sel.lng, sel.lat], zoom: Math.max(map.getZoom(), 14), padding: pad, duration: 900 });
      return;
    }
    const pts = items.map((i) => [i.place.lng, i.place.lat] as [number, number]);
    if (user) pts.push([user[1], user[0]]);
    if (pts.length === 0) return;
    const b = pts.reduce((acc, p) => acc.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]));
    map.fitBounds(b, { padding: pad, maxZoom: pts.length === 1 ? 13 : 14, duration: 900 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, selectedId]);

  return (
    <>
      <div ref={el} className="map" />
      <div className="map-ctrls">
        <div className="ctrl-group">
          <button aria-label={props.labels.zoomIn} onClick={() => mapRef.current?.zoomIn()}>+</button>
          <button aria-label={props.labels.zoomOut} onClick={() => mapRef.current?.zoomOut()}>−</button>
        </div>
        <button className={`ctrl-locate ${props.locating ? 'busy' : ''}`} aria-label={props.labels.locate} title={props.labels.locate} onClick={props.onLocate}>
          <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="4" fill="currentColor" /><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
    </>
  );
}
