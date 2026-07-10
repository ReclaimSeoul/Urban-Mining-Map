import Papa from "papaparse";
import { normalizeKoboRecord } from "./normalizeKoboRecord.js";

const PUBLIC_BASE_URL = import.meta.env.BASE_URL || "/";
const EXPORT_INDEX_PATH = resolvePublicPath("exports/index.json");

function resolvePublicPath(path) {
  const value = String(path || "").trim();

  if (!value || /^(?:https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  const base = PUBLIC_BASE_URL.endsWith("/") ? PUBLIC_BASE_URL : `${PUBLIC_BASE_URL}/`;
  return new URL(value.replace(/^\/+/, ""), window.location.origin + base).pathname;
}

function normalizeExportIndex(index) {
  if (!index || !Array.isArray(index.exports) || !index.exports.length) {
    return {
      defaultExportId: "",
      exports: []
    };
  }

  return {
    defaultExportId: index.defaultExportId || index.exports[0].id,
    exports: index.exports
      .filter((entry) => entry && entry.id && entry.csvPath)
      .map((entry) => ({
        id: entry.id,
        label: entry.label || entry.id,
        description: entry.description || "",
        csvPath: resolvePublicPath(entry.csvPath),
        mediaBasePath: resolvePublicPath(entry.mediaBasePath),
        mediaLayouts: Array.isArray(entry.mediaLayouts) && entry.mediaLayouts.length
          ? entry.mediaLayouts
          : ["uuid", "flat"],
        delimiter: entry.delimiter || "",
        center: Array.isArray(entry.center) ? entry.center : null,
        zoom: Number.isFinite(Number(entry.zoom)) ? Number(entry.zoom) : null,
        tileUrl: entry.tileUrl || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        tileAttribution: entry.tileAttribution ||
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }))
  };
}

async function fetchExportIndex() {
  try {
    const response = await fetch(EXPORT_INDEX_PATH, { cache: "no-store" });
    if (!response.ok) {
      return normalizeExportIndex(null);
    }

    const data = await response.json();
    return normalizeExportIndex(data);
  } catch {
    return normalizeExportIndex(null);
  }
}

function resolveActiveExport(index, selectedExportId) {
  const selected = index.exports.find((entry) => entry.id === selectedExportId);
  if (selected) {
    return selected;
  }

  const fallback = index.exports.find((entry) => entry.id === index.defaultExportId);
  return fallback || index.exports[0];
}

function parseCsv(csvText, delimiter) {
  return new Promise((resolve, reject) => {
    const parseOptions = {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data || []),
      error: (error) => reject(error)
    };

    if (delimiter) {
      parseOptions.delimiter = delimiter;
    }

    Papa.parse(csvText, parseOptions);
  });
}

export async function loadKoboData(selectedExportId) {
  const exportIndex = await fetchExportIndex();
  const activeExport = resolveActiveExport(exportIndex, selectedExportId);

  if (!activeExport) {
    throw new Error("No upload snapshots are registered in /exports/index.json.");
  }

  const response = await fetch(activeExport.csvPath, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `No KoBo export found for ${activeExport.label}. Add a CSV file at ${activeExport.csvPath}.`
    );
  }

  const csvText = await response.text();
  const rows = await parseCsv(csvText, activeExport.delimiter);
  const records = [];

  rows.forEach((row, index) => {
    const normalized = normalizeKoboRecord(row, index, activeExport);
    if (!normalized) {
      console.warn("Skipping row without valid coordinates", row);
      return;
    }

    records.push(normalized);
  });

  return {
    records,
    exportIndex,
    activeExport
  };
}
