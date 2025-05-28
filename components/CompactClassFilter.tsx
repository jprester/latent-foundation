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

  const getFilterColor = (filterValue: string, isActive: boolean) => {
    const baseClasses = "transition-all duration-200";

    if (isActive) {
      switch (filterValue) {
        case "Safe":
          return `${baseClasses} text-white bg-scp-safe dark:bg-scp-safe-dark border-scp-safe dark:border-scp-safe-dark shadow-lg shadow-scp-safe/20 dark:shadow-scp-safe-dark/20`;
        case "Euclid":
          return `${baseClasses} text-white bg-scp-euclid dark:bg-scp-euclid-dark border-scp-euclid dark:border-scp-euclid-dark shadow-lg shadow-scp-euclid/20 dark:shadow-scp-euclid-dark/20`;
        case "Keter":
          return `${baseClasses} text-white bg-scp-keter dark:bg-scp-keter-dark border-scp-keter dark:border-scp-keter-dark shadow-lg shadow-scp-keter/20 dark:shadow-scp-keter-dark/20`;
        default:
          return `${baseClasses} text-white bg-scp-accent dark:bg-scp-accent-dark border-scp-accent dark:border-scp-accent-dark shadow-lg shadow-scp-accent/20 dark:shadow-scp-accent-dark/20`;
      }
    } else {
      return `${baseClasses} text-scp-muted dark:text-scp-muted-dark border-scp-border dark:border-scp-border-dark hover:text-scp-text dark:hover:text-scp-text-dark hover:border-scp-accent/30 dark:hover:border-scp-accent-dark/30 hover:bg-scp-accent/5 dark:hover:bg-scp-accent-dark/5`;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-scp-muted dark:text-scp-muted-dark mr-1 whitespace-nowrap font-medium">
        CLASS:
      </span>
      <div className="flex gap-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1.5 text-xs font-mono font-semibold border rounded-lg ${getFilterColor(
              filter.value,
              activeFilter === filter.value
            )}`}>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
