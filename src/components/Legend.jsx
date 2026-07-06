import { useState } from "react";
import { getCategoryStyle } from "./MaterialMap.jsx";

export default function Legend({ records }) {
  const [collapsed, setCollapsed] = useState(false);
  const categories = [...new Set(records.map((record) => record.materialCategory).filter(Boolean))].slice(0, 10);

  return (
    <aside className={`legend ${collapsed ? "is-collapsed" : ""}`} aria-label="Map legend">
      <div className="legend-header">
        <h2>Legend</h2>
        <button
          type="button"
          className="legend-toggle"
          onClick={() => setCollapsed((previous) => !previous)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Show legend" : "Hide legend"}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed && (
        <>
          {categories.length === 0 && <p>Category styles appear when data is loaded.</p>}
          {categories.map((category) => {
            const style = getCategoryStyle(category);

            return (
              <div key={category} className="legend-row">
                <span className="legend-swatch" style={{ background: style.color }} />
                <span className="legend-label">{category}</span>
              </div>
            );
          })}
        </>
      )}
    </aside>
  );
}

