# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Latent Foundation" - a Next.js 15 website showcasing AI-generated SCP-style fiction stories. The project uses App Router architecture with file-based content management and features a custom SCP-themed design system.

## Development Commands

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run generate     # Generate new AI stories (requires ANTHROPIC_API_KEY)
```

### Story Generation
```bash
# Generate new story with specific parameters
npm run generate -- --theme "haunted mirror" --class "Euclid" --tags "time-manipulation,memetic"
```

## Architecture

### Content System
- Stories stored as Markdown files in `/stories/` directory with YAML frontmatter
- Automatic numbering: SCPG-001, SCPG-002, etc.
- Images organized in `/public/images/[story-id]/` structure
- Each story requires: title, class (Safe/Euclid/Keter), tags, date, content

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

## Styling Architecture

- Tailwind CSS with custom SCP-themed configuration
- Dark/light mode using class-based switching (`dark:` prefixes)
- Monospace fonts (JetBrains Mono) for authentic technical documentation feel
- Custom color system matching SCP classifications
- Responsive grid layouts with consistent spacing

## TypeScript Interfaces

Key types defined in `/types/`:
- `Story` - Complete story object with metadata and content
- `StoryMetadata` - Frontmatter-only version for listings
- `FilterState` - Client-side filtering state management

## Image Handling

- Thumbnails: `/public/images/[story-id]/thumbnail.jpg`
- Additional images: `/public/images/[story-id]/[filename]`
- Next.js Image component with fallback handling
- Gallery support for multiple images per story

## SEO & Metadata

- Dynamic metadata generation per story in layout files
- Open Graph and Twitter Card support
- Structured data for search engines
- Story-specific meta descriptions from content excerpts

## AI Integration

The `/scripts/generate-story.js` script integrates with Claude API for content generation:
- Requires `ANTHROPIC_API_KEY` environment variable
- Configurable prompts based on SCP class
- Automatic frontmatter and file generation
- Supports custom themes, tags, and classification parameters