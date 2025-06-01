import { Metadata } from "next";
import { Story } from "@/types/story";

export function generateStoryMetadata(story: Story): Metadata {
  const title = `${story.title}`;
  const description = `${story.title} - An SCP-inspired story from the Latent Foundation archive.`;

  // Use the story's thumbnail image if available, otherwise use a default
  const imageUrl = story.thumbnail
    ? `/images/${story.slug}/${story.thumbnail}`
    : "/images/og-default.png";

  return {
    title,
    description,
    keywords: [
      "SCP",
      story.class.toLowerCase(),
      "horror fiction",
      "AI generated story",
      "anomalous object",
      story.slug,
    ],
    openGraph: {
      type: "article",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: story.date,
      authors: ["Latent Foundation"],
      section: "SCP Stories",
      tags: [story.class, "SCP", "Horror", "Science Fiction"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function generateHomeMetadata(): Metadata {
  return {
    title: "Latent Foundation - SCP Stories",
    description:
      "Explore a collection of SCP-inspired short stories written with AI. Discover anomalous objects, entities, and phenomena in our digital archive.",
    openGraph: {
      type: "website",
      title: "Latent Foundation - SCP Stories",
      description:
        "Explore a collection of SCP-inspired short stories written with AI.",
      images: [
        {
          url: "/images/og-default.png",
          width: 1200,
          height: 630,
          alt: "Latent Foundation - SCP Stories Collection",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Latent Foundation - SCP Stories",
      description:
        "Explore a collection of SCP-inspired short stories written with AI.",
      images: ["/images/og-default.jpg"],
    },
  };
}
