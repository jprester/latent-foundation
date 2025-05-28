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
        return "text-scp-muted dark:text-scp-muted-dark";
    }
  };

  const thumbnailPath = getStoryThumbnail(story.id, story.thumbnail);

  return (
    <Link href={`/story/${story.slug}`} className="block group">
      <div className="bg-scp-card dark:bg-scp-card-dark border border-scp-border dark:border-scp-border-dark hover:border-scp-accent/20 dark:hover:border-scp-accent-dark/30 transition-all duration-300 cursor-pointer h-full overflow-hidden rounded-lg shadow-sm hover:shadow-lg animate-fade-in">
        {/* Thumbnail Image */}
        {!imageError && (
          <div className="relative h-48 w-full bg-gradient-to-br from-scp-muted/10 to-scp-muted/20 dark:from-scp-muted-dark/10 dark:to-scp-muted-dark/20">
            <Image
              src={thumbnailPath}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

            {/* Class badge overlay */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-mono font-bold ${getClassColor(
                  story.class
                )} bg-scp-card/90 dark:bg-scp-card-dark/90 backdrop-blur-sm rounded-md border border-scp-border/50 dark:border-scp-border-dark/50`}>
                {story.class.toUpperCase()}
              </span>
            </div>

            {/* Date overlay */}
            <div className="absolute top-3 right-3">
              <span className="text-xs text-scp-text-dark/90 font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                {story.date || "No date"}
              </span>
            </div>
          </div>
        )}

        {/* Card Content */}
        <div className="p-5">
          {/* Show class badge if no image */}
          {imageError && (
            <div className="flex items-start justify-between mb-4">
              <span
                className={`px-2 py-1 text-xs font-mono font-bold ${getClassColor(
                  story.class
                )} bg-scp-border/20 dark:bg-scp-border-dark/20 rounded-md transition-colors duration-200`}>
                {story.class.toUpperCase()}
              </span>
              <span className="text-xs text-scp-muted dark:text-scp-muted-dark font-mono transition-colors duration-200">
                {story.date || "No date"}
              </span>
            </div>
          )}

          <h2 className="text-lg font-bold text-scp-text dark:text-scp-text-dark mb-3 font-mono leading-tight transition-colors duration-200 group-hover:text-scp-accent dark:group-hover:text-scp-accent-dark">
            {story.title}
          </h2>

          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {story.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-xs bg-scp-border/30 dark:bg-scp-border-dark/30 text-scp-muted dark:text-scp-muted-dark rounded-full font-mono transition-colors duration-200 hover:bg-scp-accent/10 dark:hover:bg-scp-accent-dark/10">
                  {tag}
                </span>
              ))}
              {story.tags.length > 3 && (
                <span className="px-2.5 py-1 text-xs bg-scp-border/30 dark:bg-scp-border-dark/30 text-scp-muted dark:text-scp-muted-dark rounded-full font-mono transition-colors duration-200">
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
