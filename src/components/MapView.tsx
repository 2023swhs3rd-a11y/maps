import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Lang, Place, WorkType } from '../types';
import { tr } from '../i18n';

export const TYPE_COLOR: Record<WorkType, string> = {
  drama: '#e8590c',
  film: '#3b5bdb',
  literature: '#2f9e44',
};

// 작품 유형별 작은 글리프(TV / 필름 / 책)
export const GLYPH: Record<WorkType, string> = {
  drama: '<rect x="7" y="7.5" width="10" height="7" rx="1.2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M10 17h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  film: '<rect x="7" y="7" width="10" height="9" rx="1.2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M10.5 9.6v3.8l3.2-1.9z" fill="#fff"/>',
  literature: '<path d="M12 9c-1.5-1.1-3.2-1.4-5-1.2v7.6c1.8-.2 3.5.1 5 1.2 1.5-1.1 3.2-1.4 5-1.2V7.8c-1.8-.2-3.5.1-5 1.2zM12 9v7.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>',
};

const iconCache = new Map<string, L.DivIcon>();
function pin(type: WorkType, state: 'normal' | 'selected' | 'dim', num?: number) {
  const key = `${type}|${state}|${num ?? ''}`;
  let ic = iconCache.get(key);
  if (ic) return ic;
  const size = state === 'selected' ? 46 : 34;
  const color = TYPE_COLOR[type];
  const inner = num !== undefined
    ? `<text x="12" y="15.4" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${num}</text>`
    : GLYPH[type];
  ic = L.divIcon({
    className: `pin pin-${state}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
    tooltipAnchor: [0, -size + 4],
    html: `<svg viewBox="0 0 24 26" width="${size}" height="${size}"><path d="M12 25s-8.5-8.2-8.5-14.2A8.5 8.5 0 0 1 20.5 10.8C20.5 16.8 12 25 12 25z" fill="${color}" stroke="#fff" stroke-width="1.5"/>${inner}</svg>`,
  });
  iconCache.set(key, ic);
  return ic;
}

const userIcon = L.divIcon({ className: 'user-dot', iconSize: [22, 22], iconAnchor: [11, 11], html: '<span></span>' });

/** 사이드 패널(데스크톱)과 하단 시트(모바일)에 가려지지 않게 여백을 두고 맞춥니다. */
function padding(): { tl: L.PointExpression; br: L.PointExpression } {
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  return mobile
    ? { tl: [40, 130], br: [40, Math.round(window.innerHeight * 0.5)] }
    : { tl: [480, 60], br: [80, 60] };
}

function FitTo({ points, focus, fitKey }: { points: [number, number][]; focus?: [number, number]; fitKey: string }) {
  const map = useMap();
  useEffect(() => {
    const { tl, br } = padding();
    if (focus) {
      const z = Math.max(map.getZoom(), 14);
      // 패딩만큼 중심을 옮겨서, 보이는 영역의 가운데에 오게 합니다
      const size = map.getSize();
      const tlp = L.point(tl), brp = L.point(br);
      const offset = L.point((tlp.x - brp.x) / 2, (tlp.y - brp.y) / 2);
      const target = map.unproject(map.project(focus, z).subtract(offset), z);
      if (size.x > 0) map.flyTo(target, z, { duration: 0.7 });
    } else if (points.length === 1) {
      map.flyToBounds(L.latLngBounds([points[0], points[0]]), { paddingTopLeft: tl, paddingBottomRight: br, maxZoom: 13, duration: 0.7 });
    } else if (points.length > 1) {
      map.flyToBounds(L.latLngBounds(points), { paddingTopLeft: tl, paddingBottomRight: br, maxZoom: 14, duration: 0.7 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  return null;
}

function useDark() {
  const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : undefined;
  const [dark, setDark] = useState(!!mq?.matches);
  useEffect(() => {
    if (!mq) return;
    const f = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [mq]);
  return dark;
}

export interface MapPlace { place: Place; type: WorkType; num?: number }

export function MapView(props: {
  lang: Lang;
  items: MapPlace[];
  selectedId?: string;
  onSelect: (p: Place) => void;
  route?: [number, number][];
  user?: [number, number];
  radiusKm?: number;
  fitKey: string;
  children?: ReactNode;
}) {
  const { items, selectedId, onSelect, route, user, radiusKm, lang, fitKey, children } = props;
  const dark = useDark();
  const points = useMemo<[number, number][]>(() => {
    const pts = items.map((i) => [i.place.lat, i.place.lng] as [number, number]);
    if (user) pts.push(user);
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  const sel = items.find((i) => i.place.id === selectedId)?.place;

  return (
    <MapContainer center={[36.3, 127.9]} zoom={7} minZoom={6} className="map" zoomControl={false} attributionControl>
      <TileLayer
        key={dark ? 'dark' : 'light'}
        url={`https://{s}.basemaps.cartocdn.com/rastertiles/${dark ? 'dark_all' : 'voyager'}/{z}/{x}/{y}{r}.png`}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <FitTo points={points} focus={sel ? [sel.lat, sel.lng] : undefined} fitKey={fitKey + '|' + (selectedId ?? '')} />
      {route && route.length > 1 && (
        <Polyline positions={route} pathOptions={{ color: dark ? '#ced4da' : '#495057', weight: 2.5, dashArray: '2 7', lineCap: 'round', opacity: 0.8 }} />
      )}
      {user && radiusKm && <Circle center={user} radius={radiusKm * 1000} pathOptions={{ color: '#4c6ef5', weight: 1, fillColor: '#4c6ef5', fillOpacity: 0.06 }} />}
      {user && <Marker position={user} icon={userIcon} interactive={false} zIndexOffset={-100} />}
      {items.map(({ place, type, num }) => {
        const state = place.id === selectedId ? 'selected' : selectedId ? 'dim' : 'normal';
        return (
          <Marker
            key={place.id + state + (num ?? '')}
            position={[place.lat, place.lng]}
            icon={pin(type, state, num)}
            title={tr(place.name, lang)}
            alt={tr(place.name, lang)}
            keyboard
            zIndexOffset={state === 'selected' ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(place) }}
          >
            {state === 'selected' && (
              <Tooltip permanent direction="top" className="pin-label" offset={[0, -2]}>{tr(place.name, lang)}</Tooltip>
            )}
          </Marker>
        );
      })}
      {children}
    </MapContainer>
  );
}

/** 지도 위 오른쪽 아래의 둥근 버튼들(확대/축소/내 위치) */
export function MapControls({ onLocate, locating, labels }: { onLocate: () => void; locating: boolean; labels: { zoomIn: string; zoomOut: string; locate: string } }) {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) { L.DomEvent.disableClickPropagation(ref.current); L.DomEvent.disableScrollPropagation(ref.current); }
  }, []);
  return (
    <div className="map-ctrls" ref={ref}>
      <div className="ctrl-group">
        <button aria-label={labels.zoomIn} onClick={() => map.zoomIn()}>+</button>
        <button aria-label={labels.zoomOut} onClick={() => map.zoomOut()}>−</button>
      </div>
      <button className={`ctrl-locate ${locating ? 'busy' : ''}`} aria-label={labels.locate} title={labels.locate} onClick={onLocate}>
        <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  );
}
