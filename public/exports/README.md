# Export Registry

This folder controls which data and media snapshots are available in the app.

The app reads `public/exports/index.json` and shows each entry in the Export snapshot dropdown.

## Structure

Each export entry supports:

- `id`: unique key
- `label`: display text in UI
- `description`: optional helper text
- `csvPath`: public-relative CSV path
- `mediaBasePath`: public-relative media root path
- `mediaLayouts`: image lookup strategy list (`uuid`, `flat`, optional `nested`)
- `delimiter`: CSV delimiter (`;` for KoBo export in this repository)
- `center`: optional map center `[lat, lon]`
- `zoom`: optional default zoom

## Add a new snapshot

1. Create a new folder in `public/uploads`, for example `public/uploads/2026-07-04`.
2. Put the CSV at `public/uploads/2026-07-04/data/materials.csv`.
3. Put media attachments at `public/uploads/2026-07-04/media`.
4. Add a new entry to `public/exports/index.json`.
5. Set `defaultExportId` if you want it to be the initial view.

No code changes are required to make a new snapshot selectable.

Recommended snapshot layout:

```text
public/uploads/<snapshot-id>/
  data/
    materials.csv
  media/
    <submission_uuid>/<filename>
```
