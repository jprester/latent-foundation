import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getStoryBySlug,
  getAllStorySlugs,
  getStoryExcerpt,
  getStoryThumbnailPath,
} from "@/lib/stories";
import PageHeader from "@/components/PageHeader";
import StoryContent from "@/components/StoryContent";
import StructuredData from "@/components/StructuredData";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllStorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return { title: "Story Not Found" };
  }

  const description = getStoryExcerpt(story.content);
  const thumbnailPath = getStoryThumbnailPath(story);
  const ogImage = thumbnailPath || "/images/og-default.png";

  return {
    title: story.title,
    description,
    openGraph: {
      title: story.title,
      description,
      type: "article",
      publishedTime: story.date,
      tags: story.tags,
      images: [
        {
          url: ogImage,
          width: 1024,
          height: 576,
          alt: story.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return (
    <>
      <StructuredData story={story} />
      <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark transition-colors duration-200">
        <PageHeader
          showBackButton={true}
          backButtonText="← BACK TO COLLECTION"
          backButtonHref="/"
        />

        <main className="max-w-4xl mx-auto md:px-4 md:py-8">
          <StoryContent story={story} />

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block rounded border-scp-border dark:border-scp-border-dark bg-scp-accent dark:bg-scp-accent-dark text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 dark:hover:bg-red-600 transition-colors mb-4">
              RETURN TO COLLECTION
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
