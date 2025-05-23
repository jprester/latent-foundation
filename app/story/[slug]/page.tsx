"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { Story } from "@/types/story";

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
        return "text-scp-safe bg-green-50 border-scp-safe";
      case "Euclid":
        return "text-scp-euclid bg-orange-50 border-scp-euclid";
      case "Keter":
        return "text-scp-keter bg-red-50 border-scp-keter";
      default:
        return "text-gray-600 bg-gray-50 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-scp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono text-scp-text mb-4">
            LOADING...
          </div>
          <div className="text-gray-600 font-mono">ACCESSING SECURE FILE</div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-scp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono text-scp-accent mb-4">
            FILE NOT FOUND
          </div>
          <div className="text-gray-600 font-mono mb-8">
            DOCUMENT MAY BE CLASSIFIED OR REDACTED
          </div>
          <Link
            href="/"
            className="inline-block bg-scp-accent text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 transition-colors"
          >
            RETURN TO COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scp-bg">
      <header className="bg-white shadow-sm border-b-2 border-scp-accent">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-scp-accent hover:text-red-800 font-mono text-sm font-semibold"
          >
            ← BACK TO COLLECTION
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white shadow-lg rounded-none border border-gray-300">
          {/* Story Header */}
          <header className="border-b border-gray-300 p-6 bg-gray-50">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`px-3 py-2 rounded border-2 ${getClassColor(
                  story.class
                )}`}
              >
                <span className="font-mono font-bold text-sm">
                  OBJECT CLASS: {story.class.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-500 font-mono">
                {new Date(story.date).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-scp-text font-mono mb-4">
              {story.title}
            </h1>

            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-white text-gray-700 rounded border border-gray-300 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Story Content */}
          <div className="p-6 md:p-8">
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold font-mono text-scp-text mb-6 pb-2 border-b-2 border-scp-accent">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold font-mono text-scp-text mb-4 mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold font-mono text-scp-text mb-3 mt-6">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-gray-800 leading-relaxed font-sans">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-scp-text font-mono">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">{children}</em>
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
                    <li className="text-gray-800 leading-relaxed">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-scp-accent pl-4 py-2 my-4 bg-gray-50 italic text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-scp-accent">
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
            className="inline-block bg-scp-accent text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 transition-colors"
          >
            RETURN TO COLLECTION
          </Link>
        </div>
      </main>
    </div>
  );
}
