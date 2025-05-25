"use client";

import { Story } from "@/types/story";

interface StructuredDataProps {
  story?: Story;
  stories?: Story[];
}

export default function StructuredData({
  story,
  stories,
}: StructuredDataProps) {
  if (story) {
    // Individual story structured data
    const storyStructuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: story.title,
      description: `A ${story.class} class SCP story featuring ${story.tags
        ?.slice(0, 3)
        .join(", ")}`,
      author: {
        "@type": "Organization",
        name: "The Latent Foundation",
      },
      publisher: {
        "@type": "Organization",
        name: "The Latent Foundation",
        logo: {
          "@type": "ImageObject",
          url: "/favicon-32x32.png",
        },
      },
      datePublished: story.date,
      dateModified: story.date,
      genre: ["Science Fiction", "Horror", "Creative Writing"],
      keywords: story.tags?.join(", "),
      articleSection: `SCP Class ${story.class}`,
      inLanguage: "en-US",
      isAccessibleForFree: true,
      audience: {
        "@type": "Audience",
        audienceType: "Science Fiction Fans",
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storyStructuredData),
        }}
      />
    );
  }

  if (stories) {
    // Homepage structured data
    const websiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The Latent Foundation",
      description:
        "AI-generated SCP stories from the latent space. Explore anomalous objects and entities created by artificial intelligence.",
      url: "https://latent-foundation.vercel.app", // Replace with your actual domain
      genre: [
        "Science Fiction",
        "Horror",
        "Creative Writing",
        "AI Generated Content",
      ],
      inLanguage: "en-US",
      isAccessibleForFree: true,
      audience: {
        "@type": "Audience",
        audienceType: [
          "Science Fiction Fans",
          "AI Enthusiasts",
          "Creative Writing Enthusiasts",
        ],
      },
      creator: {
        "@type": "Organization",
        name: "The Latent Foundation",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://latent-foundation.vercel.app/?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    };

    const organizationStructuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The Latent Foundation",
      description:
        "Creating AI-generated SCP Foundation stories using advanced language models",
      url: "https://latent-foundation.vercel.app", // Replace with your actual domain
      foundingDate: "2025",
      knowsAbout: [
        "Artificial Intelligence",
        "Creative Writing",
        "SCP Foundation",
        "Science Fiction",
      ],
      sameAs: [
        // Add your social media profiles here when you create them
        // "https://twitter.com/latentfoundation",
        // "https://github.com/yourusername/latent-foundation"
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </>
    );
  }

  return null;
}
