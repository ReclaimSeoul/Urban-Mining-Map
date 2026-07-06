function normalizeFilename(filename) {
  return String(filename || "").trim().replace(/^\/+/, "").replace(/\\+/g, "/");
}

function encodePathSegments(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function getMediaCandidatePaths({
  uuid,
  filename,
  mediaBasePath = "",
  mediaLayouts = ["uuid", "flat"]
}) {
  const cleanFile = normalizeFilename(filename);
  if (!cleanFile) {
    return [];
  }

  if (/^https?:\/\//i.test(cleanFile)) {
    return [cleanFile];
  }

  const basePath = String(mediaBasePath || "").replace(/\/$/, "");
  if (!basePath) {
    return [];
  }
  const encodedFile = encodePathSegments(cleanFile);
  const candidates = [];

  if (mediaLayouts.includes("uuid") && uuid) {
    candidates.push(`${basePath}/${encodeURIComponent(uuid)}/${encodedFile}`);
  }

  if (mediaLayouts.includes("flat")) {
    candidates.push(`${basePath}/${encodedFile}`);
  }

  if (mediaLayouts.includes("nested")) {
    candidates.push(`${basePath}/${cleanFile}`);
  }

  return unique(candidates);
}

export function getMediaPath(uuid, filename) {
  return getMediaCandidatePaths({ uuid, filename })[0] || "";
}
