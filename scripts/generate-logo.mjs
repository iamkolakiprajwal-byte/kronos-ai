import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const ARTIFACTS_DIR = "/Users/prajwalkolaki/.gemini/antigravity/brain/03dc8da8-2174-4d1a-bf80-3589820c2eb3";
const PUBLIC_DIR = "/Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/public";

function getSvg(size) {
  // Scale everything relative to size (120 or 512)
  const scale = size / 120;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#24211d" />
          <stop offset="100%" stop-color="#151412" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#faebd2" />
          <stop offset="50%" stop-color="#d4af65" />
          <stop offset="100%" stop-color="#a47d34" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4af65" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#544322" stop-opacity="0.3" />
        </linearGradient>
      </defs>

      <!-- Squircle Background with Soft Shadow -->
      <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#bgGrad)" stroke="#38342e" stroke-width="1.5" />

      <!-- Outer Chronometer Ring -->
      <circle cx="60" cy="60" r="44" fill="none" stroke="url(#ringGrad)" stroke-width="2" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#d4af65" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="3,3" />

      <!-- Dial Cardinal Ticks -->
      <line x1="60" y1="18" x2="60" y2="24" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />
      <line x1="60" y1="96" x2="60" y2="102" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />
      <line x1="18" y1="60" x2="24" y2="60" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />
      <line x1="96" y1="60" x2="102" y2="60" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />

      <!-- Hour Markers (30 deg ticks) -->
      <circle cx="82" cy="22" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="98" cy="38" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="98" cy="82" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="82" cy="98" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="38" cy="98" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="22" cy="82" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="22" cy="38" r="1.5" fill="#d4af65" opacity="0.7" />
      <circle cx="38" cy="22" r="1.5" fill="#d4af65" opacity="0.7" />

      <!-- Orbital Planetary Arc (Adaptive Intelligence) -->
      <path d="M 32 40 A 38 38 0 0 1 88 40" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="2,4" opacity="0.6" />

      <!-- Clock Hands pointing to 10:10 (Classic Timepiece Stance) -->
      <!-- Hour Hand (pointing toward ~10 o'clock) -->
      <line x1="60" y1="60" x2="42" y2="40" stroke="url(#goldGrad)" stroke-width="3.5" stroke-linecap="round" />
      <!-- Minute Hand (pointing toward ~2 o'clock) -->
      <line x1="60" y1="60" x2="79" y2="36" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />

      <!-- Subtle Flow Arc (Infinity / Organic Time Flow) -->
      <path d="M 44 76 Q 60 84 76 76" fill="none" stroke="#d4af65" stroke-width="2" stroke-linecap="round" opacity="0.8" />

      <!-- Center Jewel Pivot Pin -->
      <circle cx="60" cy="60" r="4.5" fill="#151412" stroke="url(#goldGrad)" stroke-width="2" />
      <circle cx="60" cy="60" r="1.5" fill="#faebd2" />
    </svg>
  `;
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // 1. Generate 120x120 exact size for Google OAuth Consent Screen
    const svg120 = getSvg(120);
    await page.setViewport({ width: 120, height: 120, deviceScaleFactor: 1 });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${svg120}</body></html>`);
    const path120Pub = path.join(PUBLIC_DIR, "kronos-logo-120.png");
    const path120Art = path.join(ARTIFACTS_DIR, "kronos-logo-120.png");
    await page.screenshot({ path: path120Pub, omitBackground: true });
    fs.copyFileSync(path120Pub, path120Art);
    console.log("Saved 120x120 logo:", path120Pub);

    // 2. Generate 512x512 high-res for standard app icons / store assets
    const svg512 = getSvg(512);
    await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${svg512}</body></html>`);
    const path512Pub = path.join(PUBLIC_DIR, "kronos-logo-512.png");
    const path512Art = path.join(ARTIFACTS_DIR, "kronos-logo-512.png");
    await page.screenshot({ path: path512Pub, omitBackground: true });
    fs.copyFileSync(path512Pub, path512Art);
    console.log("Saved 512x512 logo:", path512Pub);
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
