#!/usr/bin/env node

// Generates narrated MP3 audio for SCPG stories via Kokoro TTS on DeepInfra.
//
// Pipeline: markdown → spoken-text preprocessing → voice segmentation
// (clinical main voice vs. researcher/log voice) → per-chunk TTS → MP3
// assembly at public/audio/<story-id>.mp3.
//
// Usage:
//   npm run generate:audio                      # all stories missing audio
//   npm run generate:audio -- --story scpg-039  # one story (also accepts "39")
//   npm run generate:audio -- --story 39 --force
//   npm run generate:audio -- --story 39 --dry-run   # print spoken text, no API calls
//
// Flags: --voice-main <id> --voice-alt <id> --single-voice --speed <n> --force --dry-run

import "dotenv/config";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import matter from "gray-matter";

const CONFIG = {
  storiesDir: path.join(process.cwd(), "stories"),
  audioDir: path.join(process.cwd(), "public", "audio"),
  apiUrl: "https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M",
  pricePerMillionChars: 0.62,
  // Kokoro preset voices. Main = clinical document voice, alt = researcher
  // logs / interview transcripts.
  voiceMain: "am_michael",
  voiceAlt: "bf_emma",
  maxChunkChars: 1500,
  concurrency: 3,
  maxRetries: 3,
};

// Section headings whose body reads in the researcher voice.
const ALT_VOICE_HEADING = /research log|interview|transcript|personal note|field note|journal|recovered (?:log|note|audio)/i;

// ---------------------------------------------------------------------------
// Text preprocessing: markdown → speakable text
// ---------------------------------------------------------------------------

function speakableText(text) {
  return (
    text
      // Links → link text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Redacted dates before generic block replacement: ██/██/2024
      .replace(/█+\s*\/\s*█+\s*\/\s*(\d{4})/g, "a redacted date in $1")
      .replace(/█+\s*\/\s*█+\s*\/\s*█+/g, "a redacted date")
      // Generic redaction blocks
      .replace(/\s*█+\s*/g, " redacted ")
      .replace(/\[REDACTED\]/gi, "redacted")
      .replace(/\[DATA EXPUNGED\]/gi, "data expunged")
      // Identifiers: SCPG-039.2 → "SCPG 39 point 2", SCPG-039 → "SCPG 39"
      .replace(/SCPG-0*(\d+)\.(\d+)/g, "SCPG $1 point $2")
      .replace(/SCPG-0*(\d+)/g, "SCPG $1")
      .replace(/SCP-0*(\d+)/g, "SCP $1")
      // "Item #:" → "Item number:"
      .replace(/Item #/g, "Item number")
      // Clearance levels: "Level 4/039" → "Level 4, 39"
      .replace(/Level (\d+)\/0*(\d+)/g, "Level $1, $2")
      // Drop parenthesized digit clarifications: "four (4)" → "four"
      .replace(/\s\((\d+)\)/g, "")
      // Symbols TTS reads badly
      .replace(/±/g, " plus or minus ")
      .replace(/°C/g, " degrees Celsius")
      .replace(/°F/g, " degrees Fahrenheit")
      .replace(/×/g, " times ")
      .replace(/≥/g, " at least ")
      .replace(/≤/g, " at most ")
      .replace(/%/g, " percent")
      // Kokoro's English voices can't speak Cyrillic — drop those runs
      // (stories pair them with a bracketed translation)
      .replace(/[Ѐ-ӿ][Ѐ-ӿ\s.,;:!?()«»—-]*/g, " ")
      // Markdown emphasis/code markers (after voice detection, which needs them)
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function isItalicOnlyParagraph(para) {
  const t = para.trim();
  return (
    (t.startsWith("*") && t.endsWith("*") && !t.startsWith("**")) ||
    (t.startsWith("_") && t.endsWith("_"))
  );
}

// Parses the story body into an ordered list of { voice, text } segments.
// Headings always read in the main voice; researcher-log sections, italic
// paragraphs, and blockquotes read in the alt voice.
function buildSegments(content, { singleVoice }) {
  const segments = [];
  const push = (voice, text) => {
    let spoken = speakableText(text);
    if (!spoken) return;
    // Blocks like "Item number: SCPG 39" carry no terminal punctuation;
    // without it, merged segments run together as one long sentence.
    if (!/[.!?:;,"']$/.test(spoken)) spoken += ".";
    const v = singleVoice ? "main" : voice;
    const last = segments[segments.length - 1];
    if (last && last.voice === v) {
      last.text += " " + spoken;
    } else {
      segments.push({ voice: v, text: spoken });
    }
  };

  let sectionVoice = "main";
  const blocks = content.split(/\n\s*\n/);

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;
    // Horizontal rules and table separator rows
    if (/^[-\s|:]+$/.test(block)) continue;

    const headingMatch = block.match(/^(#{1,6})\s+(.*)$/m);
    if (headingMatch && block.startsWith("#")) {
      const headingText = headingMatch[2];
      sectionVoice = ALT_VOICE_HEADING.test(headingText) ? "alt" : "main";
      // Headings are announced by the main voice, followed by any body text
      // that shares the block.
      push("main", headingText + ".");
      const rest = block.slice(headingMatch[0].length).trim();
      if (rest) push(sectionVoice, rest);
      continue;
    }

    if (block.startsWith(">")) {
      push("alt", block.replace(/^>\s?/gm, ""));
      continue;
    }

    if (block.includes("|") && /\|.*\|/.test(block)) {
      // Table → read each row as a sentence
      const rows = block
        .split("\n")
        .filter((r) => !/^[|\s:-]+$/.test(r))
        .map((r) =>
          r
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
            .join(", ")
        );
      push(sectionVoice, rows.join(". "));
      continue;
    }

    // List items → one sentence each
    if (/^\s*(?:[-*+]|\d+\.)\s+/m.test(block)) {
      const items = block
        .split("\n")
        .map((l) => l.replace(/^\s*(?:[-*+]|\d+\.)\s+/, "").trim())
        .filter(Boolean);
      push(sectionVoice, items.join(" "));
      continue;
    }

    if (isItalicOnlyParagraph(block)) {
      push("alt", block);
      continue;
    }

    push(sectionVoice, block);
  }

  return segments;
}

// Splits segment text into chunks below maxChunkChars at sentence boundaries.
function chunkText(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > maxChars) {
      chunks.push(current.trim());
      current = "";
    }
    // A single sentence longer than maxChars gets hard-split on commas/spaces
    if (sentence.length > maxChars) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      let rest = sentence;
      while (rest.length > maxChars) {
        let cut = rest.lastIndexOf(",", maxChars);
        if (cut < maxChars * 0.5) cut = rest.lastIndexOf(" ", maxChars);
        if (cut <= 0) cut = maxChars;
        chunks.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1);
      }
      current = rest;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ---------------------------------------------------------------------------
// TTS API
// ---------------------------------------------------------------------------

async function synthesizeChunk(text, voice, options) {
  const body = {
    text,
    preset_voice: [voice],
    output_format: "mp3",
  };
  if (options.speed) body.speed = options.speed;

  let lastError;
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`DeepInfra ${res.status}: ${errText.slice(0, 300)}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        if (!json.audio) {
          throw new Error(
            `No audio in response: ${JSON.stringify(json).slice(0, 300)}`
          );
        }
        const base64 = json.audio.replace(/^data:audio\/[^;]+;base64,/, "");
        return Buffer.from(base64, "base64");
      }
      // Some endpoints return raw audio bytes
      return Buffer.from(await res.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < CONFIG.maxRetries) {
        const delay = 1000 * 2 ** (attempt - 1);
        console.warn(
          `  Chunk failed (attempt ${attempt}/${CONFIG.maxRetries}): ${error.message} — retrying in ${delay}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// Runs tasks with limited concurrency, preserving result order.
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function assembleAudio(buffers, outputPath) {
  const combined = Buffer.concat(buffers);

  if (!hasFfmpeg()) {
    fs.writeFileSync(outputPath, combined);
    console.warn(
      "  ffmpeg not found — wrote raw-concatenated MP3. Plays fine, but seek/duration"
    );
    console.warn(
      "  can be unreliable in some players. `brew install ffmpeg` for clean output."
    );
    return;
  }

  // Re-encode the concatenation so frame headers and duration metadata are
  // consistent. 64 kbps mono is plenty for speech.
  const tmpPath = outputPath + ".tmp.mp3";
  fs.writeFileSync(tmpPath, combined);
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", tmpPath, "-ac", "1", "-b:a", "64k", outputPath],
      { stdio: "ignore" }
    );
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

// ---------------------------------------------------------------------------
// Story discovery
// ---------------------------------------------------------------------------

function resolveStoryId(input) {
  if (/^\d+$/.test(input)) {
    return `scpg-${input.padStart(3, "0")}`;
  }
  return input.toLowerCase();
}

function listStoryIds() {
  return fs
    .readdirSync(CONFIG.storiesDir)
    .filter((name) => /^scpg-\d+\.md$/.test(name))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();
}

function audioPathFor(storyId) {
  return path.join(CONFIG.audioDir, `${storyId}.mp3`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {
    story: null,
    force: false,
    dryRun: false,
    singleVoice: false,
    voiceMain: CONFIG.voiceMain,
    voiceAlt: CONFIG.voiceAlt,
    speed: null,
  };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--story":
        args.story = argv[++i];
        break;
      case "--force":
        args.force = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--single-voice":
        args.singleVoice = true;
        break;
      case "--voice-main":
        args.voiceMain = argv[++i];
        break;
      case "--voice-alt":
        args.voiceAlt = argv[++i];
        break;
      case "--speed":
        args.speed = parseFloat(argv[++i]);
        break;
      default:
        console.error(`Unknown flag: ${argv[i]}`);
        process.exit(1);
    }
  }
  return args;
}

async function generateAudioForStory(storyId, args, apiKey) {
  const storyPath = path.join(CONFIG.storiesDir, `${storyId}.md`);
  if (!fs.existsSync(storyPath)) {
    throw new Error(`Story not found: ${storyPath}`);
  }

  const { data, content } = matter(fs.readFileSync(storyPath, "utf8"));
  const segments = buildSegments(content, { singleVoice: args.singleVoice });

  // Expand segments into API-sized chunks, keeping voice assignment
  const chunks = segments.flatMap((seg) =>
    chunkText(seg.text, CONFIG.maxChunkChars).map((text) => ({
      voice: seg.voice === "alt" ? args.voiceAlt : args.voiceMain,
      text,
    }))
  );

  const totalChars = chunks.reduce((n, c) => n + c.text.length, 0);
  const estCost = (totalChars / 1e6) * CONFIG.pricePerMillionChars;
  console.log(
    `${storyId} (${data.title || "untitled"}): ${segments.length} segments, ` +
      `${chunks.length} chunks, ${totalChars.toLocaleString()} chars ` +
      `(~$${estCost.toFixed(3)})`
  );

  if (args.dryRun) {
    for (const seg of segments) {
      const voice = seg.voice === "alt" ? args.voiceAlt : args.voiceMain;
      console.log(`\n--- [${seg.voice} → ${voice}] ---`);
      console.log(seg.text);
    }
    return;
  }

  let done = 0;
  const buffers = await mapWithConcurrency(
    chunks,
    CONFIG.concurrency,
    async (chunk) => {
      const buffer = await synthesizeChunk(chunk.text, chunk.voice, {
        apiKey,
        speed: args.speed,
      });
      done++;
      process.stdout.write(`\r  Synthesizing: ${done}/${chunks.length}`);
      return buffer;
    }
  );
  process.stdout.write("\n");

  fs.mkdirSync(CONFIG.audioDir, { recursive: true });
  const outputPath = audioPathFor(storyId);
  assembleAudio(buffers, outputPath);

  const sizeMb = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
  console.log(`  Saved ${path.relative(process.cwd(), outputPath)} (${sizeMb} MB)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const apiKey = process.env.DEEPINFRA_API_KEY;
  if (!apiKey && !args.dryRun) {
    console.error(
      "DEEPINFRA_API_KEY is not set. Get one at https://deepinfra.com and add it to .env"
    );
    process.exit(1);
  }

  let storyIds;
  if (args.story) {
    storyIds = [resolveStoryId(args.story)];
  } else {
    storyIds = listStoryIds().filter(
      (id) => args.force || !fs.existsSync(audioPathFor(id))
    );
    if (storyIds.length === 0) {
      console.log("All stories already have audio. Use --force to regenerate.");
      return;
    }
    console.log(`Generating audio for ${storyIds.length} stories...\n`);
  }

  for (const storyId of storyIds) {
    if (
      !args.force &&
      !args.dryRun &&
      args.story &&
      fs.existsSync(audioPathFor(storyId))
    ) {
      console.log(`${storyId}: audio exists, use --force to regenerate.`);
      continue;
    }
    await generateAudioForStory(storyId, args, apiKey);
  }
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
