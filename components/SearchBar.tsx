"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search stories...",
}: SearchBarProps) {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-scp-card dark:bg-scp-card-dark border border-scp-border dark:border-scp-border-dark rounded text-scp-text dark:text-scp-text-dark placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-scp-accent dark:focus:ring-scp-accent-dark focus:border-transparent transition-colors duration-200"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-scp-accent dark:hover:text-scp-accent-dark transition-colors"
            aria-label="Clear search">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
