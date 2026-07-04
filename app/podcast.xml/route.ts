import { buildPodcastFeed } from "@/lib/podcast";

// Stories and their audio are committed files, so the feed only changes on
// redeploy — generate it statically at build time, when public/audio is present.
export const dynamic = "force-static";

export async function GET() {
  const feed = buildPodcastFeed();

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
