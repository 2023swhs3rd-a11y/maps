import type { Lang, Work } from '../types';
import { tr } from '../i18n';
import { TYPE_COLOR, GLYPH } from './MapView';
import { workExtra, pick, tmdbImg } from '../data/enrich';

// 저작권 이미지 대신, 작품 id로 결정되는 그라데이션 커버를 만듭니다.
const PALETTES: Record<Work['type'], [string, string][]> = {
  drama: [['#ff8a3d', '#c2255c'], ['#f76707', '#862e9c'], ['#ffa94d', '#e8590c'], ['#ff6b6b', '#c92a2a']],
  film: [['#4263eb', '#1b1f3b'], ['#364fc7', '#0b7285'], ['#5c7cfa', '#3b0a45'], ['#1c7ed6', '#212529']],
  anime: [['#f06595', '#7048e8'], ['#e64980', '#1971c2'], ['#cc5de8', '#f76707'], ['#ff8787', '#5f3dc4']],
  literature: [['#37b24d', '#0b7285'], ['#2f9e44', '#5c940d'], ['#20c997', '#1864ab'], ['#94d82d', '#2b8a3e']],
};

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}


export function Cover({ work, lang, size = 'md' }: { work: Work; lang: Lang; size?: 'sm' | 'md' | 'lg' }) {
  const pal = PALETTES[work.type];
  const [a, b] = pal[hash(work.id) % pal.length];
  const angle = 120 + (hash(work.id + 'x') % 90);
  const title = tr(work.title, 'ko').replace(/^.*\s-\s+/, ''); // 부제 제거(도깨비 등)
  const poster = tmdbImg(pick(workExtra(work.id)?.poster, lang), size === 'sm' ? 'w92' : size === 'lg' ? 'w342' : 'w185');
  if (poster) {
    return (
      <div className={`cover cover-${size} has-poster`} style={{ background: `linear-gradient(${angle}deg, ${a}, ${b})` }} aria-hidden>
        <img src={poster} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className={`cover cover-${size}`} style={{ background: `linear-gradient(${angle}deg, ${a}, ${b})` }} aria-hidden>
      <TypeIcon type={work.type} className="cover-icon" />
      {size !== 'sm' && <span className="cover-title">{title}</span>}
      {size !== 'sm' && lang !== 'ko' && <span className="cover-sub">{tr(work.title, lang).replace(/\s*\(.*\)$/, '')}</span>}
      <span className="cover-year">{work.year}</span>
    </div>
  );
}

export function TypeDot({ type }: { type: Work['type'] }) {
  return <span className="dot" style={{ background: TYPE_COLOR[type] }} />;
}

/** 작품 유형 아이콘(흰색 선). 지도 핀과 같은 모양을 씁니다. */
export function TypeIcon({ type, className, size = 20 }: { type: Work['type']; className?: string; size?: number }) {
  return <svg className={className} viewBox="5 5 14 14" width={size} height={size} aria-hidden dangerouslySetInnerHTML={{ __html: GLYPH[type] }} />;
}
