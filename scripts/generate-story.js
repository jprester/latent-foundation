#!/usr/bin/env node

// Load environment variables from .env file
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { config } = require("dotenv");

const anthropicModels = {
  claude4_sonnet: "claude-sonnet-4-20250514",
  claude4_opus: "claude-opus-4-20250514",
  claude3_7_sonnet: "claude-3-7-sonnet-latest",
};

// Configuration
const CONFIG = {
  apiUrl: "https://api.anthropic.com/v1/messages",
  storiesDir: path.join(process.cwd(), "stories"),
  model: anthropicModels.claude4_sonnet,
  temperature: 0.7,
  promptTemplates: {
    safe: "Create a Safe-class SCP entry about {theme}. Focus on minimal containment requirements and low risk to personnel. The anomaly should be well-understood and predictable.",
    euclid:
      "Create a Euclid-class SCP entry about {theme}. The anomaly should be unpredictable or require specific containment procedures. Include some uncertainty about its capabilities.",
    keter:
      "Create a Keter-class SCP entry about {theme}. This should be a dangerous, difficult-to-contain anomaly with potential for catastrophic consequences. Include breach scenarios and complex containment.",
  },
};

// Helper functions
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

async function callClaudeAPI(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY environment variable not set");
    console.log("💡 Get your API key from: https://console.anthropic.com/");
    console.log("💡 Add to .env file: ANTHROPIC_API_KEY=your-key-here");
    console.log('💡 Or set with: export ANTHROPIC_API_KEY="your-key-here"');
    console.log(
      "💡 Make sure .env file is in your project root and install dotenv: npm install dotenv"
    );
    process.exit(1);
  }

  console.log("🤖 Generating story with Claude...");
  console.log(
    `🔑 Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(
      apiKey.length - 4
    )}`
  );

  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: 4000,
        temperature: CONFIG.temperature,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("❌ Error calling Claude API:", error.message);
    process.exit(1);
  }
}

function generateTags(theme, scpClass, additionalParams) {
  const baseTags = [];

  // Add class-specific tags
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
  }

  // Add theme-based tags
  const themeWords = theme.toLowerCase().split(" ");
  baseTags.push(...themeWords.slice(0, 2));

  // Add custom tags
  if (additionalParams.tags) {
    baseTags.push(...additionalParams.tags);
  }

  // Remove duplicates and limit to 6 tags
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

  const frontmatter = `---
title: "SCPG-${scpNumber.toString().padStart(3, "0")}"
class: "${scpClass}"
tags: ${JSON.stringify(tags)}
date: "${today}"
${
  additionalParams.thumbnail ? `thumbnail: "${additionalParams.thumbnail}"` : ""
}
${
  additionalParams.images
    ? `images: ${JSON.stringify(additionalParams.images)}`
    : ""
}
---

`;

  const fullContent = frontmatter + content;
  const filename = `scpg-${scpNumber.toString().padStart(3, "0")}.md`;
  const filepath = path.join(CONFIG.storiesDir, filename);

  fs.writeFileSync(filepath, fullContent, "utf8");
  return { filename, filepath };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    const value = args[i + 1];

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
  node scripts/generate-story.js --theme "THEME" --class "CLASS" [OPTIONS]

REQUIRED:
  --theme     Story theme/concept (e.g., "haunted mirror", "time-dilating coffee shop")
  --class     SCP class: Safe, Euclid, or Keter

OPTIONAL:
  --tags      Comma-separated tags (e.g., "memetic,visual,mirror")
  --location  Discovery location (e.g., "abandoned hospital in Ohio")
  --researcher Researcher name (e.g., "Martinez", "Chen")
  --thumbnail Image filename for thumbnail (e.g., "thumbnail.jpg")
  --images    Comma-separated image files (e.g., "image1.jpg,image2.jpg")
  --number    Specific SCP number (auto-generated if not provided)

EXAMPLES:
  # Basic story
  node scripts/generate-story.js --theme "reality-bending mirror" --class "Euclid"
  
  # Detailed story with custom elements
  node scripts/generate-story.js \\
    --theme "sentient AI that writes poetry" \\
    --class "Safe" \\
    --tags "artificial-intelligence,writing,benevolent" \\
    --location "MIT Computer Science Lab" \\
    --researcher "Stevens"

  # Story with images
  node scripts/generate-story.js \\
    --theme "interdimensional doorway" \\
    --class "Keter" \\
    --thumbnail "door-thumbnail.jpg" \\
    --images "door-closed.jpg,door-open.jpg,incident-log.jpg"

SETUP:
  1. Get Claude API key: https://console.anthropic.com/
  2. Set environment variable: export ANTHROPIC_API_KEY="your-key"
  3. Run the command with your parameters

📖 Generated stories will be saved to the /stories directory
`);
}

// Main execution
async function main() {
  console.log("🏛️  THE LATENT FOUNDATION - Story Generator\n");

  const params = parseArgs();

  if (!params.theme || !params.class || process.argv.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  // Validate class
  const validClasses = ["Safe", "Euclid", "Keter"];
  const scpClass =
    params.class.charAt(0).toUpperCase() + params.class.slice(1).toLowerCase();

  if (!validClasses.includes(scpClass)) {
    console.error(
      `❌ Invalid class "${params.class}". Must be: Safe, Euclid, or Keter`
    );
    process.exit(1);
  }

  // Get SCP number
  const scpNumber = params.number
    ? parseInt(params.number)
    : getNextScpNumber();

  console.log(`📝 Generating SCPG-${scpNumber.toString().padStart(3, "0")}`);
  console.log(`🎯 Theme: ${params.theme}`);
  console.log(`🔒 Class: ${scpClass}`);
  if (params.tags) console.log(`🏷️  Tags: ${params.tags.join(", ")}`);
  console.log("");

  try {
    // Generate the story
    const prompt = generatePrompt(params.theme, scpClass, params);
    const story = await callClaudeAPI(prompt);

    // Create the markdown file
    const { filename, filepath } = createMarkdownFile(
      scpNumber,
      story,
      scpClass,
      params.theme,
      params
    );

    console.log("✅ Story generated successfully!");
    console.log(`📄 File: ${filename}`);
    console.log(`📁 Path: ${filepath}`);
    console.log("");
    console.log(
      "🚀 Your new SCP story is ready! Add it to your website and start generating more anomalies!"
    );
  } catch (error) {
    console.error("❌ Failed to generate story:", error.message);
    process.exit(1);
  }
}

// Handle fetch for Node.js environments that don't have it
if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

if (require.main === module) {
  main();
}

module.exports = { generatePrompt, getNextScpNumber, generateTags };
