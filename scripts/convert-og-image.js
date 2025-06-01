const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function convertSvgToPng() {
  const svgPath = path.join(__dirname, "../public/images/og-default.png");
  const pngPath = path.join(__dirname, "../public/images/og-default.png");

  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Convert SVG to PNG
    await sharp(svgBuffer).png().resize(1200, 630).toFile(pngPath);

    console.log("Successfully converted og-default.png to og-default.png");
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
  }
}

convertSvgToPng();
