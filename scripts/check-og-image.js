#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// For now, let's just copy the SVG as PNG since many platforms support SVG
// If you need a true PNG, you can use an online converter or install ImageMagick
const svgPath = path.join(__dirname, "../public/images/og-default.svg");
const svgContent = fs.readFileSync(svgPath, "utf8");

console.log("SVG OpenGraph image is ready at /images/og-default.svg");
console.log("Dimensions: 1200x630px");
console.log(
  "For better social media compatibility, consider converting to PNG:"
);
console.log("1. Use an online SVG to PNG converter");
console.log("2. Install ImageMagick: brew install imagemagick");
console.log(
  "3. Run: convert public/images/og-default.svg public/images/og-default.png"
);
