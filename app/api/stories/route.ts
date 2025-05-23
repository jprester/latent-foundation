import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Story, StoryMatter } from "@/types/story";

const storiesDirectory = path.join(process.cwd(), "stories");

function extractScpNumber(id: string): number | null {
  const match = id.match(/scp-(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

export async function GET() {
  try {
    // Ensure stories directory exists
    if (!fs.existsSync(storiesDirectory)) {
      return NextResponse.json([]);
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

    const sortedStories = stories.sort((a, b) => {
      // Sort by SCP number if they follow SCP-XXXX format
      const aNum = extractScpNumber(a.id);
      const bNum = extractScpNumber(b.id);

      if (aNum !== null && bNum !== null) {
        return aNum - bNum;
      }

      // Fallback to date sorting
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json(sortedStories);
  } catch (error) {
    console.error("Error reading stories:", error);
    return NextResponse.json([]);
  }
}
