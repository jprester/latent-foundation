---
name: generate-scpg
description: Generate a new SCPG-format story for the Latent Foundation site — orchestrates an ideator and writer subagent, writes the markdown file with correct frontmatter, and triggers thumbnail generation. Use when the /scpg command runs or when the user asks for a new SCPG story.
---

# generate-scpg

End-to-end pipeline for producing a new SCPG story file at `stories/scpg-NNN.md`, plus its thumbnail at `public/images/scpg-NNN/thumbnail.jpg`.

## Pipeline

1. **Determine next number** — scan `stories/` for the highest existing `scpg-NNN.md` and pick the next one. You need this number *before* calling the writer.

2. **Ideator** — invoke the `scp-ideator` subagent. Pass the raw user input (may be empty, a vague theme, or theme + class). It returns a *premise spec*: title, class, refined theme, 1–2 setting details, tag suggestions, and a short rationale for why this premise will work as an SCP entry.

3. **Writer** — invoke the `scp-writer` subagent with the premise spec **and the SCPG number** (e.g. "Write SCPG-038 from this premise: ..."). The writer needs the number to put it in the H1 heading and every in-body reference. It returns the full story body in markdown (no frontmatter, no surrounding commentary).

4. **Save** — write the file to `stories/scpg-NNN.md` with correct frontmatter (see below).

5. **Thumbnail** — shell out to the existing script:
   ```bash
   npm run generate -- --generate-thumbnails --story scpg-NNN
   ```
   This handles Fal.ai API call, prompt construction, and file placement. Don't reimplement it. If it fails, save the story anyway and report the failure.

## File numbering

Find the next number by scanning `stories/`:
```bash
ls stories/ | grep -E '^scpg-[0-9]+\.md$' | sort | tail -1
```
Increment by 1. Pad to 3 digits (e.g., `scpg-038.md`).

## Frontmatter shape

```yaml
---
title: "SCPG-NNN: The Story Title"
class: "Euclid"           # Safe | Euclid | Keter | Apollyon
tags: ["tag1", "tag2", "tag3"]
date: "YYYY-MM-DD"        # today
thumbnail: "thumbnail.jpg"
---
```

Notes:
- `title` is `"SCPG-NNN: <title>"` where `<title>` comes from the body's `# SCP-XXXX: "..."` heading (strip the quotes). The story cards display this string directly, so it must be present — homepage cards show only `SCPG-NNN` when it's missing.
- `tags` should be 4–6 items, lowercase, hyphenated. The writer suggests them; trim to the strongest.
- Include `thumbnail: "thumbnail.jpg"` unconditionally — even if the thumbnail step later fails, the path will resolve once it's generated.

## Story body conventions

The writer should follow what already works in `stories/` — read 1–2 recent files for calibration if needed. Key conventions:
- Opens with `# SCP-XXXX: "Title in Quotes"` (literal `XXXX`, not the real number — the site renders the ID separately)
- Sections: **Special Containment Procedures**, **Description**, then 2–6 numbered **Addendum** entries
- Addenda are the heart of the format — include at least one researcher log written in first person, and at least one incident report
- Use `[REDACTED]`, `████`, and dates with `██/██/YYYY` for authentic Foundation feel
- Target 3000–5000 words for a strong entry

## Defaults

- Word target: ~4000 words (tell the writer this; it tends to undershoot)
- Model: works best with Opus. If the user is on Sonnet/Haiku, still produce, but quality will vary.

## Don't

- Don't write the story yourself in the orchestrator — delegate to the writer subagent. The orchestrator handles structure (files, frontmatter, thumbnail), the subagents handle creative work.
- Don't add the editor step. The user trusts the writer's first draft and reads the final result directly.
- Don't ask the user to confirm before writing — they invoked `/scpg` because they want a story produced.
