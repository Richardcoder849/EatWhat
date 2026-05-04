import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const SIZE = 1024;
const R = SIZE / 2;
const GREEN = [134, 200, 75];
const DARK_GREEN = [95, 168, 50];
const WHITE = [255, 255, 255];

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgb(134,200,75)" />
      <stop offset="100%" stop-color="rgb(95,168,50)" />
    </linearGradient>
  </defs>

  <!-- Background rounded rect -->
  <rect width="${SIZE}" height="${SIZE}" rx="${R}" ry="${R}" fill="url(#bg)" />

  <!-- Bowl icon -->
  <g transform="translate(${SIZE/2}, ${SIZE*0.46})" fill="none" stroke="white" stroke-width="36" stroke-linecap="round" stroke-linejoin="round">
    <!-- Bowl body -->
    <path d="M-160,-30 Q-160,110 0,110 Q160,110 160,-30" fill="rgba(255,255,255,0.15)" />
    <!-- Bowl rim -->
    <line x1="-180" y1="-30" x2="180" y2="-30" stroke-width="32" />
    <!-- Steam -->
    <path d="M-60,-70 Q-40,-110 -20,-70" fill="none" stroke-width="20" stroke-dasharray="1 1" />
    <path d="M-10,-85 Q10,-125 30,-85" fill="none" stroke-width="20" />
    <path d="M50,-70 Q70,-110 90,-70" fill="none" stroke-width="20" />
  </g>

  <!-- Chopsticks -->
  <g transform="translate(${SIZE/2}, ${SIZE*0.38})" stroke="white" stroke-width="14" stroke-linecap="round">
    <line x1="-180" y1="100" x2="-140" y2="-120" stroke-width="16" />
    <line x1="-155" y1="100" x2="-115" y2="-120" stroke-width="16" />
  </g>

  <!-- Sparkle dots -->
  <circle cx="${SIZE*0.78}" cy="${SIZE*0.18}" r="16" fill="white" opacity="0.6" />
  <circle cx="${SIZE*0.85}" cy="${SIZE*0.28}" r="10" fill="white" opacity="0.4" />
  <circle cx="${SIZE*0.2}" cy="${SIZE*0.2}" r="12" fill="white" opacity="0.5" />
</svg>`;

async function main() {
  // Generate icon.png (1024x1024 for app store)
  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'icon.png'));

  // Generate adaptive-icon.png (for Android)
  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'adaptive-icon.png'));

  // Generate favicon.png (for web)
  await sharp(Buffer.from(svg))
    .resize(48, 48)
    .png()
    .toFile(join(assetsDir, 'favicon.png'));

  // Generate splash-icon.png
  await sharp(Buffer.from(svg))
    .resize(256, 256)
    .png()
    .toFile(join(assetsDir, 'splash-icon.png'));

  console.log('✅ Icons generated successfully!');
}

main().catch(console.error);
