import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Story, StoryMatter } from "@/types/story";

const storiesDirectory = path.join(process.cwd(), "stories");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log("Fetching story with slug:", slug);
    const fullPath = path.join(storiesDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(null, { status: 404 });
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const storyData = data as StoryMatter;

    const story: Story = {
      id: slug,
      slug: slug,
      content,
      ...storyData,
    };

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error reading story:", error);
    return NextResponse.json(null, { status: 404 });
  }
}
