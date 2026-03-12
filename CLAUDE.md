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

### Environment Variables

- `ANTHROPIC_API_KEY` — Required for Anthropic provider
- `OPENROUTER_API_KEY` — Required for OpenRouter provider (default)
- `FAL_KEY` — Required for Fal.ai thumbnail generation
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

The `/scripts/generate-story.mjs` script handles both story and thumbnail generation:

### Story Generation
- Supports two LLM providers: **OpenRouter** (default) and **Anthropic**
- OpenRouter models: Kimi K2, Kimi K2 Instruct
- Anthropic models: Claude Sonnet 4.6 (default), Opus 4.6, Haiku 4.5
- Configurable prompts based on SCP class (Safe/Euclid/Keter/Apollyon)
- Automatic frontmatter and file generation
- Supports custom themes, tags, location, researcher, and classification parameters

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
