#!/usr/bin/env node
/**
 * 외부 API로 작품·장소 정보를 보강해 src/data/enrich.json 을 만듭니다.
 *
 *  - TMDB (영화·드라마): 4개 언어 줄거리·포스터·장르·출연진·방송사·국내 스트리밍(JustWatch 제공)
 *  - 한국관광공사 TourAPI (장소): 대표 사진, 공식 좌표·주소
 *
 * 환경 변수
 *  TMDB_TOKEN    TMDB "API 읽기 액세스 토큰"(v4, 권장)  또는  TMDB_API_KEY (v3 키)
 *  TOURAPI_KEY   공공데이터포털 일반 인증키 (Decoding 키 권장. Encoding 키도 자동 처리)
 *
 * 키가 없으면 해당 부분만 건너뛰고, 실패해도 종료 코드는 0입니다(배포를 막지 않음).
 * 실행: npm run enrich   (Node 22.18+ : .ts 파일을 그대로 import 합니다)
 */
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { works } from '../src/data/works.ts';
import { places } from '../src/data/places.ts';

const OUT = new URL('../src/data/enrich.json', import.meta.url);
const TMDB_TOKEN = process.env.TMDB_TOKEN?.trim();
const TMDB_API_KEY = process.env.TMDB_API_KEY?.trim();
let TOUR_KEY = process.env.TOURAPI_KEY?.trim();
if (TOUR_KEY?.includes('%')) TOUR_KEY = decodeURIComponent(TOUR_KEY); // Encoding 키를 넣은 경우

const LANG_CODE = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = [];
const log = (s) => { console.log(s); report.push(s); };

async function getJSON(url, init, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
      const text = await res.text();
      try { return JSON.parse(text); } catch { throw Object.assign(new Error(`JSON 아님: ${text.slice(0, 160)}`), { fatal: true }); }
    } catch (e) {
      if (e.fatal || i === tries - 1) throw e;
      await sleep(800 * (i + 1));
    }
  }
}

// ───────── TMDB ─────────
function tmdb(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  if (!TMDB_TOKEN && TMDB_API_KEY) url.searchParams.set('api_key', TMDB_API_KEY);
  const headers = { accept: 'application/json' };
  if (TMDB_TOKEN) headers.Authorization = `Bearer ${TMDB_TOKEN}`;
  return getJSON(url, { headers });
}

async function enrichWork(w) {
  const kind = w.type === 'film' ? 'movie' : 'tv';
  let id = w.tmdb?.id;
  if (!id) {
    const q = w.tmdb?.query ?? w.title.ko;
    const yearParam = kind === 'movie' ? { year: w.year } : { first_air_date_year: w.year };
    let r = await tmdb(`/search/${kind}`, { query: q, language: 'ko-KR', ...yearParam });
    if (!r.results?.length) r = await tmdb(`/search/${kind}`, { query: w.title.en.replace(/\s*\(.*\)$/, ''), language: 'ko-KR' });
    const hit = r.results?.find((x) => x.original_language === 'ko') ?? r.results?.[0];
    if (!hit) { log(`- ⚠ TMDB: '${w.title.ko}' 검색 결과 없음 (works.ts에 tmdb.id 지정 필요)`); return undefined; }
    id = hit.id;
  }
  const out = { tmdbId: id, kind, url: `https://www.themoviedb.org/${kind}/${id}`, title: {}, overview: {}, genres: {}, poster: {} };
  for (const [lang, code] of Object.entries(LANG_CODE)) {
    const d = await tmdb(`/${kind}/${id}`, {
      language: code,
      append_to_response: lang === 'ko' ? 'credits,watch/providers' : undefined,
    });
    out.title[lang] = d.title ?? d.name;
    if (d.overview) out.overview[lang] = d.overview;
    out.genres[lang] = (d.genres ?? []).map((g) => g.name);
    if (d.poster_path) out.poster[lang] = d.poster_path;
    if (lang === 'ko') {
      out.backdrop = d.backdrop_path ?? undefined;
      out.rating = d.vote_count >= 20 ? Math.round(d.vote_average * 10) / 10 : undefined;
      out.network = d.networks?.[0]?.name;
      out.episodes = d.number_of_episodes;
      out.runtime = d.runtime || undefined;
      out.cast = (d.credits?.cast ?? []).slice(0, 6).map((c) => ({ name: c.name, character: c.character || undefined, profile: c.profile_path || undefined }));
      const kr = d['watch/providers']?.results?.KR;
      out.providers = (kr?.flatrate ?? []).slice(0, 6).map((p) => ({ name: p.provider_name, logo: p.logo_path }));
      out.providersLink = kr?.link;
    }
    await sleep(120);
  }
  log(`- ✓ TMDB: ${w.title.ko} → ${out.title.en ?? ''} (${out.url})`);
  return out;
}

// ───────── TourAPI ─────────
function distKm(a, b, c, d) {
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const h = Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function tourSearch(keyword) {
  // 2025년 개편된 KorService2를 먼저 쓰고, 없으면 KorService1로 시도합니다
  for (const [svc, op] of [['KorService2', 'searchKeyword2'], ['KorService1', 'searchKeyword1']]) {
    const url = new URL(`https://apis.data.go.kr/B551011/${svc}/${op}`);
    url.search = new URLSearchParams({ serviceKey: TOUR_KEY, MobileOS: 'ETC', MobileApp: 'SceneMap', _type: 'json', keyword, numOfRows: '20', pageNo: '1' }).toString();
    try {
      const j = await getJSON(url, {}, 2);
      const header = j?.response?.header;
      if (header && header.resultCode !== '0000') throw new Error(`${header.resultCode} ${header.resultMsg}`);
      const items = j?.response?.body?.items?.item;
      return Array.isArray(items) ? items : items ? [items] : [];
    } catch (e) {
      if (svc === 'KorService1') throw e;
    }
  }
  return [];
}

async function enrichPlace(p) {
  const keyword = p.tourKeyword ?? p.name.ko.replace(/\s*\(.*?\)\s*/g, ' ').split('·')[0].trim();
  const items = await tourSearch(keyword);
  const scored = items
    .map((it) => ({ it, d: distKm(p.lat, p.lng, Number(it.mapy), Number(it.mapx)) }))
    .filter((x) => Number.isFinite(x.d))
    .sort((a, b) => a.d - b.d);
  const best = scored[0];
  // 우리 좌표에서 5km 넘게 떨어진 결과는 동명이인으로 보고 버립니다
  if (!best || best.d > 5) {
    log(`- · TourAPI: ${p.name.ko} ('${keyword}') 근처 일치 없음${best ? ` (가장 가까운 '${best.it.title}' ${best.d.toFixed(1)}km)` : ''}`);
    return undefined;
  }
  const it = best.it;
  log(`- ✓ TourAPI: ${p.name.ko} → '${it.title}' (${best.d.toFixed(2)}km 차이${it.firstimage ? ', 사진 있음' : ''})`);
  return {
    contentId: it.contentid,
    title: it.title,
    addr: [it.addr1, it.addr2].filter(Boolean).join(' ') || undefined,
    lat: Number(it.mapy),
    lng: Number(it.mapx),
    distKm: Math.round(best.d * 100) / 100,
    // GitHub Pages(https)에서 막히지 않도록 https로 바꿉니다
    image: it.firstimage ? it.firstimage.replace(/^http:/, 'https:') : undefined,
    thumb: it.firstimage2 ? it.firstimage2.replace(/^http:/, 'https:') : undefined,
    license: it.cpyrhtDivCd || undefined,
  };
}

// ───────── 실행 ─────────
async function main() {
  let prev = { works: {}, places: {} };
  try { prev = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* 처음 */ }
  const out = { generatedAt: new Date().toISOString(), works: { ...prev.works }, places: { ...prev.places } };

  if (TMDB_TOKEN || TMDB_API_KEY) {
    log('## TMDB');
    for (const w of works.filter((x) => x.type !== 'literature')) {
      try { const r = await enrichWork(w); if (r) out.works[w.id] = r; }
      catch (e) { log(`- ✗ TMDB: ${w.title.ko} — ${e.message}`); }
    }
  } else log('TMDB 키가 없어 영화·드라마 보강을 건너뜁니다 (TMDB_TOKEN 또는 TMDB_API_KEY).');

  if (TOUR_KEY) {
    log('\n## TourAPI');
    for (const p of places) {
      try { const r = await enrichPlace(p); if (r) out.places[p.id] = r; else delete out.places[p.id]; }
      catch (e) { log(`- ✗ TourAPI: ${p.name.ko} — ${e.message}`); }
      await sleep(100);
    }
  } else log('TourAPI 키가 없어 장소 보강을 건너뜁니다 (TOURAPI_KEY).');

  // 더 이상 없는 작품·장소 정리
  const wIds = new Set(works.map((w) => w.id)), pIds = new Set(places.map((p) => p.id));
  for (const k of Object.keys(out.works)) if (!wIds.has(k)) delete out.works[k];
  for (const k of Object.keys(out.places)) if (!pIds.has(k)) delete out.places[k];

  if (TMDB_TOKEN || TMDB_API_KEY || TOUR_KEY) {
    await writeFile(OUT, JSON.stringify(out, null, 1) + '\n');
    log(`\n작품 ${Object.keys(out.works).length}편, 장소 ${Object.keys(out.places).length}곳 보강 → src/data/enrich.json`);
  }
  // GitHub Actions 실행 요약에 결과 표시
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `# 데이터 보강 결과\n\n${report.join('\n')}\n`);
}

main().catch((e) => { console.error('보강 실패(배포는 계속):', e); });
