# 씬맵 SceneMap

Live: https://2023swhs3rd-a11y.github.io/maps/

This app shows places that appear in dramas, films and literature on a map. It is a PWA for tourists, both Korean and international, in Korean, English, Japanese and Simplified Chinese.

## Run
```bash
npm install
npm run dev      # dev server
npm test         # tests for spoiler, search and data rules
npm run build    # production build (dist/)
```

## Structure
- `src/data/works.ts`: works (Korea and Japan; types drama, film, anime, literature), plus their progress segments (episodes, or opening/development/climax/ending)
- `src/data/places.ts`: places (coordinates, segment where each first appears, spoiler level, safe/full descriptions)
- `src/lib/spoiler.ts`: spoiler visibility rules
- `src/lib/search.ts`: search across all four languages plus Korean initial consonants (choseong); excludes hidden places and locked descriptions
- `src/components/MapView.tsx`: MapLibre GL map with OpenFreeMap vector tiles (OpenStreetMap data, no API key). Map labels follow the app language via OSM `name:ko/en/ja/zh`, falling back to romanized names.
- `src/components/Sheet.tsx`: bottom sheet on mobile (peek / half / full), floating panel on desktop

## Spoiler rules
| Level | Not watched yet | Watched up to where it appears |
|---|---|---|
| 0 Safe | Place and description shown | Same |
| 1 Minor | Place shown, details locked, details not searchable | Details unlocked (behind a tap) |
| 2 Major | Place hidden; only the count is shown; not searchable | Shown |

## Before release
- All sample data is `verified: false`, with approximate coordinates. Coordinates, episode numbers and scene descriptions must be checked.
- Japanese and Chinese translations need a native-speaker review.
- OpenFreeMap is free with no key or request limit, but has no SLA. To switch providers (e.g. MapTiler), change `STYLE_URL` in `MapView.tsx`.

## External data (TMDB, TourAPI)
`npm run enrich` (`scripts/enrich.mjs`) fetches extra data into `src/data/enrich.json`:
- **TMDB** (films and dramas): overview, poster, genres, cast, network and Korean streaming services (from JustWatch), in ko/en/ja/zh.
- **Korea Tourism Organization TourAPI** (places): representative photo and official coordinates. A result is accepted only if it lies within 5 km of our coordinates. Within 3 km, the app uses the official coordinates.

The deploy workflow runs this before every build and every Monday (weekly refresh), using these repository secrets:

| Secret | Where to get it |
|---|---|
| `TMDB_TOKEN` | themoviedb.org → Settings → API → "API Read Access Token" |
| `TOURAPI_KEY` | data.go.kr → 한국관광공사_국문 관광정보 서비스_GW → 활용신청 → 일반 인증키 (Decoding) |

Without secrets the step is skipped and the app falls back to the built-in data. Each run's match report appears in the Actions job summary.
To run it locally: `TMDB_TOKEN=... TOURAPI_KEY=... npm run enrich` (Node 22.18+).

TMDB is free for **non-commercial** use only and requires the attribution shown in the app's "Data sources" section.

## Deploy
Pushing to `main` triggers `.github/workflows/deploy.yml`, which tests, builds and publishes to GitHub Pages.
One-time setup: repository Settings → Pages → Source: **GitHub Actions**.
