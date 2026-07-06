import { useMemo, useState } from "react";
import { getMediaCandidatePaths } from "../utils/mediaPaths.js";

function DetailField({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function MediaImage({ candidates, altText, className }) {
  const [index, setIndex] = useState(0);

  if (!candidates.length || index >= candidates.length) {
    return null;
  }

  return (
    <img
      className={className}
      src={candidates[index]}
      alt={altText}
      onError={() => setIndex((previous) => previous + 1)}
      loading="lazy"
    />
  );
}

export default function MaterialPopup({ record, activeExport }) {
  const overviewCandidates = useMemo(
    () => getMediaCandidatePaths({
      uuid: record.uuid,
      filename: record.overviewPhoto,
      mediaBasePath: activeExport?.mediaBasePath,
      mediaLayouts: activeExport?.mediaLayouts
    }),
    [record.uuid, record.overviewPhoto, activeExport]
  );

  const closeupCandidates = useMemo(
    () => getMediaCandidatePaths({
      uuid: record.uuid,
      filename: record.closeupPhoto,
      mediaBasePath: activeExport?.mediaBasePath,
      mediaLayouts: activeExport?.mediaLayouts
    }),
    [record.uuid, record.closeupPhoto, activeExport]
  );

  return (
    <article className="popup-content">
      <div className="popup-media-row">
        <MediaImage
          className="popup-media"
          candidates={overviewCandidates}
          altText={record.materialLabel || "Material find"}
        />
        <MediaImage
          className="popup-media closeup"
          candidates={closeupCandidates}
          altText={`${record.materialLabel || "Material find"} closeup`}
        />
      </div>

      <dl className="popup-grid">
        <DetailField label="Material" value={record.materialLabel} />
        <DetailField label="Component" value={record.componentType} />
        <DetailField label="Condition" value={record.condition} />
        <DetailField label="Quantity" value={record.quantity} />
        <DetailField label="Accessibility" value={record.accessibility} />
        <DetailField label="Safe to handle" value={record.safeToHandle} />
        <DetailField label="Collection status" value={record.collectionStatus} />
        <DetailField label="Priority" value={record.priority} />
        <DetailField label="Team" value={record.teamName} />
        <DetailField label="Submitted" value={record.submissionTime} />
        <DetailField label="Notes" value={record.notes} />
        <DetailField label="Reuse idea" value={record.reuseIdea} />
      </dl>
    </article>
  );
}

