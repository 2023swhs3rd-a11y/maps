import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Country, Lang, Place, Work, WorkType } from './types';
import { COUNTRIES } from './types';
import { LANGS } from './types';
import { works, places as rawPlaces } from './data/index';
import { placeExtra, officialCoord } from './data/enrich';
import { WorkDetails, Sources } from './components/WorkDetails';
import { t, tr, LANG_LABEL, LANG_SHORT } from './i18n';
import { LangPicker, GlobeIcon } from './components/LangPicker';
import { partition, visibilityOf, type Progress, type Visibility } from './lib/spoiler';
import { searchPlaces, searchWorks } from './lib/search';
import { distanceKm, formatKm, directionLinks } from './lib/geo';
import { MapView, TYPE_COLOR, type MapPlace } from './components/MapView';
import { Sheet, type Snap } from './components/Sheet';
import { Cover, TypeDot, TypeIcon } from './components/Cover';

// ───────── 데이터 헬퍼 ─────────
// TourAPI에서 가까운 공식 좌표를 찾은 장소는 그 좌표를 씁니다
const places: Place[] = rawPlaces.map((p) => {
  const e = placeExtra(p.id);
  return officialCoord(e) ? { ...p, lat: e!.lat, lng: e!.lng } : p;
});
const workById = new Map(works.map((w) => [w.id, w]));
const placeById = new Map(places.map((p) => [p.id, p]));
const placesOf = (id: string) => places.filter((p) => p.workId === id).sort((a, b) => a.appearsAt - b.appearsAt);
const regionOf = (p: Place) => p.address.ko.split(' ').slice(0, 2).join(' ');
const SEOUL: [number, number] = [37.5663, 126.9779];
const RADII = [5, 20, 50, 150];
const SHELF_MAX = 15;
const TYPES: WorkType[] = ['drama', 'film', 'anime', 'literature'];
const countryOf = (p: Place): Country => p.country ?? 'KR';
const workCountries = (id: string) => new Set(placesOf(id).map(countryOf));

// ───────── 저장소 ─────────
function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function save(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ }
}
function browserLang(): Lang {
  const n = (navigator.language || 'ko').slice(0, 2);
  return (LANGS as string[]).includes(n) ? (n as Lang) : 'en';
}
function detectLang(): Lang {
  const saved = load<Lang | null>('lang', null);
  return saved && LANGS.includes(saved) ? saved : browserLang();
}

// ───────── 해시 라우팅: 뒤로 가기와 링크 공유가 그대로 동작합니다 ─────────
type Route = { name: 'home' } | { name: 'work'; id: string } | { name: 'place'; id: string } | { name: 'near' };
function parseHash(): Route {
  const [, kind, id] = location.hash.split('/');
  if (kind === 'w' && id && workById.has(id)) return { name: 'work', id };
  if (kind === 'p' && id && placeById.has(id)) return { name: 'place', id };
  if (kind === 'near') return { name: 'near' };
  return { name: 'home' };
}
const go = (h: string) => { if (location.hash !== h) location.hash = h; };

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang);
  // 처음 방문하면 언어 선택 화면을 먼저 띄웁니다. 이후에는 상단 언어 버튼으로 다시 열 수 있습니다.
  const [langOpen, setLangOpen] = useState(() => !load<boolean>('langChosen', false));
  const chooseLang = (l: Lang) => { setLang(l); save('langChosen', true); setLangOpen(false); };
  const [route, setRoute] = useState<Route>(parseHash);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<WorkType | 'all'>('all');
  const [country, setCountry] = useState<Country | 'all'>(() => load('country', 'all'));
  useEffect(() => save('country', country), [country]);
  const [progress, setProgress] = useState<Progress>(() => load('progress', {}));
  const [revealAll, setRevealAll] = useState(false);
  const [userPos, setUserPos] = useState<[number, number]>();
  const [locState, setLocState] = useState<'idle' | 'loading' | 'fail'>('idle');
  const [radius, setRadius] = useState(20);
  const [snap, setSnap] = useState<Snap>('half');
  const [toast, setToast] = useState<string>();
  const toastTimer = useRef<number>();

  useEffect(() => { save('lang', lang); document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang; }, [lang]);
  useEffect(() => save('progress', progress), [progress]);
  useEffect(() => {
    const f = () => { setRoute(parseHash()); setSnap((s) => (s === 'peek' ? 'half' : s)); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(undefined), 2600);
  }, []);

  const visOf = (p: Place) => visibilityOf(p, progress, revealAll);
  const origin = userPos ?? (locState === 'fail' ? SEOUL : undefined);

  // 링크로 들어온 장소가 스포일러로 숨겨진 경우, 작품 화면으로 돌립니다
  useEffect(() => {
    if (route.name === 'place' && visOf(placeById.get(route.id)!) === 'hidden') {
      location.replace(`#/w/${placeById.get(route.id)!.workId}`);
    }
  });

  function locate() {
    go('#/near');
    if (!('geolocation' in navigator)) { setLocState('fail'); showToast(t('locFail', lang)); return; }
    setLocState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLocState('idle'); },
      () => { setLocState('fail'); showToast(t('locFail', lang)); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const typeOk = (p: Place) => typeFilter === 'all' || workById.get(p.workId)!.type === typeFilter;
  const countryOk = (p: Place) => country === 'all' || countryOf(p) === country;
  const workOk = (w: Work) => (typeFilter === 'all' || w.type === typeFilter) && (country === 'all' || workCountries(w.id).has(country));
  const searching = route.name === 'home' && query.trim() !== '';

  // ───────── 지도에 올릴 장소 ─────────
  const { mapItems, fitKey } = useMemo(() => {
    const item = (p: Place, num?: number): MapPlace => ({ place: p, type: workById.get(p.workId)!.type, num });
    const vis = (list: Place[]) => partition(list, progress, revealAll).visible.map((v) => v.place);
    let items: MapPlace[] = [];
    if (route.name === 'work' || route.name === 'place') {
      const wid = route.name === 'work' ? route.id : placeById.get(route.id)!.workId;
      const list = vis(placesOf(wid));
      items = list.map((p, i) => item(p, list.length > 1 ? i + 1 : undefined));
    } else if (route.name === 'near') {
      const o = origin ?? SEOUL;
      items = vis(places.filter(typeOk)).filter((p) => distanceKm(o[0], o[1], p.lat, p.lng) <= radius).map((p) => item(p));
    } else if (searching) {
      const ids = new Set(searchWorks(query, works).map((w) => w.id));
      const merged = new Map([...vis(places.filter((p) => ids.has(p.workId))), ...searchPlaces(query, places, progress, revealAll)].map((p) => [p.id, p]));
      items = [...merged.values()].filter(typeOk).map((p) => item(p));
    } else {
      items = vis(places.filter((p) => typeOk(p) && countryOk(p))).map((p) => item(p));
    }
    const key = `${route.name}|${route.name === 'work' ? route.id : route.name === 'place' ? placeById.get(route.id)!.workId : ''}|${items.map((i) => i.place.id).join(',')}|${route.name === 'near' ? origin : ''}`;
    return { mapItems: items, fitKey: key };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, query, typeFilter, country, progress, revealAll, origin, radius]);

  const selectedId = route.name === 'place' ? route.id : undefined;

  // ───────── 공용 UI 조각 ─────────
  const copy = async (text: string, msg: string) => {
    try { await navigator.clipboard.writeText(text); showToast(msg); } catch { /* 클립보드 불가 */ }
  };
  const share = async (title: string) => {
    const url = location.href;
    if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { /* 취소 */ } }
    copy(url, t('copied', lang));
  };

  const placeRow = (p: Place, opts: { num?: number; showWork?: boolean; dist?: number } = {}) => {
    const w = workById.get(p.workId)!;
    return (
      <li key={p.id}>
        <button className="prow" onClick={() => go(`#/p/${p.id}`)}>
          <span className="pnum" style={{ background: TYPE_COLOR[w.type] }}>{opts.num ?? <TypeIcon type={w.type} size={18} />}</span>
          <span className="grow">
            <strong>{tr(p.name, lang)}</strong>
            <small>
              {opts.showWork ? tr(w.title, lang).replace(/\s*\(.*\)$/, '') : t(p.kind, lang)}
              <i>·</i>{t('appears', lang, { s: tr(w.segments[p.appearsAt], lang) })}
            </small>
            <small className="muted">{regionOf(p) && tr(p.address, lang).split(',').slice(-2).join(',').trim()}</small>
          </span>
          {opts.dist !== undefined && <span className="dist">{formatKm(opts.dist)}</span>}
          <span className="chev" aria-hidden>›</span>
        </button>
      </li>
    );
  };

  const workCard = (w: Work) => {
    const n = placesOf(w.id).length;
    return (
      <li key={w.id}>
        <button className="wcard" onClick={() => go(`#/w/${w.id}`)}>
          <Cover work={w} lang={lang} />
          <strong>{tr(w.title, lang).replace(/\s*\(.*\)$/, '').replace(/^.*-\s*/, '')}</strong>
          <small>{t('placesN', lang, { n })}{n > 1 && <span className="tag-multi">{t('multi', lang)}</span>}</small>
        </button>
      </li>
    );
  };

  const workRow = (w: Work) => {
    const n = placesOf(w.id).length;
    return (
      <li key={w.id}>
        <button className="prow" onClick={() => go(`#/w/${w.id}`)}>
          <Cover work={w} lang={lang} size="sm" />
          <span className="grow">
            <strong>{tr(w.title, lang)}</strong>
            <small>{[t(w.type, lang), w.year || '', tr(w.creator, lang)].filter(Boolean).join(' · ')}</small>
            <small className="muted">{t('placesN', lang, { n })}{n > 1 && <span className="tag-multi">{t('multi', lang)}</span>}</small>
          </span>
          <span className="chev" aria-hidden>›</span>
        </button>
      </li>
    );
  };

  const backBtn = (to?: string) => (
    <button className="iconbtn back" aria-label={t('back', lang)} onClick={() => (to ? go(to) : history.length > 1 ? history.back() : go('#/'))}>
      <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );

  // ───────── 화면별 내용 ─────────
  let header: React.ReactNode = null;
  let body: React.ReactNode = null;

  if (route.name === 'work') {
    const w = workById.get(route.id)!;
    const all = placesOf(w.id);
    const { visible, hidden } = partition(all, progress, revealAll);
    const regions = new Set(all.map(regionOf)).size;
    header = <div className="sheet-head">{backBtn('#/')}<span className="head-title">{tr(w.title, lang)}</span><button className="iconbtn" aria-label={t('share', lang)} onClick={() => share(tr(w.title, lang))}><ShareIcon /></button></div>;
    body = (
      <div className="view">
        <div className="work-hero">
          <Cover work={w} lang={lang} size="lg" />
          <div>
            <span className="type-label" style={{ color: TYPE_COLOR[w.type] }}><TypeDot type={w.type} />{t(w.type, lang)}</span>
            <h1>{tr(w.title, lang)}</h1>
            <p className="muted">{[w.year || '', tr(w.creator, lang)].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <div className="stats">
          <div><b>{all.length}</b><span>{t('statPlaces', lang)}</span></div>
          <div><b>{regions}</b><span>{t('statRegions', lang)}</span></div>
        </div>
        <WorkDetails work={w} lang={lang} />
        <ProgressPicker work={w} lang={lang} value={progress[w.id]} onChange={(v) => setProgress((p) => ({ ...p, [w.id]: v }))} />
        {hidden > 0 && (
          <div className="notice lock">
            <span className="notice-ico">🔒</span>
            <span><b>{t('hiddenN', lang, { n: hidden })}</b><small>{t('hiddenHint', lang)}</small></span>
          </div>
        )}
        {visible.length > 1 && <p className="hint">{t('routeHint', lang)}</p>}
        <ul className="plist">{visible.map((v, i) => placeRow(v.place, { num: visible.length > 1 ? i + 1 : undefined }))}</ul>
      </div>
    );
  } else if (route.name === 'place') {
    const p = placeById.get(route.id)!;
    const w = workById.get(p.workId)!;
    const vis = visOf(p) as Exclude<Visibility, 'hidden'>;
    const pe = placeExtra(p.id);
    const links = directionLinks(countryOf(p) === 'JP' ? tr(p.name, 'ja') : tr(p.name, 'ko'), p.lat, p.lng, countryOf(p));
    const list = partition(placesOf(w.id), progress, revealAll).visible.map((v) => v.place);
    const idx = list.findIndex((x) => x.id === p.id);
    header = <div className="sheet-head">{backBtn()}<span className="head-title">{tr(p.name, lang)}</span><button className="iconbtn" aria-label={t('share', lang)} onClick={() => share(tr(p.name, lang))}><ShareIcon /></button></div>;
    body = (
      <div className="view">
        {pe?.image && (
          <figure className="place-photo">
            <img src={pe.image} alt={tr(p.name, lang)} loading="lazy" />
            <figcaption>{t('photoBy', lang)}{pe.license === 'Type3' ? ' · 공공누리 3유형' : ' · 공공누리 1유형'}</figcaption>
          </figure>
        )}
        <div className="place-top">
          <span className="kind-chip" style={{ color: TYPE_COLOR[w.type], borderColor: TYPE_COLOR[w.type] + '55' }}>{t(p.kind, lang)}</span>
          {list.length > 1 && <span className="muted small">{idx + 1} / {list.length}</span>}
        </div>
        <h1 className="place-title">{tr(p.name, lang)}</h1>
        {countryOf(p) === 'JP'
          ? lang !== 'ja' && p.name.ja && <p className="ko-name" lang="ja">{p.name.ja}</p>
          : lang !== 'ko' && <p className="ko-name" lang="ko">{p.name.ko}</p>}
        <button className="work-link" onClick={() => go(`#/w/${w.id}`)}>
          <Cover work={w} lang={lang} size="sm" />
          <span className="grow">
            <strong>{tr(w.title, lang)}</strong>
            <small>{t('appears', lang, { s: tr(w.segments[p.appearsAt], lang) })}</small>
          </span>
          <span className="chev">›</span>
        </button>

        <div className={`dir-row n${links.length}`}>
          {links.map((l, i) => (
            <a key={l.app} className={`btn ${i === 0 ? 'primary' : ''}`} href={l.url} target="_blank" rel="noopener">
              <span className={`logo ${l.app}`}>{DIR_LOGO[l.app]}</span>{t(l.app, lang)}
            </a>
          ))}
        </div>
        {countryOf(p) === 'JP' ? <p className="hint">ⓘ {t('mapTipJP', lang)}</p> : lang !== 'ko' && <p className="hint">ⓘ {t('mapTip', lang)}</p>}

        <div className="addr-row">
          <span className="grow">
            <span>{tr(p.address, lang)}</span>
            {countryOf(p) === 'JP'
              ? lang !== 'ja' && p.address.ja && <small lang="ja">{p.address.ja}</small>
              : lang !== 'ko' && <small lang="ko">{p.address.ko}</small>}
            {origin && <small className="accent">{t('away', lang, { d: formatKm(distanceKm(origin[0], origin[1], p.lat, p.lng)) })}</small>}
          </span>
          <button className="chip-btn" onClick={() => copy(countryOf(p) === 'JP' ? (p.address.ja ?? p.address.en) : p.address.ko, t('addrCopied', lang))}>{t('copyAddr', lang)}</button>
        </div>

        <p className="desc">{tr(p.descSafe, lang)}</p>
        {p.descFull && vis === 'full' && <SpoilerReveal key={p.id} lang={lang} text={tr(p.descFull, lang)} />}
        {p.descFull && vis === 'safe' && (
          <div className="notice lock">
            <span className="notice-ico">🔒</span>
            <span><b>{t('lockedDetail', lang, { s: tr(w.segments[p.appearsAt], lang) })}</b></span>
          </div>
        )}
        {officialCoord(pe) ? <p className="hint">✓ {t('coordsOfficial', lang)}</p> : p.source === 'wikidata'
          ? <p className="hint">ⓘ {t('fromWikidata', lang)} · <a href={`https://www.wikidata.org/wiki/${p.qid}`} target="_blank" rel="noopener">{p.qid}</a></p>
          : !p.verified && <p className="hint warn">⚠ {t('unverified', lang)}</p>}

        {list.length > 1 && (
          <>
            <h3 className="sec">{t('viewWork', lang)}</h3>
            <ul className="plist">{list.filter((x) => x.id !== p.id).map((x) => placeRow(x, { num: list.indexOf(x) + 1 }))}</ul>
          </>
        )}
      </div>
    );
  } else if (route.name === 'near') {
    const o = origin ?? SEOUL;
    const list = partition(places.filter(typeOk), progress, revealAll).visible
      .map((v) => ({ p: v.place, d: distanceKm(o[0], o[1], v.place.lat, v.place.lng) }))
      .filter((x) => x.d <= radius).sort((a, b) => a.d - b.d);
    const wider = RADII.find((r) => r > radius);
    header = <div className="sheet-head">{backBtn('#/')}<span className="head-title">{locState === 'loading' ? t('locating', lang) : t('nearbyTitle', lang, { n: list.length })}</span></div>;
    body = (
      <div className="view">
        <div className="seg" role="radiogroup" aria-label={t('radius', lang)}>
          {RADII.map((r) => (
            <button key={r} role="radio" aria-checked={radius === r} className={radius === r ? 'on' : ''} onClick={() => setRadius(r)}>{r} km</button>
          ))}
        </div>
        {locState === 'fail' && <p className="hint warn">{t('locFail', lang)}</p>}
        {list.length === 0 && locState !== 'loading' && (
          <div className="empty">
            <span className="empty-ico">🧭</span>
            <p>{t('noNearby', lang)}</p>
            {wider && <button className="btn primary" onClick={() => setRadius(wider)}>{t('widen', lang)} · {wider} km</button>}
          </div>
        )}
        <ul className="plist">{list.map((x) => placeRow(x.p, { showWork: true, dist: x.d }))}</ul>
      </div>
    );
  } else if (searching) {
    const ws = searchWorks(query, works).filter((w) => typeFilter === 'all' || w.type === typeFilter);
    const ps = searchPlaces(query, places, progress, revealAll).filter(typeOk);
    header = <div className="sheet-head"><span className="head-title">{t('works', lang)} {ws.length} · {t('places', lang)} {ps.length}</span></div>;
    body = (
      <div className="view">
        {ws.length === 0 && ps.length === 0 && (
          <div className="empty">
            <span className="empty-ico">🔎</span>
            <p>{t('noResult', lang, { q: query })}</p>
            <small>{t('noResultHint', lang)}</small>
          </div>
        )}
        {ws.length > 0 && <><h3 className="sec">{t('works', lang)}</h3><ul className="plist">{ws.map(workRow)}</ul></>}
        {ps.length > 0 && <><h3 className="sec">{t('places', lang)}</h3><ul className="plist">{ps.map((p) => placeRow(p, { showWork: true }))}</ul></>}
      </div>
    );
  } else {
    // 직접 정리한 작품을 먼저, 그다음 인기도(위키백과 언어판 수) 순
    const rank = (w: Work) => (w.source ? 0 : 1000) + (w.popularity ?? 0);
    const shelves = TYPES.map((ty) => ({ ty, list: works.filter((w) => w.type === ty && workOk(w)).sort((a, b) => rank(b) - rank(a)) })).filter((x) => x.list.length > 0);
    const nPlaces = places.filter((p) => typeOk(p) && countryOk(p)).length;
    header = (
      <div className="sheet-head home">
        <span className="head-title">{t('browse', lang)}</span>
        <span className="muted small">{t('works', lang)} {works.filter(workOk).length} · {t('places', lang)} {nPlaces}</span>
      </div>
    );
    body = (
      <div className="view">
        <div className="seg country" role="radiogroup" aria-label="country">
          {(['all', ...COUNTRIES] as const).map((c) => (
            <button key={c} role="radio" aria-checked={country === c} className={country === c ? 'on' : ''} onClick={() => setCountry(c)}>
              {c === 'all' ? t('countryAll', lang) : <>{c === 'KR' ? '🇰🇷' : '🇯🇵'} {t(c, lang)}</>}
            </button>
          ))}
        </div>
        <button className="near-cta" onClick={locate}>
          <span className="near-ico"><LocateIcon /></span>
          <span className="grow"><strong>{t('nearMe', lang)}</strong><small>{t('nearCta', lang)}</small></span>
          <span className="chev">›</span>
        </button>
        {shelves.map(({ ty, list }) => (
          <section key={ty} className="shelf">
            <h3 className="sec"><TypeDot type={ty} />{t(ty, lang)} <span className="muted small">{list.length}</span></h3>
            <ul className={typeFilter === 'all' ? 'hscroll' : 'grid'}>
              {(typeFilter === 'all' ? list.slice(0, SHELF_MAX) : list).map(workCard)}
              {typeFilter === 'all' && list.length > SHELF_MAX && (
                <li><button className="wcard more" onClick={() => setTypeFilter(ty)}><span className="more-box">+{list.length - SHELF_MAX}</span><strong>{t('seeAll', lang)}</strong></button></li>
              )}
            </ul>
          </section>
        ))}
        <Sources lang={lang} />
      </div>
    );
  }

  const showChips = route.name === 'home' || route.name === 'near';

  return (
    <div className="app">
      <div className="mapwrap">
        <MapView
          lang={lang}
          items={mapItems}
          selectedId={selectedId}
          onSelect={(p) => go(`#/p/${p.id}`)}
          user={route.name === 'near' ? origin : userPos}
          radiusKm={route.name === 'near' ? radius : undefined}
          fitKey={fitKey}
          onLocate={locate}
          locating={locState === 'loading'}
          labels={{ zoomIn: t('zoomIn', lang), zoomOut: t('zoomOut', lang), locate: t('locate', lang) }}
        />
      </div>

      <div className="side">
        <header className="topbar">
          <div className="searchbox">
            <button className="brand" onClick={() => { setQuery(''); go('#/'); }} aria-label={t('appName', lang)}>
              <img src="./icon.svg" alt="" width={30} height={30} />
            </button>
            <input
              type="search" value={query} placeholder={t('searchPh', lang)} aria-label={t('searchPh', lang)}
              onChange={(e) => { setQuery(e.target.value); if (route.name !== 'home') go('#/'); }}
              onFocus={() => { if (window.matchMedia('(max-width: 760px)').matches) setSnap('full'); }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            />
            {query && <button className="iconbtn" aria-label={t('clear', lang)} onClick={() => setQuery('')}>✕</button>}
            <button className="lang" onClick={() => setLangOpen(true)} aria-label={`${t('language', lang)}: ${LANG_LABEL[lang]}`} aria-haspopup="dialog">
              <GlobeIcon />
              <span className="lang-full">{LANG_LABEL[lang]}</span>
              <span className="lang-short">{LANG_SHORT[lang]}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="chiprow">
            <button className={`shield ${revealAll ? 'off' : ''}`} aria-pressed={!revealAll} onClick={() => setRevealAll((v) => !v)}>
              <ShieldIcon off={revealAll} /> {revealAll ? t('spoilerOff', lang) : t('spoilerOn', lang)}
            </button>
            {showChips && (['all', ...TYPES] as const).map((k) => (
              <button key={k} className={`chip ${typeFilter === k ? 'on' : ''}`} onClick={() => setTypeFilter(k)}>
                {k !== 'all' && <TypeDot type={k} />}{t(k, lang)}
              </button>
            ))}
          </div>
        </header>

        <Sheet snap={snap} onSnap={setSnap} header={header} scrollKey={JSON.stringify(route) + query}>
          {body}
        </Sheet>
      </div>

      {langOpen && <LangPicker current={lang} detected={browserLang()} firstVisit={!load<boolean>('langChosen', false)} onChoose={chooseLang} onClose={() => setLangOpen(false)} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

// ───────── 작은 컴포넌트 ─────────
function ProgressPicker({ work, lang, value, onChange }: { work: Work; lang: Lang; value?: number; onChange: (v: number | undefined) => void }) {
  const segs = work.segments;
  const label = work.type === 'literature' ? t('progressRead', lang) : t('progress', lang);
  const current = value === undefined ? t('notYet', lang) : value === segs.length - 1 ? t('done', lang) : t('upTo', lang, { s: tr(segs[value], lang) });
  return (
    <div className="progress">
      <div className="progress-head"><span>{label}</span><b>{current}</b></div>
      {segs.length <= 5 ? (
        <div className="seg">
          <button className={value === undefined ? 'on' : ''} onClick={() => onChange(undefined)}>—</button>
          {segs.map((s, i) => (
            <button key={i} className={value !== undefined && i <= value ? 'on' : ''} onClick={() => onChange(i)}>{tr(s, lang)}</button>
          ))}
        </div>
      ) : (
        <div className="slider">
          <input
            type="range" min={-1} max={segs.length - 1} step={1} value={value ?? -1} aria-label={label}
            onChange={(e) => { const v = Number(e.target.value); onChange(v < 0 ? undefined : v); }}
            style={{ ['--pct' as string]: `${(((value ?? -1) + 1) / segs.length) * 100}%` }}
          />
          <div className="slider-ends"><span>{t('notYet', lang)}</span><span>{tr(segs[segs.length - 1], lang)}</span></div>
        </div>
      )}
    </div>
  );
}

function SpoilerReveal({ text, lang }: { text: string; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <button className={`spoiler ${open ? 'open' : ''}`} onClick={() => setOpen(true)} aria-expanded={open}>
      <span className="spoiler-text">{text}</span>
      {!open && <span className="spoiler-cover">⚠ {t('spoilerTap', lang)}</span>}
    </button>
  );
}

const DIR_LOGO: Record<string, string> = { kakao: 'K', naver: 'N', google: 'G', apple: 'A' };

function ShieldIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path d="M12 2.5l7.5 3v6c0 4.6-3.2 8.4-7.5 10-4.3-1.6-7.5-5.4-7.5-10v-6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {off ? <path d="M5 4l14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
function ShareIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function LocateIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 11l18-8-8 18-2-8z" fill="currentColor" /></svg>;
}
