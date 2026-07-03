# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Latent Foundation" - a Next.js 15 website showcasing AI-generated SCP-style fiction stories. The project uses App Router architecture with file-based content management and features a custom SCP-themed design system.

## Development Commands

```bash
npm run dev                # Start development server on http://localhost:3000
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run generate           # Generate new AI stories (requires API keys)
npm run generate:thumbnails # Generate missing thumbnails for existing stories
npm run generate:audio     # Generate missing narration MP3s (requires DEEPINFRA_API_KEY)
```

### Story Generation

```bash
# Generate new story with specific parameters (OpenRouter is the default provider)
npm run generate -- --theme "haunted mirror" --class "Euclid" --tags "time-manipulation,memetic"

# Use Anthropic provider
npm run generate -- --theme "haunted mirror" --class "Euclid" --provider anthropic
```

### Thumbnail Generation

```bash
# Generate missing thumbnails for all stories
npm run generate:thumbnails

# Generate thumbnail for a specific story
npm run generate -- --generate-thumbnails --story scpg-031

# Regenerate even if thumbnail exists
npm run generate -- --generate-thumbnails --story 15 --force

# Use higher quality Fal model
npm run generate -- --generate-thumbnails --fal-model "fal-ai/flux-pro"
```

### Audio Narration

```bash
# Generate narration for all stories missing audio
npm run generate:audio

# One story ("39" and "scpg-039" both work); --force regenerates
npm run generate:audio -- --story 39 --force

# Inspect the spoken text without calling the API
npm run generate:audio -- --story 39 --dry-run

# Voice/speed overrides
npm run generate:audio -- --story 39 --voice-main am_michael --voice-alt bf_emma --speed 1.1 --single-voice
```

### Environment Variables

- `ANTHROPIC_API_KEY` — Required for Anthropic provider
- `OPENROUTER_API_KEY` — Required for OpenRouter provider (default)
- `FAL_KEY` — Required for Fal.ai thumbnail generation
- `DEEPINFRA_API_KEY` — Required for audio narration (Kokoro TTS)
- `OPENROUTER_SITE_URL` — Optional site URL for OpenRouter referrer header

## Architecture

### Content System

- Stories stored as Markdown files in `/stories/` directory with YAML frontmatter
- Automatic numbering: SCPG-001, SCPG-002, etc.
- Thumbnails stored in `/public/images/[story-id]/thumbnail.jpg`
- Additional images in `/public/images/[story-id]/[filename]`
- Each story requires: title, class (Safe/Euclid/Keter/Apollyon), tags, date, content

### App Router Structure

- `/app/page.tsx` - Homepage with stories grid and filtering
- `/app/story/[slug]/page.tsx` - Individual story pages
- `/app/api/stories/` - API routes for story data and individual story fetching
- `/app/layout.tsx` - Root layout with metadata and dark mode support

### Key Components

- `StoryCard` - Grid item displaying story preview with classification styling
- `StoryContent` - Markdown rendering with image gallery support
- `FilterControls` - Class filtering, search, and tag-based filtering
- `DarkModeToggle` - Theme switching with persistent storage

### Data Flow

1. Stories parsed server-side via gray-matter in API routes
2. Homepage fetches all stories via `/api/stories`
3. Individual pages fetch specific stories via `/api/stories/[slug]`
4. Client-side filtering and search without re-fetching

## SCP Classification System

Stories use SCP-style classifications with color coding:

- **Safe** (green): Easily contained, predictable
- **Euclid** (orange): Unpredictable behavior, requires careful handling
- **Keter** (red): Extremely dangerous, difficult to contain
- **Apollyon** (red): Unstoppable, uncontainable, world-ending potential

## Styling Architecture

- Tailwind CSS with custom SCP-themed configuration
- Dark/light mode using class-based switching (`dark:` prefixes)
- Monospace fonts (JetBrains Mono) for authentic technical documentation feel
- Custom color system matching SCP classifications
- Responsive grid layouts with consistent spacing

## TypeScript Interfaces

Key types defined in `/types/`:

- `Story` - Complete story object with metadata and content (class includes Safe/Euclid/Keter/Apollyon)
- `StoryMatter` - Frontmatter-only version for listings
- `FilterState` - Client-side filtering state management

## Image Handling

- Thumbnails: `/public/images/[story-id]/thumbnail.jpg`
- Additional images: `/public/images/[story-id]/[filename]`
- Next.js Image component with fallback handling
- Gallery support for multiple images per story
- `lib/imageUtils.ts` — `getStoryThumbnail()` resolves thumbnail paths from story ID and optional custom thumbnail field

## SEO & Metadata

- Dynamic metadata generation per story in layout files
- Open Graph and Twitter Card support
- Structured data for search engines
- Story-specific meta descriptions from content excerpts

## AI Integration

Two generation paths exist:

### A. CLI Script (`scripts/generate-story.mjs`)

Single-shot, headless, API-based. Suits quick generation and automation.

- Supports two LLM providers: **OpenRouter** (default) and **Anthropic**
- OpenRouter models: Kimi K2, Kimi K2 Instruct
- Anthropic models: Claude Sonnet 4.6 (default), Opus 4.6, Haiku 4.5
- Configurable prompts based on SCP class (Safe/Euclid/Keter/Apollyon)
- Automatic frontmatter and file generation, including title extracted from the body's `# SCPG-NNN: Title` heading
- Supports custom themes, tags, location, researcher, classification, `--max-tokens`, and `--min-words`

### B. Claude Code agentic pipeline (`/scpg`)

Multi-agent flow that runs against the user's Claude subscription (no API key needed). Higher quality output via a dedicated ideator → writer handoff. Files live under `.claude/`:

- `commands/scpg.md` — the `/scpg` slash command
- `skills/generate-scpg/SKILL.md` — orchestration rules (file numbering, frontmatter shape, thumbnail handoff)
- `agents/scp-ideator.md` — sharpens a rough theme into a premise spec
- `agents/scp-writer.md` — drafts the full story body from the spec

The skill computes the next SCPG number, passes it to the writer (so the H1 and in-body identifier are correct), then shells out to the CLI script (`npm run generate -- --generate-thumbnails --story scpg-NNN`) for the Fal.ai thumbnail step. Don't reimplement thumbnail logic in the skill.

### Story formatting conventions

Both paths must produce stories with:
- H1 as `# SCPG-NNN: Title` — a real markdown heading, no quotes around title, no `SCP-XXXX` placeholder or made-up SCP numbers
- `**Item #:** SCPG-NNN`, `**Object Class:** ...` etc. as bold key-value lines after the H1
- `## Section` headings for major sections (Containment Procedures, Description, each Addendum)
- **No** standalone `---` horizontal rules between sections — they render as visible borders on the site
- In-body identifier always `SCPG-NNN`, consistent with the filename and frontmatter

### Thumbnail Generation
- Uses Fal.ai queue API with Flux image models (`fal-ai/flux/dev` default, `fal-ai/flux-pro` for higher quality)
- Polls using `response_url` and `status_url` returned by the Fal submit endpoint (not constructed manually)
- Image prompts are built from story content, not just the title:
  - Extracts the Description and Addendum sections (skips Containment Procedures)
  - Filters sentences containing visual/physical keywords (e.g., appearance, materials, spatial features)
  - Combines story title + up to 3 visual sentences + class-specific atmosphere
  - Cleans SCP identifiers, redaction markers, and formatting artifacts
- Thumbnails saved to `public/images/[story-id]/thumbnail.jpg`
- `--generate-thumbnails` mode backfills missing thumbnails for existing stories
- Supports `--story` to target a specific story and `--force` to regenerate existing thumbnails

### Audio Narration (TTS)

- `scripts/generate-audio.mjs` narrates stories with Kokoro TTS on DeepInfra (`hexgrad/Kokoro-82M`, ~2¢ per story)
- Pipeline: markdown → spoken-text preprocessing → voice segmentation → per-chunk TTS → MP3 at `public/audio/[story-id].mp3`
- Preprocessing converts SCP conventions to speakable text: `SCPG-039` → "SCPG 39", `█████`/`[REDACTED]` → "redacted", `██/██/2024` → "a redacted date in 2024", drops "(4)"-style digit clarifications, expands `±`/`°C`/`%`/`×` symbols, strips Cyrillic runs (Kokoro voices are English-only)
- Two-voice narration: main voice (`am_michael`) for clinical document text and section headings; alt voice (`bf_emma`) for researcher logs/interviews (headings matching log/interview/transcript/notes), italic-only paragraphs, and blockquotes. `--single-voice` disables this
- ffmpeg is optional: if present the concatenated MP3 is re-encoded (64 kbps mono, clean duration metadata); if absent, chunks are byte-concatenated, which plays fine but may seek unreliably
- Story pages render an `<audio>` block automatically when `public/audio/[story-id].mp3` exists (`getStoryAudioPath()` in `lib/stories.ts`, same pattern as thumbnails)
