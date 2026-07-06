# Codex Instructions — KoBo Public Material Finds Map

## Project name
`reclaim-seoul-map`

## Goal
Build a lightweight public web map that displays material/trash finds collected through KoBoToolbox during the AAVS Seoul workshop. The app should be simple, static-first, easy to deploy to Vercel or GitHub Pages, and able to load exported KoBo data plus submitted images.

The app is not responsible for collecting data. KoBoToolbox remains the collection interface. This web app is only the public presentation layer.

## Core workflow

```text
KoBoToolbox form submissions
→ Export CSV/XLSX/GeoJSON from KoBo
→ Download Media Attachments ZIP from KoBo
→ Place exported data and media in the web app repository
→ Web app renders points on an interactive map
```

## Tech stack

Use:
- Vite
- React
- JavaScript, not TypeScript
- Leaflet for the map
- react-leaflet if useful
- PapaParse for CSV parsing, unless using GeoJSON directly
- Plain CSS modules or simple CSS

Avoid:
- TypeScript
- Heavy GIS libraries unless necessary
- Backend/database in the first version
- User authentication
- Mapbox-only dependency if possible

Prefer OpenStreetMap raster tiles for the first version, but keep the tile URL configurable. Add comments warning that public OSM tiles are fine for light workshop/demo use but a dedicated tile provider should be used for public/high-traffic deployment.

## Repository structure

Create this structure:

```text
reclaim-seoul-map/
  package.json
  index.html
  vite.config.js
  README.md
  public/
    data/
      material-finds.csv
      material-finds.geojson
    media/
      README.md
  src/
    App.jsx
    main.jsx
    styles.css
    components/
      MaterialMap.jsx
      MaterialPopup.jsx
      FilterPanel.jsx
      Legend.jsx
    utils/
      loadKoboData.js
      normalizeKoboRecord.js
      mediaPaths.js
```

The app should work if only `public/data/material-finds.csv` exists. GeoJSON support can be added as optional/future support.

## Expected KoBo fields

Assume the exported CSV may contain the following columns. The exact names can vary, so implement a tolerant mapping in `normalizeKoboRecord.js`.

Preferred KoBo field names:

```text
_uuid
_submission_time
team_name
location
material_category
material_other
component_type
component_other
quantity
approximate_size
condition
accessibility
safe_to_handle
reuse_potential
reuse_idea
collection_status
priority
notes
overview_photo
closeup_photo
manual_location_note
location_method
```

KoBo geopoint fields may export in one of these formats:

1. One field containing a space-separated geopoint:

```text
location = "37.5665 126.9780 0 5"
```

where the format is:

```text
latitude longitude altitude accuracy
```

2. Split fields such as:

```text
location_latitude
location_longitude
location_altitude
location_precision
```

The app must support both. If no valid latitude/longitude exists, skip the point on the map but list it in the console as a warning.

## Media handling

KoBo media exports usually include attachment filenames in the CSV and downloadable files in a Media Attachments ZIP. The ZIP groups attachments by submission UUID, and the UUID also appears as `_uuid` in the dataset.

Support two possible media layouts:

```text
public/media/<filename>
```

and:

```text
public/media/<submission_uuid>/<filename>
```

Implement a helper in `mediaPaths.js` that receives `record._uuid` and `filename` and returns the best likely relative path. It is acceptable if the first version assumes:

```text
/media/<submission_uuid>/<filename>
```

but document how to change it.

If an image is missing or fails to load, the popup should still work and hide the broken image.

## Map behavior

Implement an interactive Leaflet map with:

- Default center: Seoul / Yonsei area
- Default zoom: around 13
- Markers for each valid material find
- Popups showing submitted information
- Marker color or icon distinction by `material_category` if simple to implement
- Fit bounds to all valid points after data loads
- Graceful empty state if no data is available

Default center:

```js
const DEFAULT_CENTER = [37.5665, 126.9780];
const DEFAULT_ZOOM = 12;
```

For Yonsei-focused fieldwork, optionally use:

```js
const YONSEI_CENTER = [37.5658, 126.9386];
```

## Popup content

Each marker popup should show:

- Overview image, if available
- Material category
- Component type
- Condition
- Quantity
- Accessibility
- Safe to handle
- Collection status
- Priority
- Team/student name
- Submission time
- Notes
- Possible reuse idea

Do not expose internal KoBo IDs except optionally for debugging.

## Filters

Add a simple filter panel with:

- Material category
- Condition
- Collection status
- Priority

Filters can be simple select dropdowns. If no filter is selected, show all valid points.

## Legend

Add a small legend explaining material category colors/icons if implemented. If colors are not implemented, add a legend explaining condition/collection status instead.

## Data loading

In `loadKoboData.js`:

1. Fetch `/data/material-finds.csv`.
2. Parse with PapaParse using `header: true`.
3. Normalize each row using `normalizeKoboRecord`.
4. Filter out rows without valid coordinates.
5. Return an array of records.

If CSV is missing, show a helpful message:

```text
No KoBo export found. Add a CSV file at public/data/material-finds.csv.
```

## Normalized record shape

Normalize records into this shape:

```js
{
  id: string,
  uuid: string,
  submissionTime: string,
  teamName: string,
  lat: number,
  lon: number,
  materialCategory: string,
  materialLabel: string,
  componentType: string,
  quantity: string,
  approximateSize: string,
  condition: string,
  accessibility: string,
  safeToHandle: string,
  reusePotential: string[],
  reuseIdea: string,
  collectionStatus: string,
  priority: string,
  notes: string,
  overviewPhoto: string,
  closeupPhoto: string,
  manualLocationNote: string,
  raw: object
}
```

## Styling

Keep the visual style clean and workshop-friendly:

- Full viewport map
- Floating title panel at top-left
- Filter panel below title
- Legend at bottom-left or bottom-right
- Popups should be readable on mobile
- Images in popups should have max width around 240px

Use CSS only. No UI component library.

## Deployment

The app should deploy with:

```bash
npm install
npm run dev
npm run build
```

For Vercel:

```bash
npm run build
```

Output directory:

```text
dist
```

## README requirements

Write a README explaining:

1. What the app does.
2. How to export data from KoBo.
3. Where to put the CSV:

```text
public/data/material-finds.csv
```

4. Where to put media files:

```text
public/media/
```

5. How to run locally.
6. How to deploy to Vercel or GitHub Pages.
7. How to update the map during the workshop:

```text
Export latest CSV from KoBo
Replace public/data/material-finds.csv
Download latest media ZIP if needed
Copy media files into public/media
Commit and redeploy
```

## Important constraints

- Do not build a custom submission form yet.
- Do not require a backend.
- Do not require API tokens in the first version.
- Do not include private KoBo credentials in the frontend.
- Keep it simple and robust for a 10-day workshop.

## Optional future improvements

Add these only after the basic version works:

- Auto-fetch from KoBo API through a serverless function
- GitHub Action to update data periodically
- Clustering markers
- Photo gallery view
- Export selected entries as material passport JSON
- A-Frame/WebXR view of selected material finds
- Admin review/approval flag before public display

## Acceptance criteria

The task is complete when:

- `npm install` works.
- `npm run dev` opens a map.
- The map loads `public/data/material-finds.csv`.
- Markers appear for valid KoBo GPS points.
- Popups show at least image, material category, condition, notes, and team name.
- Filters work for category/status/condition.
- Missing images do not break the popup.
- The README explains the KoBo export/update workflow clearly.
