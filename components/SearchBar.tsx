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
    <div className="relative group">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-scp-muted dark:text-scp-muted-dark transition-colors group-focus-within:text-scp-accent dark:group-focus-within:text-scp-accent-dark" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-scp-card dark:bg-scp-card-dark border border-scp-border dark:border-scp-border-dark rounded-lg text-scp-text dark:text-scp-text-dark placeholder-scp-muted dark:placeholder-scp-muted-dark font-mono text-sm focus:outline-none focus:ring-2 focus:ring-scp-accent/20 dark:focus:ring-scp-accent-dark/20 focus:border-scp-accent dark:focus:border-scp-accent-dark transition-all duration-200 hover:border-scp-accent/30 dark:hover:border-scp-accent-dark/30"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 w-4 h-4 text-scp-muted dark:text-scp-muted-dark hover:text-scp-accent dark:hover:text-scp-accent-dark transition-colors opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
            aria-label="Clear search">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
