"use client";

import { useState, useMemo } from "react";

import { Story } from "@/types/story";
import { FilterType } from "@/types/filter";
import FilterControls from "@/components/FilterControls";
import StoryCard from "@/components/StoryCard";

interface StoriesGridProps {
  stories: Story[];
}

export default function StoriesGrid({ stories }: StoriesGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const filteredStories = useMemo(() => {
    let filtered = stories;

    if (filter !== "All") {
      filtered = filtered.filter((story) => story.class === filter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((story) => {
        const titleMatch = story.title.toLowerCase().includes(searchLower);
        const tagsMatch =
          story.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          false;
        const classMatch = story.class.toLowerCase().includes(searchLower);
        const idMatch = story.id.toLowerCase().includes(searchLower);

        return titleMatch || tagsMatch || classMatch || idMatch;
      });
    }

    return filtered;
  }, [stories, filter, searchTerm]);

  return (
    <>
      <FilterControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={filter}
        onFilterChange={setFilter}
        totalStories={stories.length}
        filteredCount={filteredStories.length}
      />

      {filteredStories.length === 0 ? (
        <EmptyState
          hasStories={stories.length > 0}
          searchTerm={searchTerm}
          activeFilter={filter}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState({
  hasStories,
  searchTerm,
  activeFilter,
}: {
  hasStories: boolean;
  searchTerm: string;
  activeFilter: string;
}) {
  if (!hasStories) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 font-mono mb-4 transition-colors duration-200">
          NO STORIES FOUND • ADD SOME MARKDOWN FILES TO /stories DIRECTORY
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-500 font-mono transition-colors duration-200">
          <p>CREATE FILES LIKE:</p>
          <p>stories/scp-001.md</p>
          <p>stories/scp-002.md</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 font-mono mb-4 transition-colors duration-200">
        NO STORIES MATCH YOUR CURRENT FILTERS
      </p>
      <div className="text-sm text-gray-400 dark:text-gray-500 font-mono transition-colors duration-200">
        {searchTerm && (
          <p>Search term: &quot;{searchTerm.toUpperCase()}&quot;</p>
        )}
        {activeFilter !== "All" && (
          <p>Class filter: {activeFilter.toUpperCase()}</p>
        )}
        <p className="mt-2">TRY DIFFERENT SEARCH TERMS OR CLEAR FILTERS</p>
      </div>
    </div>
  );
}
