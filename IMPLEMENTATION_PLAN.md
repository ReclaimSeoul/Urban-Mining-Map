# Implementation Plan

## Objective

Deliver a static-first public workshop map that reads KoBo exports from local files and visualizes valid material-find points with popups and filters.

## Current baseline

- Vite + React (JavaScript) scaffold is ready.
- Leaflet map renders with category coloring and bounds fitting.
- CSV loading + normalization pipeline exists.
- Basic filter panel and legend exist.
- Build is passing.

## Phase 1: Data wiring and workshop-ready ingestion (Day 1)

1. Align the real workshop CSV with app CSV path.
2. Add robust field alias coverage for observed KoBo headers in the current export.
3. Keep strict coordinate validation and warn on skipped rows.
4. Verify missing CSV message appears exactly as required.

Deliverable:

- App reads real submissions from public/data/material-finds.csv and plots valid records.

## Phase 2: Media integration hardening (Day 1-2)

1. Confirm media ZIP extraction strategy and final folder convention.
2. Extend media path helper to support nested workshop folders when needed.
3. Add fallback handling for overview and closeup photos in popups.
4. Keep image failure behavior non-blocking.

Deliverable:

- Popups render cleanly whether images exist or not.

## Phase 3: Popup and filter completeness (Day 2)

1. Complete popup fields per instruction spec.
2. Add safe display formatting for empty values.
3. Verify filters cover category, condition, collection status, priority.
4. Add quick clear-filters action.

Deliverable:

- Reviewers can inspect and narrow entries quickly during workshop sessions.

## Phase 4: UX polish for desktop/mobile (Day 2-3)

1. Improve panel spacing and map overlap behavior on small screens.
2. Improve popup readability and image sizing constraints.
3. Keep map controls usable with floating panels.
4. Validate graceful empty states and loading states.

Deliverable:

- Mobile-friendly, legible workshop map UI.

## Phase 5: Documentation and deploy workflow (Day 3)

1. Finalize README with exact KoBo export/update cycle.
2. Document media folder conventions and fallback logic.
3. Add deployment notes for Vercel and GitHub Pages.
4. Add quick troubleshooting section for common CSV/media errors.

Deliverable:

- Anyone on the team can update data and redeploy without code changes.

## Phase 6: Acceptance checklist and handoff (Day 3)

1. Run install/dev/build checks.
2. Validate acceptance criteria one by one.
3. Record known limitations and future improvements.

Deliverable:

- Workshop-ready release candidate that satisfies the instruction file.

## Immediate next tasks for this repository

1. Copy or transform public/20260703_materials_data.csv into public/data/material-finds.csv.
2. Decide whether to flatten media or map nested workshop folders into UUID/file structure.
3. Smoke-test with 10-20 known records and verify popup values against CSV rows.
# Implementation Plan

## 1. Static App Foundation

- Install and verify the Vite React app starts with `npm run dev`.
- Import Leaflet CSS in `src/main.jsx`.
- Build a full-viewport app shell with a title panel, filter area, map surface, and legend.

## 2. KoBo CSV Loading

- Fetch `/data/material-finds.csv` from `src/utils/loadKoboData.js`.
- Parse with PapaParse using `header: true`.
- Handle missing CSV with the message: `No KoBo export found. Add a CSV file at public/data/material-finds.csv.`
- Log rows without valid coordinates and skip them on the map.

## 3. Tolerant Record Normalization

- Implement `src/utils/normalizeKoboRecord.js` with aliases for the preferred KoBo field names and the current exported column names.
- Support both geopoint formats:
  - single space-separated field such as `location`
  - split latitude/longitude fields such as `location_latitude` and `location_longitude`
- Normalize each row into the requested record shape.

## 4. Media Resolution

- Implement `src/utils/mediaPaths.js`.
- Prefer `/media/<uuid>/<filename>` and fall back to `/media/<filename>`.
- Hide failed images inside popups so missing attachments do not break the interface.

## 5. Map Rendering

- Build `MaterialMap.jsx` with React Leaflet.
- Use the default Seoul center `[37.5665, 126.9780]` and zoom `12`.
- Fit bounds after valid records load.
- Add markers for all filtered records.
- Use simple category colors if practical, with a legend.

## 6. Popups

- Build `MaterialPopup.jsx` with overview image, material category, component type, condition, quantity, accessibility, safe-to-handle status, collection status, priority, team name, submission time, notes, and reuse idea.
- Keep popup images readable on mobile with a max width around `240px`.

## 7. Filters And Legend

- Build `FilterPanel.jsx` with select controls for material category, condition, collection status, and priority.
- Derive filter options from loaded records.
- Build `Legend.jsx` to explain category marker colors or, if category colors are deferred, condition/status meaning.

## 8. Verification

- Run `npm install`.
- Run `npm run build`.
- Start `npm run dev` and confirm the map loads the CSV.
- Verify markers, popups, filters, empty state, and missing-image behavior.

