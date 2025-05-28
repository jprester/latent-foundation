"use client";

import { FilterType } from "@/types/filter";

type CompactClassFilterProps = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export default function CompactClassFilter({
  activeFilter,
  onFilterChange,
}: CompactClassFilterProps) {
  const filters: {
    value: FilterType;
    label: string;
  }[] = [
    { value: "All", label: "ALL" },
    { value: "Safe", label: "SAFE" },
    { value: "Euclid", label: "EUCLID" },
    { value: "Keter", label: "KETER" },
  ];

  const getFilterColor = (filterValue: string) => {
    switch (filterValue) {
      case "Safe":
        return "text-scp-safe dark:text-scp-safe-dark border-scp-safe dark:border-scp-safe-dark";
      case "Euclid":
        return "text-scp-euclid dark:text-scp-euclid-dark border-scp-euclid dark:border-scp-euclid-dark";
      case "Keter":
        return "text-scp-keter dark:text-scp-keter-dark border-scp-keter dark:border-scp-keter-dark";
      default:
        return "text-gray-600 dark:text-gray-400 border-gray-400 dark:border-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400 mr-2 whitespace-nowrap">
        CLASS:
      </span>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-2 py-1 text-xs font-mono font-semibold transition-all duration-200 border rounded ${
            activeFilter === filter.value
              ? `${getFilterColor(
                  filter.value
                )} bg-opacity-10 dark:bg-opacity-20`
              : "text-gray-500 dark:text-gray-500 border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
          }`}>
          {filter.label}
        </button>
      ))}
    </div>
  );
}
