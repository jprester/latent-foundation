"use client";

interface ClassFilterProps {
  activeFilter: "All" | "Safe" | "Euclid" | "Keter";
  onFilterChange: (filter: "All" | "Safe" | "Euclid" | "Keter") => void;
}

export default function ClassFilter({
  activeFilter,
  onFilterChange,
}: ClassFilterProps) {
  const filters: ("All" | "Safe" | "Euclid" | "Keter")[] = [
    "All",
    "Safe",
    "Euclid",
    "Keter",
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-2 justify-center">
      {filters.map((filterName) => (
        <button
          key={filterName}
          onClick={() => onFilterChange(filterName)}
          className={`px-4 py-2 rounded font-mono text-sm font-semibold transition-colors ${
            activeFilter === filterName
              ? "bg-scp-accent dark:bg-scp-accent-dark text-white"
              : "bg-scp-card dark:bg-scp-card-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
          } border border-scp-border dark:border-scp-border-dark`}>
          {filterName === "All" ? "ALL CLASSES" : `${filterName.toUpperCase()}`}
        </button>
      ))}
    </div>
  );
}
