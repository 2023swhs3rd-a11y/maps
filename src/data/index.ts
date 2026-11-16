import type { Country, L10n, Place, Work, WorkType } from '../types';
import { works as curatedWorks } from './works';
import { places as curatedPlaces } from './places';
import wdRaw from './wikidata.json';

/**
 * 직접 정리한 데이터(works.ts / places.ts) + 위키데이터에서 가져온 데이터(wikidata.json)를 합칩니다.
 * - 같은 작품이면(제목·별칭 일치) 직접 정리한 작품에 위키데이터 장소를 붙입니다.
 * - 같은 작품에 이미 300m 안의 장소가 있으면 위키데이터 장소는 뺍니다(중복).
 * - 위키데이터 장소는 장면 정보가 없으므로 스포일러 0등급·'도입' 등장으로 둡니다.
 */
interface WdWork { id: string; qid: string; type: WorkType; country: Country; year: number; title: L10n; creator: L10n; links: number }
interface WdPlace { id: string; workId: string; qid: string; kind: 'filming' | 'setting'; country: Country; name: L10n; address: L10n; lat: number; lng: number }
const wd = wdRaw as unknown as { works: WdWork[]; places: WdPlace[] };

const acts: L10n[] = [
  { ko: '도입', en: 'Opening', ja: '序盤', zh: '开端' },
  { ko: '전개', en: 'Development', ja: '展開', zh: '发展' },
  { ko: '절정', en: 'Climax', ja: 'クライマックス', zh: '高潮' },
  { ko: '결말', en: 'Ending', ja: '結末', zh: '结局' },
];

const norm = (s?: string) => (s ?? '').toLowerCase().normalize('NFKC').replace(/[\s.·:：'"!?！？()（）「」『』〈〉《》\-–—,、。]/g, '');

function km(a: number, b: number, c: number, d: number) {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

// 직접 정리한 작품을 제목으로 찾기 위한 색인
const byTitle = new Map<string, Work>();
for (const w of curatedWorks) {
  for (const s of [w.title.ko, w.title.en, w.title.ja, w.title.zh, ...(w.aliases ?? [])]) {
    const k = norm(s);
    if (k.length >= 2 && !byTitle.has(k)) byTitle.set(k, w);
  }
}
function matchCurated(w: WdWork): Work | undefined {
  for (const s of [w.title.ko, w.title.en, w.title.ja, w.title.zh]) {
    const c = byTitle.get(norm(s));
    if (c && c.type === w.type ? true : c && Math.abs(c.year - w.year) <= 1) return c;
  }
  return undefined;
}

const q = (s?: string) => s ?? '';
function desc(kind: 'filming' | 'setting', t: L10n): L10n {
  return kind === 'filming'
    ? { ko: `「${t.ko}」의 촬영지`, en: `Filming location of "${t.en}"`, ja: `『${q(t.ja) || t.en}』のロケ地`, zh: `《${q(t.zh) || t.en}》取景地` }
    : { ko: `「${t.ko}」의 배경이 된 곳`, en: `A setting in "${t.en}"`, ja: `『${q(t.ja) || t.en}』の舞台`, zh: `《${q(t.zh) || t.en}》的故事舞台` };
}

const extraWorks: Work[] = [];
const extraPlaces: Place[] = [];
const wdToWorkId = new Map<string, string>();

for (const w of wd.works) {
  const c = matchCurated(w);
  if (c) { wdToWorkId.set(w.id, c.id); continue; }
  wdToWorkId.set(w.id, w.id);
  extraWorks.push({
    id: w.id, type: w.type, year: w.year < 3000 ? w.year : 0, country: w.country,
    title: w.title, creator: w.creator, segments: acts, source: 'wikidata', qid: w.qid, popularity: w.links,
  });
}

const titleOf = new Map<string, L10n>([...curatedWorks, ...extraWorks].map((w) => [w.id, w.title]));
for (const p of wd.places) {
  const workId = wdToWorkId.get(p.workId);
  if (!workId) continue;
  const dup = curatedPlaces.some((c) => c.workId === workId && km(c.lat, c.lng, p.lat, p.lng) < 0.3);
  if (dup) continue;
  extraPlaces.push({
    id: p.id, workId, country: p.country, kind: p.kind, name: p.name, address: p.address,
    lat: p.lat, lng: p.lng, appearsAt: 0, spoiler: 0, verified: false,
    descSafe: desc(p.kind, titleOf.get(workId)!), source: 'wikidata', qid: p.qid,
  });
}

export const works: Work[] = [...curatedWorks, ...extraWorks];
export const places: Place[] = [...curatedPlaces, ...extraPlaces];
export const wikidataCounts = { works: extraWorks.length, places: extraPlaces.length };
