"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Story } from "@/types/story";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import PageHeader from "@/components/PageHeader";
import StoryContent from "@/components/StoryContent";

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

  const loadStory = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/stories/${slug}`);

      if (response.ok) {
        const storyData = await response.json();
        setStory(storyData);
        // Update page metadata dynamically
        if (storyData) {
          document.title = `${storyData.title} | The Latent Foundation`;
        }

        // Add structured data for the story
        const existingScript = document.querySelector(
          'script[type="application/ld+json"]'
        );
        if (!existingScript) {
          const script = document.createElement("script");
          script.type = "application/ld+json";
          script.innerHTML = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: storyData.title,
            description: `A ${
              storyData.class
            } class SCP story featuring ${storyData.tags
              ?.slice(0, 3)
              .join(", ")}`,
            author: {
              "@type": "Organization",
              name: "The Latent Foundation",
            },
            publisher: {
              "@type": "Organization",
              name: "The Latent Foundation",
            },
            datePublished: storyData.date,
            dateModified: storyData.date,
            genre: ["Science Fiction", "Horror", "Creative Writing"],
            keywords: storyData.tags?.join(", "),
            articleSection: `SCP Class ${storyData.class}`,
            inLanguage: "en-US",
          });
          document.head.appendChild(script);
        }
      } else {
        setStory(null);
      }
    } catch (error) {
      console.error("Failed to load story:", error);
      setStory(null);
    } finally {
      setLoading(false);
    }
  }, [slug]); // slug is a dependency of loadStory

  useEffect(() => {
    if (slug) {
      loadStory();
    }
  }, [slug, loadStory]); // Add loadStory to the dependency array

  if (loading) {
    return (
      <LoadingScreen title="LOADING..." subtitle="ACCESSING SECURE FILE" />
    );
  }

  if (!story) {
    return (
      <ErrorScreen
        title="FILE NOT FOUND"
        message="DOCUMENT MAY BE CLASSIFIED OR REDACTED"
        showRetryButton={false}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark transition-colors duration-200">
      <PageHeader
        showBackButton={true}
        backButtonText="← BACK TO COLLECTION"
        backButtonHref="/"
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <StoryContent story={story} />

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-scp-accent dark:bg-scp-accent-dark text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 dark:hover:bg-red-600 transition-colors">
            RETURN TO COLLECTION
          </Link>
        </div>
      </main>
    </div>
  );
}
