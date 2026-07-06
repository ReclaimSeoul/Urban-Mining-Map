# Upload Snapshots

Store each KoBo export as a separate snapshot folder:

```text
public/uploads/
  2026-07-03/
    data/
      materials.csv
    media/
      <submission_uuid>/
        <attachment files>
```

Use one folder per upload date or named version. Do not overwrite an older upload if you want it
to remain selectable in the app.

After adding a snapshot, register it in `public/exports/index.json`:

```json
{
  "id": "upload-2026-07-03",
  "label": "Upload 2026-07-03",
  "csvPath": "/uploads/2026-07-03/data/materials.csv",
  "mediaBasePath": "/uploads/2026-07-03/media",
  "mediaLayouts": ["uuid", "flat"],
  "delimiter": ";"
}
```

Set `defaultExportId` in `public/exports/index.json` to choose which upload opens first.
