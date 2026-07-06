export default function FilterPanel({
  filters,
  options,
  onFilterChange,
  onConditionToggle,
  onClearConditions,
  onResetFilters,
  exports,
  selectedExportId,
  onExportChange
}) {
  return (
    <form className="filter-panel">
      <label>
        Export snapshot
        <select
          value={selectedExportId || ""}
          onChange={(event) => onExportChange(event.target.value)}
        >
          {exports.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Material category
        <select
          value={filters.materialCategory}
          onChange={(event) => onFilterChange("materialCategory", event.target.value)}
        >
          <option value="">All</option>
          {options.materialCategory.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="condition-group">
        <legend>Condition</legend>
        <div className="condition-cloud">
          <button
            type="button"
            className="condition-tag"
            aria-pressed={filters.condition.length === 0}
            onClick={onClearConditions}
          >
            All
          </button>
          {options.condition.map((value) => (
            <button
              key={value}
              type="button"
              className="condition-tag"
              aria-pressed={filters.condition.includes(value)}
              onClick={() => onConditionToggle(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <label>
        Component type
        <select
          value={filters.componentType}
          onChange={(event) => onFilterChange("componentType", event.target.value)}
        >
          <option value="">All</option>
          {options.componentType.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Quantity
        <select
          value={filters.quantity}
          onChange={(event) => onFilterChange("quantity", event.target.value)}
        >
          <option value="">All</option>
          {options.quantity.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Size
        <select
          value={filters.approximateSize}
          onChange={(event) => onFilterChange("approximateSize", event.target.value)}
        >
          <option value="">All</option>
          {options.approximateSize.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="clear-button" onClick={onResetFilters}>
        Clear filters
      </button>
    </form>
  );
}
