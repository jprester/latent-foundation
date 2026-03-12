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

export function getAllStorySlugs(): string[] {
  if (!fs.existsSync(storiesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(storiesDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}
