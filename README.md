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
- `src/data/works.ts`: works, plus their progress segments (episodes, or opening/development/climax/ending)
- `src/data/places.ts`: places (coordinates, segment where each first appears, spoiler level, safe/full descriptions)
- `src/lib/spoiler.ts`: spoiler visibility rules
- `src/lib/search.ts`: search across all four languages plus Korean initial consonants (choseong); excludes hidden places and locked descriptions
- `src/components/MapView.tsx`: Leaflet map (CARTO Voyager / Dark Matter tiles from OpenStreetMap data)
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
- CARTO basemaps are free for limited non-commercial use; for real traffic, move to a paid tile plan (CARTO, MapTiler, etc.).

## Deploy
Pushing to `main` triggers `.github/workflows/deploy.yml`, which tests, builds and publishes to GitHub Pages.
One-time setup: repository Settings → Pages → Source: **GitHub Actions**.
