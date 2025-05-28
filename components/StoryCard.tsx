"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { Story } from "@/types/story";
import { getStoryThumbnail } from "@/lib/imageUtils";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const [imageError, setImageError] = useState(false);

  const getClassColor = (className: string) => {
    switch (className) {
      case "Safe":
        return "text-scp-safe dark:text-scp-safe-dark";
      case "Euclid":
        return "text-scp-euclid dark:text-scp-euclid-dark";
      case "Keter":
        return "text-scp-keter dark:text-scp-keter-dark";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const thumbnailPath = getStoryThumbnail(story.id, story.thumbnail);

  return (
    <Link href={`/story/${story.slug}`} className="block">
      <div className="bg-scp-card dark:bg-scp-card-dark border dark:hover:border-red-700 border-scp-border dark:border-scp-border-dark  transition-all duration-200 cursor-pointer h-full overflow-hidden">
        {/* Thumbnail Image */}
        {!imageError && (
          <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
            <Image
              src={thumbnailPath}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-200 hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

            {/* Class badge overlay */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-mono font-bold ${getClassColor(
                  story.class
                )} bg-black/60 backdrop-blur-sm rounded transition-colors duration-200`}>
                {story.class.toUpperCase()}
              </span>
            </div>

            {/* Date overlay */}
            <div className="absolute top-3 right-3">
              <span className="text-xs text-white/90 font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                {story.date || "No date"}
              </span>
            </div>
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          {/* Show class badge if no image */}
          {imageError && (
            <div className="flex items-start justify-between mb-3">
              <span
                className={`px-2 py-1 text-xs font-mono font-bold ${getClassColor(
                  story.class
                )} bg-gray-100 dark:bg-gray-700 rounded transition-colors duration-200`}>
                {story.class.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono transition-colors duration-200">
                {story.date || "No date"}
              </span>
            </div>
          )}

          <h2 className="text-lg font-bold text-scp-text dark:text-scp-text-dark mb-3 font-mono leading-tight transition-colors duration-200">
            {story.title}
          </h2>

          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {story.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-mono transition-colors duration-200">
                  {tag}
                </span>
              ))}
              {story.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-mono transition-colors duration-200">
                  +{story.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
