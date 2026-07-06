import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import MaterialPopup from "./MaterialPopup.jsx";

const DEFAULT_CENTER = [37.5665, 126.978];
const DEFAULT_ZOOM = 12;

const CATEGORY_PALETTE = [
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#065f46",
  "#0369a1",
  "#7f1d1d",
  "#475569",
  "#4d7c0f"
];

const CATEGORY_SYMBOLS = ["●", "■", "▲", "◆", "✦", "⬢", "⬤", "⬟", "◉", "✚"];

function categoryHash(category) {
  const text = String(category || "").trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getCategoryStyle(materialCategory) {
  if (!materialCategory) {
    return {
      color: "#1f2937",
      symbol: "●"
    };
  }

  const hash = categoryHash(materialCategory);
  return {
    color: CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length],
    symbol: CATEGORY_SYMBOLS[hash % CATEGORY_SYMBOLS.length]
  };
}

export function categoryColor(materialCategory) {
  return getCategoryStyle(materialCategory).color;
}

function FitBounds({ allRecords }) {
  const map = useMap();

  useEffect(() => {
    if (!allRecords.length) {
      return;
    }

    const bounds = allRecords.map((record) => [record.lat, record.lon]);
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
  }, [map, allRecords]);

  return null;
}

export default function MaterialMap({ records, allRecords, activeExport }) {
  const center = Array.isArray(activeExport?.center) ? activeExport.center : DEFAULT_CENTER;
  const zoom = Number.isFinite(activeExport?.zoom) ? activeExport.zoom : DEFAULT_ZOOM;
  const tileUrl = activeExport?.tileUrl || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution = activeExport?.tileAttribution ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      key={activeExport?.id || "default-export"}
      className="map-root"
      center={center}
      zoom={zoom}
      zoomControl={false}
    >
      <ZoomControl position="topright" />
      <TileLayer attribution={tileAttribution} url={tileUrl} />
      <FitBounds allRecords={allRecords} />

      {records.map((record) => (
        <CircleMarker
          key={record.id}
          center={[record.lat, record.lon]}
          radius={8}
          color={categoryColor(record.materialCategory)}
          fillOpacity={0.85}
          weight={2}
        >
          <Popup maxWidth={300}>
            <MaterialPopup record={record} activeExport={activeExport} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
