function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/^_+/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildLookup(raw) {
  const map = new Map();

  Object.entries(raw || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeHeader(key);
    if (!normalizedKey) {
      return;
    }

    if (!map.has(normalizedKey)) {
      map.set(normalizedKey, value);
    }
  });

  return map;
}

function firstValue(lookup, candidates) {
  for (const candidate of candidates) {
    const value = normalizeValue(lookup.get(normalizeHeader(candidate)));
    if (value) {
      return value;
    }
  }

  return "";
}

function toLabel(text) {
  return text
    .replace(/^condition_/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(value) {
  return value
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function inferConditionFromFlags(lookup) {
  const conditionFlagKeys = [
    "condition_intact_reusable_as_found",
    "condition_usable_with_cleaning",
    "condition_usable_with_repair",
    "condition_damaged_but_useful",
    "condition_broken_fragments_only",
    "condition_contaminated_dirty",
    "condition_unsafe_hazardous"
  ];

  const selected = conditionFlagKeys
    .filter((key) => normalizeValue(lookup.get(key)) === "1")
    .map(toLabel)
    .map(toTitleCase);

  return selected;
}

function parseReusePotential(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanUuid(value) {
  return normalizeValue(value).replace(/^uuid:/i, "").trim();
}

function parseCoordinates(lookup) {
  const geopoint = firstValue(lookup, [
    "location",
    "location_of_observation",
    "gps_location",
    "geopoint"
  ]);

  if (geopoint) {
    const [latRaw, lonRaw] = geopoint.split(/[\s,]+/);
    const lat = parseNumber(latRaw);
    const lon = parseNumber(lonRaw);

    if (lat !== null && lon !== null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { lat, lon };
    }
  }

  const lat = parseNumber(firstValue(lookup, [
    "location_latitude",
    "location_of_observation_latitude",
    "latitude",
    "lat"
  ]));

  const lon = parseNumber(firstValue(lookup, [
    "location_longitude",
    "location_of_observation_longitude",
    "longitude",
    "lon",
    "lng"
  ]));

  if (lat !== null && lon !== null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
    return { lat, lon };
  }

  return null;
}

export function normalizeKoboRecord(row, index, activeExport) {
  const lookup = buildLookup(row);
  const coords = parseCoordinates(lookup);

  if (!coords) {
    return null;
  }

  const uuid = cleanUuid(firstValue(lookup, ["_uuid", "uuid", "submission_uuid", "meta_rootuuid"]));
  const materialCategory = firstValue(lookup, ["material_category", "material_type", "material"]);
  const materialOther = firstValue(lookup, ["material_other", "material_type_other"]);
  const componentType = firstValue(lookup, ["component_type", "component"]);
  const componentOther = firstValue(lookup, ["component_other", "component_type_other"]);
  const conditionValue = firstValue(lookup, ["condition"]);
  const inferredConditionTags = inferConditionFromFlags(lookup);
  const conditionTags = conditionValue
    ? conditionValue.split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
    : inferredConditionTags;
  const derivedCondition = conditionTags.join(", ");
  const reusePotential = parseReusePotential(firstValue(lookup, ["reuse_potential"]));

  return {
    id: uuid || firstValue(lookup, ["_id", "id"]) || `row-${index + 1}`,
    uuid,
    submissionTime: firstValue(lookup, [
      "_submission_time",
      "submission_time",
      "date_time_of_observation",
      "start"
    ]),
    teamName: firstValue(lookup, ["team_name", "team_student_name", "student_name", "team"]),
    lat: coords.lat,
    lon: coords.lon,
    materialCategory,
    materialLabel: materialCategory || materialOther,
    componentType: componentType || componentOther,
    quantity: firstValue(lookup, ["quantity", "approximate_quantity"]),
    approximateSize: firstValue(lookup, ["approximate_size", "size"]),
    condition: derivedCondition,
    conditionTags,
    accessibility: firstValue(lookup, ["accessibility"]),
    safeToHandle: firstValue(lookup, ["safe_to_handle"]),
    reusePotential,
    reuseIdea: firstValue(lookup, ["reuse_idea", "possible_reuse_idea"]),
    collectionStatus: firstValue(lookup, ["collection_status", "status", "_status"]),
    priority: firstValue(lookup, ["priority"]),
    notes: firstValue(lookup, ["notes", "additional_notes", "_notes"]),
    overviewPhoto: firstValue(lookup, [
      "overview_photo",
      "overviewphoto",
      "overview_photo_url"
    ]),
    closeupPhoto: firstValue(lookup, [
      "close_up_photo",
      "closeup_photo",
      "upload_close_up_photo",
      "upload_closeup_photo",
      "close_up_photo_url",
      "upload_close_up_photo_url"
    ]),
    manualLocationNote: firstValue(lookup, ["manual_location_note"]),
    exportId: activeExport?.id || "",
    raw: row
  };
}

