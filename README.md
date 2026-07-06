# Reclaim Seoul Map

A lightweight public web map for material and trash finds collected through KoBoToolbox during the AAVS Seoul workshop.

This app is the public presentation layer only. KoBoToolbox remains the data collection interface.

## Run locally

```bash
npm install
npm run dev
```

Build for deployment:

```bash
npm run build
```

Output directory: `dist`.

## New multi-export structure

This project now supports multiple data and media snapshots, selectable in the app.

Registry file:

```text
public/exports/index.json
```

Each export entry points to:

- one CSV path
- one media base path
- media layout rules (`uuid`, `flat`, optional `nested`)

The app reads the registry and shows all entries in the Export snapshot dropdown.

## Recommended public folder pattern

```text
public/
  exports/
    index.json
    README.md
  uploads/
    2026-07-03/
      data/
        materials.csv
      media/
        <submission_uuid>/<filename>
```

Each upload gets its own folder. To swap between uploads, add each folder to
`public/exports/index.json`; the app shows them in the Export snapshot dropdown.

## KoBo update workflow

1. Export latest submissions from KoBo as CSV.
2. Download latest media attachments ZIP.
3. Create a dated folder such as `public/uploads/2026-07-04`.
4. Place the CSV at `public/uploads/2026-07-04/data/materials.csv`.
5. Place attachments at `public/uploads/2026-07-04/media`.
6. Add an export entry in `public/exports/index.json`.
7. Set `defaultExportId` to choose the initial upload.
8. Reload the app and choose the snapshot from Export snapshot.
9. Commit and redeploy.

## Media lookup rules

For each record image filename, the app tries candidate paths in order based on export config:

- `uuid`: `<mediaBasePath>/<submission_uuid>/<filename>`
- `flat`: `<mediaBasePath>/<filename>`
- `nested` (optional): `<mediaBasePath>/<filename with subfolders>`

Missing images are ignored and do not break popup rendering.

## Deployment

### Vercel

Use the default Vite build command:

```bash
npm run build
```

Set output directory to `dist`.

### GitHub Pages

Build with `npm run build` and publish `dist` through your preferred workflow.

## Security note

Do not include KoBo credentials, API tokens, or private keys in frontend files.
