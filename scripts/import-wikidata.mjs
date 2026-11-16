#!/usr/bin/env node
/**
 * 위키데이터(CC0)에서 한국·일본 작품의 촬영지(P915)·배경지(P840)를 가져와
 * src/data/wikidata.json 을 만듭니다. API 키가 필요 없습니다.
 *
 *  - 도시·도·현·나라 같은 행정구역은 너무 넓어서 빼고, 건물·역·신사·공원·섬처럼
 *    구체적인 장소만 남깁니다.
 *  - 이름은 한·영·일·중 4개 언어 라벨을 씁니다. 없는 언어는 앱에서 영어로 대체합니다.
 *  - 직접 정리한 데이터(works.ts / places.ts)와 겹치는 작품·장소는 앱에서 합칩니다(src/data/index.ts).
 *
 * 실행: npm run import:wikidata   (몇 분 걸립니다)
 */
import { writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/wikidata.json', import.meta.url);
const UA = 'SceneMapDataImport/0.1';
const SPARQL = 'https://query.wikidata.org/sparql';
const API = 'https://www.wikidata.org/w/api.php';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json, application/json' } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(3000 * (i + 1));
    }
  }
}
const sparql = (q) => get(`${SPARQL}?${new URLSearchParams({ query: q, format: 'json' })}`).then((j) => j.results.bindings);
const qid = (uri) => uri.slice(uri.lastIndexOf('/') + 1);

// ───────── 1. 작품–장소 쌍 ─────────
const PAIRS = `
SELECT ?work ?wc ?prop ?loc ?coord ?lc ?links
  (GROUP_CONCAT(DISTINCT STRAFTER(STR(?wt), "entity/"); separator=",") AS ?wtypes)
  (MIN(YEAR(?date)) AS ?year)
WHERE {
  VALUES ?wc { wd:Q884 wd:Q17 }
  VALUES ?prop { wdt:P915 wdt:P840 }
  ?work wdt:P495 ?wc ; ?prop ?loc ; wikibase:sitelinks ?links .
  ?loc wdt:P625 ?coord ; wdt:P17 ?lc .
  VALUES ?lc { wd:Q884 wd:Q17 }
  OPTIONAL { ?work wdt:P31 ?wt }
  OPTIONAL { ?work wdt:P577|wdt:P580 ?date }
} GROUP BY ?work ?wc ?prop ?loc ?coord ?lc ?links`;

// ───────── 작품 유형 분류 ─────────
const T = {
  anime: ['Q20650540', 'Q202866', 'Q63952888', 'Q1107', 'Q21198342', 'Q1004', 'Q220898', 'Q100269041', 'Q581714'],
  drama: ['Q5398426', 'Q15416', 'Q21191270', 'Q1366112', 'Q526877', 'Q1259759', 'Q117467246', 'Q24856'],
  film: ['Q11424', 'Q24862', 'Q506240', 'Q229390', 'Q93204'],
  literature: ['Q7725634', 'Q8261', 'Q49084', 'Q47461344', 'Q571', 'Q5185279', 'Q1279564', 'Q12106333', 'Q482', 'Q37484', 'Q725377'],
};
const EXCLUDE = ['Q7889', 'Q4393107', 'Q482994', 'Q134556', 'Q105543609', 'Q7366', 'Q2031291', 'Q838795'];
function classify(types) {
  if (types.some((t) => EXCLUDE.includes(t)) && !types.some((t) => [...T.film, ...T.drama, ...T.anime, ...T.literature].includes(t))) return undefined;
  for (const k of ['anime', 'drama', 'film', 'literature']) if (types.some((t) => T[k].includes(t))) return k;
  return undefined;
}

// ───────── 2. 행정구역·넓은 지역 걸러내기 ─────────
async function adminSet(locs) {
  const out = new Set();
  for (let i = 0; i < locs.length; i += 30) {
    const vals = locs.slice(i, i + 30).map((x) => `wd:${x}`).join(' ');
    const q = `SELECT DISTINCT ?l WHERE { VALUES ?l { ${vals} }
      { ?l wdt:P31/wdt:P279* wd:Q56061 } UNION { ?l wdt:P31/wdt:P279* wd:Q6256 }
      UNION { ?l wdt:P31/wdt:P279* wd:Q82794 } UNION { ?l wdt:P31/wdt:P279* wd:Q515 } }`;
    for (const b of await sparql(q)) out.add(qid(b.l.value));
    process.stdout.write('.');
    await sleep(500);
  }
  console.log();
  return out;
}

// ───────── 3. 라벨·제작자·주소 ─────────
async function entities(ids, props = 'labels|claims') {
  const out = {};
  for (let i = 0; i < ids.length; i += 50) {
    const url = `${API}?${new URLSearchParams({ action: 'wbgetentities', ids: ids.slice(i, i + 50).join('|'), props, languages: 'ko|en|ja|zh|zh-hans|zh-cn', format: 'json' })}`;
    const j = await get(url);
    Object.assign(out, j.entities);
    await sleep(200);
  }
  return out;
}
function labels(e) {
  const l = e?.labels ?? {};
  const v = (k) => l[k]?.value;
  const en = v('en'), ko = v('ko'), ja = v('ja'), zh = v('zh-hans') ?? v('zh-cn') ?? v('zh');
  const any = en ?? ko ?? ja ?? zh;
  if (!any) return undefined;
  return { ko: ko ?? en ?? ja ?? any, en: en ?? ko ?? any, ...(ja ? { ja } : {}), ...(zh ? { zh } : {}) };
}
const claimIds = (e, p) => (e?.claims?.[p] ?? []).map((c) => c.mainsnak?.datavalue?.value?.id).filter(Boolean);

function parsePoint(wkt) {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt);
  return m ? { lng: Number(m[1]), lat: Number(m[2]) } : undefined;
}

async function main() {
  console.log('1) 작품–장소 쌍 조회…');
  const rows = await sparql(PAIRS);
  console.log(`   ${rows.length}건`);

  const pairs = [];
  for (const b of rows) {
    const type = classify(b.wtypes.value ? b.wtypes.value.split(',') : []);
    const pt = parsePoint(b.coord.value);
    if (!type || !pt) continue;
    pairs.push({
      work: qid(b.work.value), wc: qid(b.wc.value) === 'Q17' ? 'JP' : 'KR', type,
      kind: qid(b.prop.value) === 'P915' ? 'filming' : 'setting',
      loc: qid(b.loc.value), lc: qid(b.lc.value) === 'Q17' ? 'JP' : 'KR',
      links: Number(b.links.value), year: b.year ? Number(b.year.value) : undefined, ...pt,
    });
  }
  const locIds = [...new Set(pairs.map((p) => p.loc))];
  console.log(`2) 장소 ${locIds.length}곳 중 행정구역 걸러내기…`);
  const admin = await adminSet(locIds);
  const specific = pairs.filter((p) => !admin.has(p.loc));
  console.log(`   구체적인 장소 쌍 ${specific.length}건`);

  console.log('3) 라벨·제작자 조회…');
  const workIds = [...new Set(specific.map((p) => p.work))];
  const keepLocs = [...new Set(specific.map((p) => p.loc))];
  const ents = await entities([...workIds, ...keepLocs]);
  const creatorIds = new Set(), areaIds = new Set();
  for (const w of workIds) for (const p of ['P57', 'P50', 'P1809', 'P170', 'P58']) claimIds(ents[w], p).slice(0, 1).forEach((x) => creatorIds.add(x));
  for (const l of keepLocs) claimIds(ents[l], 'P131').slice(0, 1).forEach((x) => areaIds.add(x));
  const ents2 = await entities([...creatorIds, ...areaIds], 'labels|claims');
  // 주소에 시·도 단위까지 붙이기 위해 상위 행정구역을 한 번 더
  const upIds = new Set();
  for (const a of areaIds) claimIds(ents2[a], 'P131').slice(0, 1).forEach((x) => upIds.add(x));
  const ents3 = await entities([...upIds].filter((x) => !ents2[x]), 'labels');
  const area = (id) => ents2[id] ?? ents3[id];

  const CREATOR_ROLE = { P57: { ko: ' 감독', en: 'Dir. ', ja: '監督 ', zh: '导演 ' } };
  const works = {}, places = [];
  for (const id of workIds) {
    const e = ents[id], title = labels(e);
    if (!title) continue;
    const ps = specific.filter((p) => p.work === id);
    const p0 = ps[0];
    let creator;
    for (const prop of ['P57', 'P50', 'P1809', 'P170', 'P58']) {
      const c = claimIds(e, prop)[0];
      const cl = c && labels(area(c));
      if (cl) {
        const r = CREATOR_ROLE[prop];
        creator = r
          ? { ko: cl.ko + r.ko, en: r.en + cl.en, ja: r.ja + (cl.ja ?? cl.en), zh: r.zh + (cl.zh ?? cl.en) }
          : cl;
        break;
      }
    }
    works[id] = {
      id: `wd-${id}`, qid: id, type: p0.type, country: p0.wc, year: Math.min(...ps.map((p) => p.year ?? 9999)),
      title, creator: creator ?? { ko: '', en: '' }, links: p0.links,
    };
  }
  for (const p of specific) {
    const w = works[p.work];
    const name = labels(ents[p.loc]);
    if (!w || !name) continue;
    const a1 = claimIds(ents[p.loc], 'P131')[0];
    const a2 = a1 && claimIds(area(a1), 'P131')[0];
    const L1 = a1 && labels(area(a1)), L2 = a2 && labels(area(a2));
    const join = (k, sep) => [L2?.[k] ?? L2?.en, L1?.[k] ?? L1?.en].filter(Boolean).join(sep);
    const address = L1 ? { ko: join('ko', ' '), en: [L1.en, L2?.en].filter(Boolean).join(', '), ja: join('ja', ''), zh: join('zh', '') } : { ko: p.lc === 'JP' ? '일본' : '대한민국', en: p.lc === 'JP' ? 'Japan' : 'South Korea' };
    places.push({
      id: `wd-${p.work}-${p.loc}`, workId: w.id, qid: p.loc, kind: p.kind, country: p.lc,
      name, address, lat: Math.round(p.lat * 1e5) / 1e5, lng: Math.round(p.lng * 1e5) / 1e5,
    });
  }
  // 같은 작품의 같은 장소(P915·P840 둘 다)는 하나로
  const seen = new Set();
  const dedup = places.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  const used = new Set(dedup.map((p) => p.workId));
  const wl = Object.values(works).filter((w) => used.has(w.id)).sort((a, b) => b.links - a.links);

  await writeFile(OUT, JSON.stringify({ source: 'Wikidata (CC0)', generatedAt: new Date().toISOString(), works: wl, places: dedup }, null, 0) + '\n');
  const by = (k) => wl.reduce((m, w) => ((m[w[k]] = (m[w[k]] ?? 0) + 1), m), {});
  console.log(`완료: 작품 ${wl.length}편, 장소 ${dedup.length}곳`, by('type'), by('country'));
}

main().catch((e) => { console.error(e); process.exit(1); });
