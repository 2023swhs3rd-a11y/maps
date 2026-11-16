import type { Lang, Work } from '../types';
import { t, tr } from '../i18n';
import { workExtra, pick, tmdbImg, enrichedAt } from '../data/enrich';

/** 작품 상세: 소개·장르·출연진·볼 수 있는 곳 */
export function WorkDetails({ work, lang }: { work: Work; lang: Lang }) {
  const x = workExtra(work.id);
  const overview = pick(x?.overview, lang) ?? (work.summary ? tr(work.summary, lang) : undefined);
  const genres = pick(x?.genres, lang) ?? [];
  const meta = [
    x?.network,
    x?.episodes ? t('episodesN', lang, { n: x.episodes }) : undefined,
    x?.runtime ? t('minutesN', lang, { n: x.runtime }) : undefined,
    x?.rating ? `★ ${x.rating}` : undefined,
  ].filter(Boolean);
  if (!overview && !genres.length && !x?.cast?.length && !x?.providers?.length) return null;

  return (
    <div className="wd">
      {(genres.length > 0 || meta.length > 0) && (
        <div className="wd-tags">
          {genres.map((g) => <span key={g} className="wd-tag">{g}</span>)}
          {meta.map((m) => <span key={m} className="wd-meta">{m}</span>)}
        </div>
      )}
      {overview && (
        <section>
          <h3 className="sec">{t('synopsis', lang)}</h3>
          <p className="wd-overview">{overview}</p>
        </section>
      )}
      {x?.cast && x.cast.length > 0 && (
        <section>
          <h3 className="sec">{t('cast', lang)}</h3>
          <ul className="wd-cast">
            {x.cast.map((c) => (
              <li key={c.name}>
                {c.profile ? <img src={tmdbImg(c.profile, 'w185')} alt="" loading="lazy" /> : <span className="wd-avatar">{c.name.slice(0, 1)}</span>}
                <strong>{c.name}</strong>
                {c.character && <small>{c.character}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {x?.providers && x.providers.length > 0 && (
        <section>
          <h3 className="sec">{t('watchOn', lang)}</h3>
          <a className="wd-providers" href={x.providersLink ?? x.url} target="_blank" rel="noopener">
            {x.providers.map((p) => (
              <span key={p.name} className="wd-provider">
                <img src={tmdbImg(p.logo, 'w92')} alt="" loading="lazy" />{p.name}
              </span>
            ))}
          </a>
          <small className="hint">{t('providerNote', lang)}</small>
        </section>
      )}
      {x && (
        <a className="wd-src" href={x.url} target="_blank" rel="noopener">
          {t('moreOnTmdb', lang)} ↗{enrichedAt && <span> · {enrichedAt.slice(0, 10)}</span>}
        </a>
      )}
    </div>
  );
}

/** 데이터·사진 출처 (TMDB 이용 약관상 필수 문구 포함) */
export function Sources({ lang }: { lang: Lang }) {
  return (
    <footer className="sources">
      <h3 className="sec">{t('sources', lang)}</h3>
      <ul>
        <li>{t('srcMap', lang)}: <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a></li>
        <li>{t('srcWorks', lang)}: <a href="https://www.themoviedb.org" target="_blank" rel="noopener">TMDB</a> · {t('srcStreaming', lang)}: <a href="https://www.justwatch.com" target="_blank" rel="noopener">JustWatch</a></li>
        <li>{t('srcWikidata', lang)}: <a href="https://www.wikidata.org" target="_blank" rel="noopener">Wikidata</a> (CC0)</li>
        <li>{t('srcPlaces', lang)}: <a href="https://api.visitkorea.or.kr" target="_blank" rel="noopener">{t('kto', lang)} TourAPI</a></li>
      </ul>
      <p className="tmdb-notice">
        <svg viewBox="0 0 48 20" width="38" height="16" aria-label="TMDB"><rect width="48" height="20" rx="4" fill="#0d253f" /><text x="24" y="14.5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#01b4e4" fontFamily="system-ui,sans-serif">TMDB</text></svg>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
