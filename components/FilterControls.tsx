"use client";

import SearchBar from "./SearchBar";
import CompactClassFilter from "./CompactClassFilter";
import { FilterType } from "@/types/filter";

interface FilterControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalStories: number;
  filteredCount: number;
}

export default function FilterControls({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalStories,
  filteredCount,
}: FilterControlsProps) {
  return (
    <div className="mb-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between mb-4">
        {/* Search Bar - Left Side */}
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Search stories, titles, tags..."
          />
        </div>

        {/* Class Filter - Right Side */}
        <div className="w-full sm:w-auto flex justify-end">
          <CompactClassFilter
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>

      {/* Results Counter */}
      <div className="hidden sm:flex items-center justify-between text-xs font-mono text-gray-600 dark:text-gray-400">
        <div>
          {searchTerm || activeFilter !== "All" ? (
            <span>
              SHOWING {filteredCount} OF {totalStories} STORIES
              {searchTerm && (
                <span className="ml-2">
                  FOR &quot;{searchTerm.toUpperCase()}&quot;
                </span>
              )}
              {activeFilter !== "All" && (
                <span className="ml-2">
                  • CLASS {activeFilter.toUpperCase()}
                </span>
              )}
            </span>
          ) : (
            <span>TOTAL: {totalStories} STORIES</span>
          )}
        </div>

        {/* Clear Filters */}
        {(searchTerm || activeFilter !== "All") && (
          <button
            onClick={() => {
              onSearchChange("");
              onFilterChange("All");
            }}
            className="text-scp-accent dark:text-scp-accent-dark hover:text-red-800 dark:hover:text-red-400 transition-colors underline">
            CLEAR FILTERS
          </button>
        )}
      </div>
    </div>
  );
}
