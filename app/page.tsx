"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

import { Story } from "@/types/story";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import PageHeader from "@/components/PageHeader";
import FilterControls from "@/components/FilterControls";
import StoryCard from "@/components/StoryCard";
import StructuredData from "@/components/StructuredData";

// Prevent SSR for the entire component to avoid hydration mismatches
const StoriesGrid = dynamic(() => Promise.resolve(StoriesGridComponent), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

function StoriesGridComponent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"All" | "Safe" | "Euclid" | "Keter">(
    "All"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching stories from /api/stories");

      const response = await fetch("/api/stories");
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allStories = await response.json();

      setStories(allStories || []);
    } catch (error) {
      console.error("Failed to load stories:", error);
      setError(`Failed to load stories: ${error}`);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Enhanced filtering with search
  const filteredStories = useMemo(() => {
    let filtered = stories;

    // Apply class filter
    if (filter !== "All") {
      filtered = filtered.filter((story) => story.class === filter);
    }

    // Apply search filter
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen
        title="CONNECTION ERROR"
        message={error}
        showRetryButton={true}
        onRetry={loadStories}
      />
    );
  }

  return (
    <>
      <StructuredData stories={stories} />
      <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark transition-colors duration-200">
        <PageHeader />
        <main className="max-w-6xl mx-auto px-4 sm:py-8 py-2">
          <FilterControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilter={filter}
            onFilterChange={setFilter}
            totalStories={stories.length}
            filteredCount={filteredStories.length}
          />

          {/* Stories Grid */}
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
        </main>

        <Footer />
      </div>
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

function Footer() {
  return (
    <footer className="bg-scp-card dark:bg-scp-card-dark border-t border-scp-border dark:border-scp-border-dark mt-16 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 font-mono text-sm transition-colors duration-200">
          GENERATED WITH CLAUDE • STORIES FOR ENTERTAINMENT PURPOSES ONLY •
          INSPIRED BY THE{" "}
          <a className="underline" href="https://scp-wiki.wikidot.com/">
            SCP FOUNDATION
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return <StoriesGrid />;
}
