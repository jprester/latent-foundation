import fs from "fs";
import path from "path";
import {
  getAllStories,
  getStoryAudioPath,
  getStoryThumbnailPath,
  getStoryExcerpt,
} from "./stories";
import { Story } from "@/types/story";

// Public origin used for absolute URLs in the feed. Podcast apps require
// absolute enclosure/image URLs, so this must resolve to the deployed site.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://latent-foundation.vercel.app"
).replace(/\/$/, "");

// Apple requires an owner email; keep the real address out of a public feed by
// letting it be overridden and defaulting to a non-personal mailbox.
const OWNER_NAME = process.env.PODCAST_OWNER_NAME || "Latent Foundation";
const OWNER_EMAIL =
  process.env.PODCAST_OWNER_EMAIL || "podcast@latent-foundation.vercel.app";

// Narration MP3s are encoded CBR 64 kbps mono (see scripts/generate-audio.mjs),
// so duration in seconds is exactly file bytes / 8000. This avoids probing each
// file with ffprobe, which isn't available in the serverless runtime.
const AUDIO_BYTES_PER_SECOND = 8000;

function extractScpNumber(id: string): number {
  const match = id.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  // Guard against an accidental "]]>" terminating the CDATA section early.
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

// Stories use a "## Description" section heading, which getStoryExcerpt's
// "**Description:**" inline pattern misses — so it would otherwise fall back to
// the whole document and lead each episode with flattened header key-values.
// Pull the Description section prose directly, with getStoryExcerpt as fallback.
function getEpisodeDescription(story: Story, maxLength = 400): string {
  const sectionMatch = story.content.match(
    /##\s+Description\s*\n([\s\S]*?)(?=\n##\s|$)/i
  );

  if (!sectionMatch) {
    return `${getStoryExcerpt(story.content, maxLength)}\n\nObject Class: ${story.class}`;
  }

  const cleaned = sectionMatch[1]
    .replace(/^#+ .+$/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/█+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let excerpt = cleaned;
  if (cleaned.length > maxLength) {
    const truncated = cleaned.slice(0, maxLength);
    const lastPeriod = truncated.lastIndexOf(".");
    excerpt =
      lastPeriod > maxLength * 0.5
        ? truncated.slice(0, lastPeriod + 1)
        : truncated.replace(/\s\S*$/, "") + "…";
  }

  return `${excerpt}\n\nObject Class: ${story.class}`;
}

function formatItunesDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

interface Episode {
  story: Story;
  scpNumber: number;
  audioUrl: string;
  fileSize: number;
  durationSeconds: number;
  pubDate: Date;
  imageUrl: string | null;
}

function collectEpisodes(): Episode[] {
  const episodes: Episode[] = [];

  for (const story of getAllStories()) {
    const audioPath = getStoryAudioPath(story.id);
    if (!audioPath) continue;

    const filePath = path.join(
      process.cwd(),
      "public",
      "audio",
      `${story.id}.mp3`
    );
    const fileSize = fs.statSync(filePath).size;
    const scpNumber = extractScpNumber(story.id);

    // Stories share a date field with no time component, which leaves episodes
    // released on the same day with identical pubDates — an order podcast apps
    // then resolve arbitrarily. Offset each by its SCPG number in seconds so a
    // higher number always sorts later within the same day, keeping the queue
    // in a stable, intuitive order.
    const pubDate = new Date(story.date);
    pubDate.setUTCSeconds(pubDate.getUTCSeconds() + scpNumber);

    const thumbnailPath = getStoryThumbnailPath(story);

    episodes.push({
      story,
      scpNumber,
      audioUrl: `${SITE_URL}${audioPath}`,
      fileSize,
      durationSeconds: Math.round(fileSize / AUDIO_BYTES_PER_SECOND),
      pubDate,
      imageUrl: thumbnailPath ? `${SITE_URL}${thumbnailPath}` : null,
    });
  }

  // Newest first, the conventional podcast feed order.
  return episodes.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

function renderItem(episode: Episode): string {
  const { story } = episode;
  const link = `${SITE_URL}/story/${story.slug}`;
  const description = getEpisodeDescription(story);
  const imageTag = episode.imageUrl
    ? `      <itunes:image href="${escapeXml(episode.imageUrl)}" />\n`
    : "";

  return `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">latent-foundation-${escapeXml(story.id)}</guid>
      <pubDate>${episode.pubDate.toUTCString()}</pubDate>
      <description>${cdata(description)}</description>
      <itunes:summary>${cdata(description)}</itunes:summary>
      <itunes:subtitle>${escapeXml(`Object Class: ${story.class}`)}</itunes:subtitle>
      <itunes:episode>${episode.scpNumber}</itunes:episode>
      <itunes:duration>${formatItunesDuration(episode.durationSeconds)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
${imageTag}      <enclosure url="${escapeXml(episode.audioUrl)}" length="${episode.fileSize}" type="audio/mpeg" />
    </item>`;
}

export function buildPodcastFeed(): string {
  const episodes = collectEpisodes();
  const feedUrl = `${SITE_URL}/podcast.xml`;
  const coverUrl = `${SITE_URL}/images/podcast-cover.jpg`;
  const title = "Latent Foundation";
  const description =
    "AI-generated SCP-style weird fiction, narrated. Epistemic horror, anomalous archives, and institutional dread — Secure, Contain, Protect, Generate.";
  const lastBuildDate = (
    episodes[0]?.pubDate ?? new Date()
  ).toUTCString();

  const items = episodes.map(renderItem).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <copyright>Latent Foundation</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Latent Foundation feed builder</generator>
    <itunes:author>${escapeXml(OWNER_NAME)}</itunes:author>
    <itunes:summary>${escapeXml(description)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${escapeXml(coverUrl)}" />
    <itunes:category text="Fiction">
      <itunes:category text="Science Fiction" />
    </itunes:category>
    <itunes:owner>
      <itunes:name>${escapeXml(OWNER_NAME)}</itunes:name>
      <itunes:email>${escapeXml(OWNER_EMAIL)}</itunes:email>
    </itunes:owner>
    <image>
      <url>${escapeXml(coverUrl)}</url>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(SITE_URL)}</link>
    </image>
${items}
  </channel>
</rss>`;
}
