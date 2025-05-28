"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

import { Story } from "@/types/story";
import { getStoryThumbnail, getStoryImages } from "@/lib/imageUtils";
import ImageGallery from "./ImageGallery";

interface StoryContentProps {
  story: Story;
}

export default function StoryContent({ story }: StoryContentProps) {
  const [thumbnailError, setThumbnailError] = useState(false);

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

  const thumbnailPath = getStoryThumbnail(story.id, story.thumbnail);
  const storyImages = getStoryImages(story.id, story.images);

  return (
    <article className="bg-scp-card dark:bg-scp-card-dark shadow-lg rounded-none border border-scp-border dark:border-scp-border-dark transition-colors duration-200">
      {/* Story Header */}
      <header className="border-b border-scp-border dark:border-scp-border-dark p-6 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`px-3 py-2 rounded border-2 transition-colors duration-200 ${getClassColor(
              story.class
            )}`}>
            <span className="font-mono font-bold text-sm">
              OBJECT CLASS: {story.class.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono transition-colors duration-200">
            {story.date || "Date not available"}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-scp-text dark:text-scp-text-dark font-mono mb-4 transition-colors duration-200">
          {story.title}
        </h1>

        {/* Thumbnail Image */}
        {!thumbnailError && (
          <div className="relative w-full h-64 md:h-80 mb-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            <Image
              src={thumbnailPath}
              alt={story.title}
              fill
              className="object-cover"
              onError={() => setThumbnailError(true)}
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          </div>
        )}

        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-scp-card dark:bg-scp-card-dark text-gray-700 dark:text-gray-300 rounded border border-scp-border dark:border-scp-border-dark font-mono transition-colors duration-200">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Story Content */}
      <div className="p-6 md:p-8">
        {/* Audio Player */}
        {/* <AudioPlayer content={story.content} title={story.title} /> Default browser voices suck. Need to find other solution */}

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
                <ul className="mb-4 pl-6 space-y-2 list-disc">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 pl-6 space-y-2 list-decimal">{children}</ol>
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
            }}>
            {story.content}
          </ReactMarkdown>

          {/* Additional Images Gallery */}
          <ImageGallery images={storyImages} storyTitle={story.title} />
        </div>
      </div>
    </article>
  );
}
