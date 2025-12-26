import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 96, 128];
const svgPath = path.join(__dirname, 'public/icons/icon.svg');
const iconsDir = path.join(__dirname, 'public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating favicon icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `favicon-${size}x${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${size}x${size} icon`);
  }
  
  // Generate favicon.ico (using 32x32)
  const faviconPath = path.join(__dirname, 'public/favicon.ico');
  await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('✓ Generated favicon.ico');
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
