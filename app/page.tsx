"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Story } from "@/types/story";
import ClientDate from "@/components/ClientDate";
import { FilterType } from "@/types/filter";

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter] = useState<FilterType>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      try {
        console.log("Fetching stories from /api/stories");
        const response = await fetch("/api/stories");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allStories = await response.json();
        console.log("Loaded stories:", allStories);
        setStories(allStories || []);
        setError(null);
      } catch (error) {
        console.error("Failed to load stories:", error);
        setError(`Failed to load stories: ${error}`);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  const filteredStories =
    filter === "All"
      ? stories
      : stories.filter((story) => story.class === filter);

  const getClassColor = (className: string) => {
    switch (className) {
      case "Safe":
        return "text-scp-safe";
      case "Euclid":
        return "text-scp-euclid";
      case "Keter":
        return "text-scp-keter";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-scp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono text-scp-text mb-4">
            LOADING...
          </div>
          <div className="text-gray-600 font-mono">
            ACCESSING SECURE DATABASE
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-scp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono text-scp-accent mb-4">ERROR</div>
          <div className="text-gray-600 font-mono mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-scp-accent text-white px-4 py-2 font-mono"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scp-bg">
      <header className="bg-white shadow-sm border-b-2 border-scp-accent">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-scp-text font-mono">
              SCP STORIES COLLECTION
            </h1>
            <p className="text-gray-600 mt-2">SECURE • CONTAIN • PROTECT</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {(["All", "Safe", "Euclid", "Keter"] as const).map((itemClass) => (
            <button
              key={itemClass}
              onClick={() => setFilter(itemClass)}
              className={`px-4 py-2 rounded font-mono text-sm font-semibold transition-colors ${
                filter === itemClass
                  ? "bg-scp-accent text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } border border-gray-300`}
            >
              {itemClass === "All"
                ? "ALL CLASSES"
                : `${itemClass.toUpperCase()}`}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-mono mb-4">
              {stories.length === 0
                ? "NO STORIES FOUND • ADD SOME MARKDOWN FILES TO /stories DIRECTORY"
                : "NO STORIES MATCH THE SELECTED FILTER"}
            </p>
            {stories.length === 0 && (
              <div className="text-sm text-gray-400 font-mono">
                <p>CREATE FILES LIKE:</p>
                <p>stories/scp-001.md</p>
                <p>stories/scp-002.md</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="block"
              >
                <div className="bg-white border border-gray-300 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-mono font-bold ${getClassColor(
                        story.class
                      )} bg-gray-100 rounded`}
                    >
                      {story.class.toUpperCase()}
                    </span>
                    <ClientDate
                      date={story.date}
                      className="text-xs text-gray-500 font-mono"
                    />
                  </div>

                  <h2 className="text-lg font-bold text-scp-text mb-3 font-mono leading-tight">
                    {story.title}
                  </h2>

                  {story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {story.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                      {story.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded font-mono">
                          +{story.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-300 mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 font-mono text-sm">
            GENERATED WITH CLAUDE • STORIES FOR ENTERTAINMENT PURPOSES ONLY
          </p>
        </div>
      </footer>
    </div>
  );
}
