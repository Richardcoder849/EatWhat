import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const SIZE = 1024;
const R = SIZE / 2;

const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFB25C" />
      <stop offset="58%" stop-color="#FF6B35" />
      <stop offset="100%" stop-color="#201A17" />
    </linearGradient>
    <linearGradient id="bowl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFF0E5" />
    </linearGradient>
  </defs>

  <rect width="${SIZE}" height="${SIZE}" rx="${R}" ry="${R}" fill="url(#bg)" />
  <path d="M120 230 C290 120 530 120 900 240 L900 360 C580 250 350 260 120 420 Z" fill="#16A085" opacity="0.24" />
  <path d="M120 820 C360 680 610 720 900 600 L900 840 C620 930 350 930 120 820 Z" fill="#FFFFFF" opacity="0.16" />

  <g transform="translate(${SIZE / 2}, ${SIZE * 0.5})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-185 -12 Q-178 162 0 178 Q178 162 185 -12" fill="url(#bowl)" opacity="0.96" />
    <line x1="-215" y1="-15" x2="215" y2="-15" stroke="#FFFFFF" stroke-width="42" />
    <path d="M-80 -92 C-122 -145 -42 -170 -84 -222" stroke="#FFFFFF" stroke-width="24" opacity="0.86" />
    <path d="M5 -108 C-34 -164 52 -186 8 -244" stroke="#FFFFFF" stroke-width="24" opacity="0.96" />
    <path d="M88 -92 C46 -145 126 -170 84 -222" stroke="#FFFFFF" stroke-width="24" opacity="0.86" />
    <path d="M-150 72 C-72 122 72 122 150 72" stroke="#FF6B35" stroke-width="20" opacity="0.5" />
  </g>

  <g transform="translate(${SIZE / 2}, ${SIZE * 0.44})" stroke="#201A17" stroke-width="18" stroke-linecap="round" opacity="0.9">
    <line x1="-210" y1="134" x2="-156" y2="-128" />
    <line x1="-174" y1="132" x2="-120" y2="-130" />
  </g>

  <circle cx="${SIZE * 0.78}" cy="${SIZE * 0.18}" r="16" fill="white" opacity="0.78" />
  <circle cx="${SIZE * 0.84}" cy="${SIZE * 0.28}" r="10" fill="white" opacity="0.5" />
  <circle cx="${SIZE * 0.21}" cy="${SIZE * 0.2}" r="12" fill="white" opacity="0.58" />
</svg>`;

async function main() {
  await sharp(Buffer.from(svg)).resize(1024, 1024).png().toFile(join(assetsDir, 'icon.png'));
  await sharp(Buffer.from(svg)).resize(1024, 1024).png().toFile(join(assetsDir, 'adaptive-icon.png'));
  await sharp(Buffer.from(svg)).resize(48, 48).png().toFile(join(assetsDir, 'favicon.png'));
  await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(join(assetsDir, 'splash-icon.png'));
  console.log('Icons generated successfully!');
}

main().catch(console.error);
