import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Story, StoryMatter } from "@/types/story";

const storiesDirectory = path.join(process.cwd(), "stories");

function extractScpNumber(id: string): number | null {
  const match = id.match(/scp-(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

export function getAllStories(): Story[] {
  if (!fs.existsSync(storiesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(storiesDirectory);
  const stories = fileNames
    .filter((name) => name.endsWith(".md"))
    .map((name): Story => {
      const id = name.replace(/\.md$/, "");
      const fullPath = path.join(storiesDirectory, name);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const storyData = data as StoryMatter;

      return {
        id,
        slug: id,
        content,
        ...storyData,
      };
    });

  return stories.sort((a, b) => {
    const aNum = extractScpNumber(a.id);
    const bNum = extractScpNumber(b.id);

    if (aNum !== null && bNum !== null) {
      return aNum - bNum;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getStoryBySlug(slug: string): Story | null {
  const fullPath = path.join(storiesDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const storyData = data as StoryMatter;

  return {
    id: slug,
    slug,
    content,
    ...storyData,
  };
}

export function getStoryExcerpt(content: string, maxLength = 160): string {
  // Try to extract from the Description section first
  const descMatch = content.match(
    /\*\*Description[:\s]*\*\*\s*([\s\S]*?)(?=\n\*\*(?:Addendum|Recovery|Incident|Discovery|Note)|---|\n##|$)/i
  );

  const source = descMatch ? descMatch[1] : content;

  const cleaned = source
    .replace(/^#+ .+$/gm, "")           // remove headers
    .replace(/\*\*[^*]*\*\*/g, "")       // remove bold markers
    .replace(/\[REDACTED\]/gi, "[REDACTED]")
    .replace(/█+/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;

  // Cut at sentence boundary
  const truncated = cleaned.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  if (lastPeriod > maxLength * 0.5) {
    return truncated.slice(0, lastPeriod + 1);
  }

  return truncated.replace(/\s\S*$/, "") + "...";
}

export function getStoryThumbnailPath(story: Story): string | null {
  const thumbnailName = story.thumbnail || "thumbnail.jpg";
  const filePath = path.join(
    process.cwd(),
    "public",
    "images",
    story.id,
    thumbnailName
  );

  if (fs.existsSync(filePath)) {
    return `/images/${story.id}/${thumbnailName}`;
  }

  return null;
}

export function getAllStorySlugs(): string[] {
  if (!fs.existsSync(storiesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(storiesDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}
