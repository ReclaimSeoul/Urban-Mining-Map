import { useEffect, useMemo, useState } from "react";
import MaterialMap from "./components/MaterialMap.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import Legend from "./components/Legend.jsx";
import { loadKoboData } from "./utils/loadKoboData.js";

const EMPTY_FILTERS = {
  materialCategory: "",
  condition: [],
  componentType: "",
  quantity: "",
  approximateSize: ""
};

function uniqueValues(records, key) {
  return [...new Set(records.map((record) => record[key]).filter(Boolean))].sort();
}

function uniqueConditionValues(records) {
  return [...new Set(records.flatMap((record) => record.conditionTags || []).filter(Boolean))].sort();
}

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [exportIndex, setExportIndex] = useState({ exports: [] });
  const [selectedExportId, setSelectedExportId] = useState("");
  const [activeExport, setActiveExport] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      try {
        const result = await loadKoboData(selectedExportId);
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setExportIndex(result.exportIndex);
        setActiveExport(result.activeExport);
        setErrorMessage("");

        if (selectedExportId !== result.activeExport.id) {
          setSelectedExportId(result.activeExport.id);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setRecords([]);
        setErrorMessage(error.message || "Unable to load KoBo data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [selectedExportId]);

  const options = useMemo(
    () => ({
      materialCategory: uniqueValues(records, "materialCategory"),
      condition: uniqueConditionValues(records),
      componentType: uniqueValues(records, "componentType"),
      quantity: uniqueValues(records, "quantity"),
      approximateSize: uniqueValues(records, "approximateSize")
    }),
    [records]
  );

  const filteredRecords = useMemo(
    () => records.filter((record) => {
      if (filters.materialCategory && record.materialCategory !== filters.materialCategory) {
        return false;
      }

      if (filters.condition.length > 0) {
        const hasAnySelectedCondition = filters.condition.some((selectedCondition) =>
          (record.conditionTags || []).includes(selectedCondition)
        );

        if (!hasAnySelectedCondition) {
          return false;
        }
      }

      if (filters.componentType && record.componentType !== filters.componentType) {
        return false;
      }

      if (filters.quantity && record.quantity !== filters.quantity) {
        return false;
      }

      if (filters.approximateSize && record.approximateSize !== filters.approximateSize) {
        return false;
      }

      return true;
    }),
    [records, filters]
  );

  const activeExportDescription = activeExport?.description || "";

  return (
    <main className="app-shell">
      <section className="title-panel" aria-label="Map title and filters">
        <p className="eyebrow">AAVS Seoul Workshop</p>
        <h1>Reclaim Seoul Map</h1>

        <FilterPanel
          filters={filters}
          options={options}
          onFilterChange={(key, value) => setFilters((previous) => ({ ...previous, [key]: value }))}
          onConditionToggle={(value) => setFilters((previous) => {
            const alreadySelected = previous.condition.includes(value);
            return {
              ...previous,
              condition: alreadySelected
                ? previous.condition.filter((entry) => entry !== value)
                : [...previous.condition, value]
            };
          })}
          onClearConditions={() => setFilters((previous) => ({ ...previous, condition: [] }))}
          onResetFilters={() => setFilters(EMPTY_FILTERS)}
          exports={exportIndex.exports}
          selectedExportId={selectedExportId}
          onExportChange={(value) => {
            setFilters(EMPTY_FILTERS);
            setSelectedExportId(value);
          }}
        />

        {activeExportDescription && <p className="export-description">{activeExportDescription}</p>}
      </section>

      <MaterialMap records={filteredRecords} allRecords={records} activeExport={activeExport} />
      <Legend records={records} />

      {loading && <section className="status-panel">Loading KoBo export...</section>}
      {!loading && errorMessage && <section className="status-panel error">{errorMessage}</section>}
      {!loading && !errorMessage && records.length === 0 && (
        <section className="status-panel">No valid map points found in the selected export.</section>
      )}
    </main>
  );
}

