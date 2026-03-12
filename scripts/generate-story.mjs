#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);

const anthropicModels = {
  claude_4_5_haiku: "claude-haiku-4-5-20251001",
  claude_4_6_sonnet: "claude-sonnet-4-6",
  claude_4_6_opus: "claude-opus-4-6",
};

const openRouterModels = {
  kimi_2_5: "moonshotai/kimi-k2",
  kimi_2_5_instruct: "moonshotai/kimi-k2-instruct",
};

// Configuration
const CONFIG = {
  storiesDir: path.join(process.cwd(), "stories"),
  defaultProvider: "openrouter",
  providers: {
    anthropic: {
      apiUrl: "https://api.anthropic.com/v1/messages",
      defaultModel: anthropicModels.claude_4_6_sonnet,
    },
    openrouter: {
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      defaultModel: openRouterModels.kimi_2_5,
    },
  },
  fal: {
    // Model options: "fal-ai/flux/dev" (fast), "fal-ai/flux-pro" (higher quality)
    model: "fal-ai/flux/dev",
    imageSize: "landscape_16_9",
    numInferenceSteps: 28,
    guidanceScale: 3.5,
    pollIntervalMs: 3000,
    timeoutMs: 120000,
  },
  temperature: 0.7,
  promptTemplates: {
    safe: "Create a Safe-class SCP entry about {theme}. Focus on minimal containment requirements and low risk to personnel. The anomaly should be well-understood and predictable.",
    euclid:
      "Create a Euclid-class SCP entry about {theme}. The anomaly should be unpredictable or require specific containment procedures. Include some uncertainty about its capabilities.",
    keter:
      "Create a Keter-class SCP entry about {theme}. This should be a dangerous, difficult-to-contain anomaly with potential for catastrophic consequences. Include breach scenarios and complex containment.",
    apollyon:
      "Create an Apollyon-class SCP entry about {theme}. This should represent an unstoppable or uncontainable force with world-ending potential. Current containment is failing or impossible.",
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getNextScpNumber() {
  if (!fs.existsSync(CONFIG.storiesDir)) {
    fs.mkdirSync(CONFIG.storiesDir, { recursive: true });
  }

  const files = fs
    .readdirSync(CONFIG.storiesDir)
    .filter((file) => file.match(/^scpg-(\d+)\.md$/))
    .map((file) => parseInt(file.match(/scpg-(\d+)\.md$/)[1]))
    .sort((a, b) => a - b);

  return files.length > 0 ? Math.max(...files) + 1 : 1;
}

function generatePrompt(theme, scpClass, additionalParams = {}) {
  const basePrompt = CONFIG.promptTemplates[scpClass.toLowerCase()];
  const prompt = basePrompt.replace("{theme}", theme);

  const fullPrompt = `${prompt}

REQUIREMENTS:
- Write in authentic SCP Foundation style
- Include proper formatting with Object Class, Special Containment Procedures, and Description sections
- Add at least one Addendum with incident logs or research notes
- Keep it engaging but scientific in tone
- Length should be at least 2000 words
- Include realistic containment protocols
- Use the SCP Foundation wiki style guide as reference: https://scpwiki.com/scp-foundation-style-guide
- give story a name that fits the theme
${
  additionalParams.tags
    ? `- Incorporate these themes/tags: ${additionalParams.tags.join(", ")}`
    : ""
}
${
  additionalParams.location
    ? `- Set the discovery/containment at: ${additionalParams.location}`
    : ""
}
${
  additionalParams.researcher
    ? `- Include researcher named: Dr. ${additionalParams.researcher}`
    : ""
}

Return ONLY the story content without any markdown frontmatter or metadata - I'll add that separately.`;

  return fullPrompt;
}

function generateImagePrompt(theme, scpClass, storyContent) {
  // Extract the title
  const titleMatch = storyContent.match(/^#\s+(?:SCPG-\d+:\s+)?(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim().replace(/[""]/g, "") : theme;

  // Extract the Description and Addendum sections (skip Containment Procedures)
  const descAndAddenda = storyContent
    .replace(/^[\s\S]*?\*\*Description[:\s]*\*\*/i, "")  // drop everything before Description
    .replace(/\*\*Special Containment Procedures[:\s]*\*\*[\s\S]*?\*\*Description/i, ""); // safety fallback

  // Clean the extracted text
  const cleaned = descAndAddenda
    .replace(/\[REDACTED\]/gi, "")
    .replace(/█+\/?█*/g, "")
    .replace(/\*\*[^*]+\*\*/g, "")  // remove bold markers and their content (section headers)
    .replace(/#+ .+/g, "")           // remove markdown headers
    .replace(/Item #:.+/g, "")
    .replace(/Object Class:.+/g, "")
    .replace(/SCP-\d+[A-Z]?(-[A-Z]+)?/g, "the entity")
    .replace(/SCPG-\d+[A-Z]?(-[A-Z]+)?/g, "the entity")
    .replace(/\(see [^)]+\)/gi, "")
    .replace(/\(designated [^)]+\)/gi, "")
    .replace(/\d{1,2}\.\s/g, " ")     // remove numbered list prefixes
    .replace(/\bon \/?[\d\/]*\b/g, "")  // remove partial dates like "on /2009"
    .replace(/located in\s*,/g, "located in an undisclosed location,")
    .replace(/\bthe entity\b/gi, "it")  // less repetitive than "the entity"
    .replace(/\bit is\b/g, "the anomaly is")  // restore clarity for first occurrence
    .replace(/\s+/g, " ");

  // Extract sentences that contain visual/physical descriptors
  const visualKeywords = /\b(appear|look|resemble|shaped|glow|emit|float|dark|light|color|black|white|red|shadow|surface|liquid|glass|metal|stone|flesh|eye|face|hand|body|figure|silhouette|door|mirror|wall|room|chamber|corridor|sky|fog|mist|smoke|fire|water|blood|rust|crack|fracture|crystal|orb|sphere|tower|building|machine|screen|static|signal|broadcast|frequency|telescope|collider|crater|geometry|architecture|impossible|non-euclidean|fractal|recursive|infinite|spiral|void|abyss|rift|portal|gateway|photograph|painting|statue|artifact|relic|ancient|decay|ruin|distort|warp|shimmer|pulse|hum|vibrat|flicker|swirl|tentacle|wing|claw|tooth|horn|mask|robe|armor)\b/i;

  const sentences = cleaned
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => visualKeywords.test(s) && s.length > 30 && s.length < 250)
    .map((s) => s.trim());

  // Take up to 3 of the most visual sentences
  const visualDetails = sentences.slice(0, 3).join(" ").trim();

  // Build the subject: title + visual details from the story
  const subject = visualDetails
    ? `${title}. ${visualDetails}`
    : title;

  const classAtmosphere = {
    safe: "clinical sterile laboratory, fluorescent lighting, muted tones, subtle wrongness",
    euclid: "dim abandoned facility, fog, uncertain shadows, eerie twilight",
    keter: "dark ominous containment breach, danger, harsh contrast, red warning lights",
    apollyon: "apocalyptic devastation, cosmic horror, overwhelming scale, end of world",
  };

  const atmosphere = classAtmosphere[scpClass.toLowerCase()] ?? "mysterious and unsettling";

  // Truncate subject to ~400 chars for best Flux results
  const maxSubjectLen = 400;
  const truncatedSubject = subject.length > maxSubjectLen
    ? subject.slice(0, maxSubjectLen).replace(/\s\S*$/, "...")
    : subject;

  return `${truncatedSubject}, ${atmosphere}, cinematic still frame, desaturated muted color palette, dark vignette, photorealistic, no text, no words, no logos, no UI`;
}

// ---------------------------------------------------------------------------
// Story API calls
// ---------------------------------------------------------------------------

async function callAnthropicAPI(prompt, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY environment variable not set");
    console.log("💡 Get your API key from: https://console.anthropic.com/");
    console.log("💡 Add to .env file: ANTHROPIC_API_KEY=your-key-here");
    process.exit(1);
  }

  try {
    const response = await fetch(CONFIG.providers.anthropic.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        temperature: CONFIG.temperature,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? "";
  } catch (error) {
    console.error("❌ Error calling Anthropic API:", error.message);
    process.exit(1);
  }
}

async function callOpenRouterAPI(prompt, model) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY environment variable not set");
    console.log("💡 Get your API key from: https://openrouter.ai/keys");
    console.log("💡 Add to .env file: OPENROUTER_API_KEY=your-key-here");
    process.exit(1);
  }

  try {
    const response = await fetch(CONFIG.providers.openrouter.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL ||
          "https://github.com/jprester/latent-foundation",
        "X-Title": "Latent Foundation Story Generator",
      },
      body: JSON.stringify({
        model,
        temperature: CONFIG.temperature,
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content === "string") {
      return content;
    }

    throw new Error("OpenRouter response did not include story content");
  } catch (error) {
    console.error("❌ Error calling OpenRouter API:", error.message);
    process.exit(1);
  }
}

async function callModelAPI(prompt, provider, model) {
  if (provider === "anthropic") {
    return callAnthropicAPI(prompt, model);
  }

  return callOpenRouterAPI(prompt, model);
}

// ---------------------------------------------------------------------------
// Fal.ai thumbnail generation
// ---------------------------------------------------------------------------

async function generateThumbnailWithFal(imagePrompt, outputPath) {
  const falKey = process.env.FAL_KEY;

  if (!falKey) {
    console.error("❌ FAL_KEY environment variable not set");
    console.log("💡 Get your API key from: https://fal.ai/dashboard/keys");
    console.log("💡 Add to .env file: FAL_KEY=your-key-here");
    return false;
  }

  console.log(`🎨 Generating thumbnail with Fal.ai...`);
  console.log(`   Model: ${CONFIG.fal.model}`);
  console.log(`   Prompt: ${imagePrompt.slice(0, 100)}...`);

  // Submit the generation request
  let responseUrl;
  let statusUrl;
  try {
    const submitResponse = await fetch(
      `https://queue.fal.run/${CONFIG.fal.model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${falKey}`,
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          image_size: CONFIG.fal.imageSize,
          num_inference_steps: CONFIG.fal.numInferenceSteps,
          guidance_scale: CONFIG.fal.guidanceScale,
          num_images: 1,
          enable_safety_checker: true,
        }),
      }
    );

    if (!submitResponse.ok) {
      const error = await submitResponse.text();
      throw new Error(`Fal.ai submit error ${submitResponse.status}: ${error}`);
    }

    const submitData = await submitResponse.json();
    responseUrl = submitData.response_url;
    statusUrl = submitData.status_url;
    console.log(`   Request ID: ${submitData.request_id}`);
  } catch (error) {
    console.error("❌ Failed to submit image request:", error.message);
    return false;
  }

  // Poll for completion using the URLs returned by the submit response
  const deadline = Date.now() + CONFIG.fal.timeoutMs;
  let attempt = 0;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, CONFIG.fal.pollIntervalMs));

    try {
      // Check status first
      const statusResponse = await fetch(statusUrl, {
        headers: { Authorization: `Key ${falKey}` },
      });

      if (!statusResponse.ok) {
        attempt++;
        continue;
      }

      const status = await statusResponse.json();

      if (status.status === "COMPLETED") {
        // Fetch the full result
        const resultResponse = await fetch(responseUrl, {
          headers: { Authorization: `Key ${falKey}` },
        });

        if (!resultResponse.ok) {
          const errorText = await resultResponse.text();
          console.error(`\n❌ Fal.ai result fetch error (${resultResponse.status}):`, errorText);
          return false;
        }

        const result = await resultResponse.json();
        const imageUrl = result.images?.[0]?.url;
        if (!imageUrl) {
          console.error("❌ No image URL in Fal.ai response:", JSON.stringify(result).slice(0, 300));
          return false;
        }

        // Download and save the image
        console.log("\n   Downloading image...");
        const imgResponse = await fetch(imageUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
        console.log(`✅ Thumbnail saved: ${outputPath}`);
        return true;
      }

      if (status.status === "FAILED") {
        console.error(`\n❌ Fal.ai generation failed:`, JSON.stringify(status));
        return false;
      }

      const dots = ".".repeat((attempt % 3) + 1);
      process.stdout.write(`\r   Waiting for image${dots}   `);
      attempt++;
    } catch (err) {
      attempt++;
      if (attempt > 3) {
        console.error(`\n   Polling error: ${err.message}`);
      }
    }
  }

  console.error("\n❌ Fal.ai generation timed out");
  return false;
}

// ---------------------------------------------------------------------------
// Tags & frontmatter
// ---------------------------------------------------------------------------

function generateTags(theme, scpClass, additionalParams) {
  const baseTags = [];

  switch (scpClass.toLowerCase()) {
    case "safe":
      baseTags.push("predictable", "low-risk");
      break;
    case "euclid":
      baseTags.push("unpredictable", "moderate-risk");
      break;
    case "keter":
      baseTags.push("dangerous", "high-risk", "breach-risk");
      break;
    case "apollyon":
      baseTags.push("uncontainable", "world-ending", "catastrophic");
      break;
  }

  const themeWords = theme.toLowerCase().split(" ");
  baseTags.push(...themeWords.slice(0, 2));

  if (additionalParams.tags) {
    baseTags.push(...additionalParams.tags);
  }

  return [...new Set(baseTags)].slice(0, 6);
}

function createMarkdownFile(
  scpNumber,
  content,
  scpClass,
  theme,
  additionalParams
) {
  const tags = generateTags(theme, scpClass, additionalParams);
  const today = new Date().toISOString().split("T")[0];

  // Use "thumbnail.jpg" when we generated one, otherwise use whatever was passed manually
  const thumbnailValue = additionalParams.thumbnail ?? null;

  const lines = [
    "---",
    `title: "SCPG-${scpNumber.toString().padStart(3, "0")}"`,
    `class: "${scpClass}"`,
    `tags: ${JSON.stringify(tags)}`,
    `date: "${today}"`,
  ];

  if (thumbnailValue) {
    lines.push(`thumbnail: "${thumbnailValue}"`);
  }
  if (additionalParams.images) {
    lines.push(`images: ${JSON.stringify(additionalParams.images)}`);
  }

  lines.push("---", "", "");
  const frontmatter = lines.join("\n");

  const fullContent = frontmatter + content;
  const filename = `scpg-${scpNumber.toString().padStart(3, "0")}.md`;
  const filepath = path.join(CONFIG.storiesDir, filename);

  fs.writeFileSync(filepath, fullContent, "utf8");
  return { filename, filepath };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function resolveProvider(providerRaw) {
  const provider = (providerRaw || CONFIG.defaultProvider).toLowerCase();

  if (!Object.hasOwn(CONFIG.providers, provider)) {
    console.error(
      `❌ Invalid provider "${providerRaw}". Must be: anthropic or openrouter`
    );
    process.exit(1);
  }

  return provider;
}

function resolveModel(provider, modelRaw) {
  if (!modelRaw) {
    return CONFIG.providers[provider].defaultModel;
  }

  if (provider === "anthropic" && Object.hasOwn(anthropicModels, modelRaw)) {
    return anthropicModels[modelRaw];
  }

  if (provider === "openrouter" && Object.hasOwn(openRouterModels, modelRaw)) {
    return openRouterModels[modelRaw];
  }

  return modelRaw;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  const booleanFlags = new Set(["no-image", "help", "generate-thumbnails", "force"]);

  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, "");

    if (booleanFlags.has(key)) {
      params[key] = true;
      continue;
    }

    const value = args[++i];

    if (key === "tags" || key === "images") {
      params[key] = value ? value.split(",").map((t) => t.trim()) : [];
    } else {
      params[key] = value;
    }
  }

  return params;
}

function showHelp() {
  console.log(`
🏛️  THE LATENT FOUNDATION - Story Generator

USAGE:
  node scripts/generate-story.mjs --theme "THEME" --class "CLASS" [OPTIONS]
  node scripts/generate-story.mjs --generate-thumbnails [OPTIONS]

GENERATE STORY (requires --theme and --class):
  --theme     Story theme/concept (e.g., "haunted mirror", "time-dilating coffee shop")
  --class     SCP class: Safe, Euclid, Keter, or Apollyon

STORY OPTIONS:
  --tags        Comma-separated tags (e.g., "memetic,visual,mirror")
  --location    Discovery location (e.g., "abandoned hospital in Ohio")
  --researcher  Researcher name (e.g., "Martinez", "Chen")
  --thumbnail   Manual thumbnail filename — skips Fal.ai generation
  --no-image    Skip thumbnail generation entirely
  --images      Comma-separated image files (e.g., "image1.jpg,image2.jpg")
  --number      Specific SCP number (auto-generated if not provided)
  --provider    Model provider: openrouter (default) or anthropic
  --model       Model id or alias for selected provider
  --fal-model   Fal.ai model: "fal-ai/flux/dev" (default) or "fal-ai/flux-pro"

GENERATE THUMBNAILS (backfill missing images):
  --generate-thumbnails   Generate thumbnails for existing stories missing them
  --story                 Target a specific story (e.g., --story scpg-031 or --story 31)
  --force                 Regenerate even if thumbnail already exists
  --fal-model             Override Fal.ai model for generation

EXAMPLES:
  # Basic story with auto-generated thumbnail
  node scripts/generate-story.mjs --theme "reality-bending mirror" --class "Euclid"

  # Detailed story with custom elements
  node scripts/generate-story.mjs \\
    --theme "sentient AI that writes poetry" \\
    --class "Safe" \\
    --tags "artificial-intelligence,writing,benevolent" \\
    --location "MIT Computer Science Lab" \\
    --researcher "Stevens"

  # Skip thumbnail generation
  node scripts/generate-story.mjs \\
    --theme "interdimensional doorway" \\
    --class "Keter" \\
    --no-image

  # Generate missing thumbnails for all stories
  node scripts/generate-story.mjs --generate-thumbnails

  # Generate thumbnail for a specific story
  node scripts/generate-story.mjs --generate-thumbnails --story scpg-031

  # Regenerate thumbnail for a story (even if it exists)
  node scripts/generate-story.mjs --generate-thumbnails --story 15 --force

  # Use higher quality Fal model for backfill
  node scripts/generate-story.mjs --generate-thumbnails --fal-model "fal-ai/flux-pro"

  # Manual thumbnail (existing image)
  node scripts/generate-story.mjs \\
    --theme "clockwork automaton" \\
    --class "Keter" \\
    --thumbnail "my-existing-image.jpg"

SETUP:
  1. Anthropic:   ANTHROPIC_API_KEY=your-key  (in .env)
  2. OpenRouter:  OPENROUTER_API_KEY=your-key (in .env)
  3. Fal.ai:      FAL_KEY=your-key            (in .env)
  4. Optional:    OPENROUTER_SITE_URL=https://your-site.example

📖 Generated stories saved to /stories
🖼️  Thumbnails saved to /public/images/[story-id]/thumbnail.jpg
`);
}

// ---------------------------------------------------------------------------
// Thumbnail backfill for existing stories
// ---------------------------------------------------------------------------

function parseStoryFile(filepath) {
  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  return { data, content, raw };
}

function getStoriesWithoutThumbnails() {
  const imagesRoot = path.join(process.cwd(), "public", "images");
  const storyFiles = fs
    .readdirSync(CONFIG.storiesDir)
    .filter((f) => f.match(/^scpg-(\d+)\.md$/))
    .sort();

  const missing = [];

  for (const file of storyFiles) {
    const storyId = file.replace(/\.md$/, "");
    const thumbnailPath = path.join(imagesRoot, storyId, "thumbnail.jpg");

    if (!fs.existsSync(thumbnailPath)) {
      missing.push({ file, storyId });
    }
  }

  return missing;
}

async function generateThumbnailsForExisting(params) {
  // Override Fal model if specified
  if (params["fal-model"]) {
    CONFIG.fal.model = params["fal-model"];
  }

  const imagesRoot = path.join(process.cwd(), "public", "images");

  // Determine which stories to process
  let targets;

  if (params.story) {
    // Single story specified (e.g. --story scpg-031 or --story 031)
    const storyId = params.story.startsWith("scpg-")
      ? params.story
      : `scpg-${params.story.padStart(3, "0")}`;
    const file = `${storyId}.md`;
    const filepath = path.join(CONFIG.storiesDir, file);

    if (!fs.existsSync(filepath)) {
      console.error(`❌ Story not found: ${file}`);
      process.exit(1);
    }

    const thumbnailPath = path.join(imagesRoot, storyId, "thumbnail.jpg");
    if (fs.existsSync(thumbnailPath) && !params.force) {
      console.log(`✅ ${storyId} already has a thumbnail. Use --force to regenerate.`);
      return;
    }

    targets = [{ file, storyId }];
  } else {
    // All stories missing thumbnails
    targets = getStoriesWithoutThumbnails();

    if (targets.length === 0) {
      console.log("✅ All stories already have thumbnails!");
      return;
    }

    console.log(`Found ${targets.length} stories without thumbnails:\n`);
    for (const t of targets) {
      console.log(`   - ${t.storyId}`);
    }
    console.log("");
  }

  let succeeded = 0;
  let failed = 0;

  for (const { file, storyId } of targets) {
    const filepath = path.join(CONFIG.storiesDir, file);
    const { data, content } = parseStoryFile(filepath);

    const scpClass = data.class || "Euclid";
    // Derive a theme from the title and tags
    const titleClean = (data.title || "")
      .replace(/^SCPG-\d+[:\s]*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    const tagHints = (data.tags || []).slice(0, 3).join(", ");
    const theme = titleClean || tagHints || storyId;

    console.log(`\n🖼️  [${storyId}] "${titleClean || storyId}"`);
    console.log(`   Class: ${scpClass}`);

    const imageDir = path.join(imagesRoot, storyId);
    fs.mkdirSync(imageDir, { recursive: true });
    const thumbnailPath = path.join(imageDir, "thumbnail.jpg");

    const imagePrompt = generateImagePrompt(theme, scpClass, content);
    const success = await generateThumbnailWithFal(imagePrompt, thumbnailPath);

    if (success) {
      succeeded++;
    } else {
      failed++;
      console.warn(`⚠️  Failed to generate thumbnail for ${storyId}`);
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Generated: ${succeeded}  ❌ Failed: ${failed}  Total: ${targets.length}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🏛️  THE LATENT FOUNDATION - Story Generator\n");

  const params = parseArgs();

  // Thumbnail backfill mode
  if (params["generate-thumbnails"]) {
    await generateThumbnailsForExisting(params);
    return;
  }

  if (!params.theme || !params.class || params.help) {
    showHelp();
    process.exit(0);
  }

  // Validate class
  const validClasses = ["Safe", "Euclid", "Keter", "Apollyon"];
  const scpClass =
    params.class.charAt(0).toUpperCase() + params.class.slice(1).toLowerCase();

  if (!validClasses.includes(scpClass)) {
    console.error(
      `❌ Invalid class "${params.class}". Must be: Safe, Euclid, Keter, or Apollyon`
    );
    process.exit(1);
  }

  // Override Fal model if specified
  if (params["fal-model"]) {
    CONFIG.fal.model = params["fal-model"];
  }

  const skipImage = params["no-image"] === true || params.thumbnail !== undefined;
  const scpNumber = params.number
    ? parseInt(params.number)
    : getNextScpNumber();
  const provider = resolveProvider(params.provider);
  const model = resolveModel(provider, params.model);

  console.log(`📝 Generating SCPG-${scpNumber.toString().padStart(3, "0")}`);
  console.log(`🎯 Theme: ${params.theme}`);
  console.log(`🔒 Class: ${scpClass}`);
  console.log(`🧠 Provider: ${provider}`);
  console.log(`🛰️  Model: ${model}`);
  if (params.tags) console.log(`🏷️  Tags: ${params.tags.join(", ")}`);
  console.log(
    `🖼️  Thumbnail: ${
      skipImage
        ? params.thumbnail
          ? `manual (${params.thumbnail})`
          : "skipped"
        : `auto (Fal.ai ${CONFIG.fal.model})`
    }`
  );
  console.log("");

  try {
    // 1. Generate the story
    console.log("🤖 Generating story...");
    const prompt = generatePrompt(params.theme, scpClass, params);
    const story = await callModelAPI(prompt, provider, model);
    console.log("✅ Story generated\n");

    // 2. Generate thumbnail via Fal.ai (unless skipped or manual thumbnail given)
    let thumbnailFilename = params.thumbnail ?? null;

    if (!skipImage) {
      const scpNumberPadded = scpNumber.toString().padStart(3, "0");
      const imageDir = path.join(
        process.cwd(),
        "public",
        "images",
        `scpg-${scpNumberPadded}`
      );
      fs.mkdirSync(imageDir, { recursive: true });
      const thumbnailPath = path.join(imageDir, "thumbnail.jpg");
      thumbnailFilename = "thumbnail.jpg";

      const imagePrompt = generateImagePrompt(params.theme, scpClass, story);
      const success = await generateThumbnailWithFal(imagePrompt, thumbnailPath);

      if (!success) {
        console.warn("⚠️  Thumbnail generation failed — continuing without image.");
        thumbnailFilename = null;
      }

      console.log("");
    }

    // 3. Save the markdown file
    const { filename, filepath } = createMarkdownFile(
      scpNumber,
      story,
      scpClass,
      params.theme,
      { ...params, thumbnail: thumbnailFilename }
    );

    console.log("✅ Story saved successfully!");
    console.log(`📄 File: ${filename}`);
    console.log(`📁 Path: ${filepath}`);
    if (thumbnailFilename) {
      console.log(`🖼️  Thumbnail: ${thumbnailFilename}`);
    }
    console.log(
      "\n🚀 Your new SCP story is ready! Add it to your website and start generating more anomalies!"
    );
  } catch (error) {
    console.error("❌ Failed to generate story:", error.message);
    process.exit(1);
  }
}

if (process.argv[1] === __filename) {
  main();
}

export { generatePrompt, getNextScpNumber, generateTags };
