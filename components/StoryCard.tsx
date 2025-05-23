"use client";

import Link from "next/link";
import { Story } from "@/types/story";
import ClientDate from "./ClientDate";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
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

  return (
    <Link href={`/story/${story.slug}`} className="block">
      <div className="bg-scp-card dark:bg-scp-card-dark border border-scp-border dark:border-scp-border-dark p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-2 py-1 text-xs font-mono font-bold ${getClassColor(
              story.class
            )} bg-gray-100 dark:bg-gray-700 rounded transition-colors duration-200`}
          >
            {story.class.toUpperCase()}
          </span>
          <ClientDate
            date={story.date}
            className="text-sm text-gray-500 font-mono"
          />
        </div>

        <h2 className="text-lg font-bold text-scp-text dark:text-scp-text-dark mb-3 font-mono leading-tight transition-colors duration-200">
          {story.title}
        </h2>

        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {story.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-mono transition-colors duration-200"
              >
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
    </Link>
  );
}
