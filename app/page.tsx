"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { Story } from "@/types/story";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import PageHeader from "@/components/PageHeader";
import StoryCard from "@/components/StoryCard";
import ClassFilter from "@/components/ClassFilter";

// Prevent SSR for the entire component to avoid hydration mismatches
const StoriesGrid = dynamic(() => Promise.resolve(StoriesGridComponent), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

function StoriesGridComponent() {
  const [stories, setStories] = useState<Story[]>([]);
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
      console.log("Loaded stories:", allStories);
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

  const filteredStories =
    filter === "All"
      ? stories
      : stories.filter((story) => story.class === filter);

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
    <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark transition-colors duration-200">
      <PageHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ClassFilter activeFilter={filter} onFilterChange={setFilter} />

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <EmptyState hasStories={stories.length > 0} activeFilter={filter} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EmptyState({
  hasStories,
  activeFilter,
}: {
  hasStories: boolean;
  activeFilter: string;
}) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 font-mono mb-4 transition-colors duration-200">
        {hasStories
          ? `NO STORIES MATCH CLASS ${activeFilter.toUpperCase()} FILTER`
          : "NO STORIES FOUND • ADD SOME MARKDOWN FILES TO /stories DIRECTORY"}
      </p>
      {!hasStories && (
        <div className="text-sm text-gray-400 dark:text-gray-500 font-mono transition-colors duration-200">
          <p>CREATE FILES LIKE:</p>
          <p>stories/scp-001.md</p>
          <p>stories/scp-002.md</p>
        </div>
      )}
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
