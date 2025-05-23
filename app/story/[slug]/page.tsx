"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";

import { Story } from "@/types/story";
import ClientDate from "@/components/ClientDate";
import DarkModeToggle from "@/components/DarkModeToggle";

interface StoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function StoryPage({ params }: StoryPageProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const loadStory = async () => {
      try {
        const response = await fetch(`/api/stories/${slug}`);
        if (response.ok) {
          const storyData = await response.json();
          setStory(storyData);
        } else {
          setStory(null);
        }
      } catch (error) {
        console.error("Failed to load story:", error);
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [slug]);

  const getClassColor = (className: string) => {
    switch (className) {
      case "Safe":
        return "text-scp-safe dark:text-scp-safe-dark bg-green-50 dark:bg-green-900/20 border-scp-safe dark:border-scp-safe-dark";
      case "Euclid":
        return "text-scp-euclid dark:text-scp-euclid-dark bg-orange-50 dark:bg-orange-900/20 border-scp-euclid dark:border-scp-euclid-dark";
      case "Keter":
        return "text-scp-keter dark:text-scp-keter-dark bg-red-50 dark:bg-red-900/20 border-scp-keter dark:border-scp-keter-dark";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="text-2xl font-mono text-scp-text dark:text-scp-text-dark mb-4 transition-colors duration-200">
            LOADING...
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-mono transition-colors duration-200">
            ACCESSING SECURE FILE
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="text-2xl font-mono text-scp-accent dark:text-scp-accent-dark mb-4 transition-colors duration-200">
            FILE NOT FOUND
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-mono mb-8 transition-colors duration-200">
            DOCUMENT MAY BE CLASSIFIED OR REDACTED
          </div>
          <Link
            href="/"
            className="inline-block bg-scp-accent dark:bg-scp-accent-dark text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 dark:hover:bg-red-600 transition-colors"
          >
            RETURN TO COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark transition-colors duration-200">
      <header className="bg-scp-card dark:bg-scp-card-dark shadow-sm border-b-2 border-scp-accent dark:border-scp-accent-dark transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-scp-accent dark:text-scp-accent-dark hover:text-red-800 dark:hover:text-red-400 font-mono text-sm font-semibold transition-colors"
            >
              ← BACK TO COLLECTION
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-scp-card dark:bg-scp-card-dark shadow-lg rounded-none border border-scp-border dark:border-scp-border-dark transition-colors duration-200">
          {/* Story Header */}
          <header className="border-b border-scp-border dark:border-scp-border-dark p-6 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`px-3 py-2 rounded border-2 transition-colors duration-200 ${getClassColor(
                  story.class
                )}`}
              >
                <span className="font-mono font-bold text-sm">
                  OBJECT CLASS: {story.class.toUpperCase()}
                </span>
              </div>
              <ClientDate
                date={story.date}
                className="text-sm text-gray-500 font-mono"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-scp-text dark:text-scp-text-dark font-mono mb-4 transition-colors duration-200">
              {story.title}
            </h1>

            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-scp-card dark:bg-scp-card-dark text-gray-700 dark:text-gray-300 rounded border border-scp-border dark:border-scp-border-dark font-mono transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Story Content */}
          <div className="p-6 md:p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold font-mono text-scp-text dark:text-scp-text-dark mb-6 pb-2 border-b-2 border-scp-accent dark:border-scp-accent-dark transition-colors duration-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold font-mono text-scp-text dark:text-scp-text-dark mb-4 mt-8 transition-colors duration-200">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold font-mono text-scp-text dark:text-scp-text-dark mb-3 mt-6 transition-colors duration-200">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed font-sans transition-colors duration-200">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-scp-text dark:text-scp-text-dark font-mono transition-colors duration-200">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      {children}
                    </em>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 pl-6 space-y-2 list-disc">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 pl-6 space-y-2 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-800 dark:text-gray-200 leading-relaxed transition-colors duration-200">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-scp-accent dark:border-scp-accent-dark pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-800 italic text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-scp-accent dark:text-scp-accent-dark transition-colors duration-200">
                      {children}
                    </code>
                  ),
                }}
              >
                {story.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-scp-accent dark:bg-scp-accent-dark text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 dark:hover:bg-red-600 transition-colors"
          >
            RETURN TO COLLECTION
          </Link>
        </div>
      </main>
    </div>
  );
}
