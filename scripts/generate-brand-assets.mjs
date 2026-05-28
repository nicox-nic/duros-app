/**
 * Generate favicons, PWA icons, and OG preview from Duros brand assets.
 * Run: node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const IVORY = { r: 250, g: 247, b: 242, alpha: 1 };
const iconSource = join(publicDir, 'duros-logo-icon-source.png');
const logoLockup = join(publicDir, 'duros-logo.png');

async function generateIcon(size, outName, padding = 0.12) {
  const inner = Math.round(size * (1 - padding * 2));
  const resized = await sharp(iconSource)
    .resize(inner, inner, { fit: 'contain', background: IVORY })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: IVORY,
    },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(join(publicDir, outName));

  console.log(`  ${outName} (${size}x${size})`);
}

async function generateFaviconIco() {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map(async (size) => {
      const inner = Math.round(size * 0.76);
      const resized = await sharp(iconSource)
        .resize(inner, inner, { fit: 'contain', background: IVORY })
        .toBuffer();
      return sharp({
        create: { width: size, height: size, channels: 4, background: IVORY },
      })
        .composite([{ input: resized, gravity: 'centre' }])
        .png()
        .toBuffer();
    })
  );

  // Minimal ICO: use 32px PNG as favicon.ico (widely supported)
  writeFileSync(join(publicDir, 'favicon.ico'), buffers[1]);
  console.log('  favicon.ico (32px PNG container)');
}

async function generateOgPreview() {
  const width = 1200;
  const height = 630;
  const bg = await sharp({
    create: { width, height, channels: 3, background: { r: 250, g: 247, b: 242 } },
  })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoLockup).metadata();
  const maxLogoH = 320;
  const logoW = Math.round((logoMeta.width / logoMeta.height) * maxLogoH);
  const logoBuf = await sharp(logoLockup)
    .resize(logoW, maxLogoH, { fit: 'inside' })
    .toBuffer();

  const logoLeft = Math.round((width - logoW) / 2);
  const logoTop = 80;

  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width / 2}" y="480" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="600" fill="#1f1d1a">Duros Property Concierge+</text>
      <text x="${width / 2}" y="530" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#8a8a92">Smarter property management</text>
    </svg>
  `;

  const textBuf = await sharp(Buffer.from(svgText)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: logoBuf, left: logoLeft, top: logoTop },
      { input: textBuf, left: 0, top: 0 },
    ])
    .png()
    .toFile(join(publicDir, 'og-preview.png'));

  console.log('  og-preview.png (1200x630)');
}

async function main() {
  console.log('Generating brand assets from', iconSource);
  await generateIcon(16, 'favicon-16x16.png', 0.1);
  await generateIcon(32, 'favicon-32x32.png', 0.1);
  await generateIcon(48, 'favicon-48x48.png', 0.1);
  await generateIcon(180, 'apple-touch-icon.png', 0.1);
  await generateIcon(192, 'android-chrome-192x192.png', 0.1);
  await generateIcon(512, 'android-chrome-512x512.png', 0.08);
  await generateFaviconIco();
  await generateOgPreview();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
