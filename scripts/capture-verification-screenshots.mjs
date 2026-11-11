import puppeteer from "puppeteer";
import path from "node:path";

const ARTIFACTS_DIR = "/Users/prajwalkolaki/.gemini/antigravity/brain/03dc8da8-2174-4d1a-bf80-3589820c2eb3";

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setCookie({
      name: "x-mock-test-auth",
      value: "true",
      domain: "localhost",
      path: "/",
    });

    // 1. Desktop AI page
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3001/ai", { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "desktop_ai_clean.png"), fullPage: false });
    console.log("Captured desktop_ai_clean.png");

    // 2. Mobile AI page
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3001/ai", { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "mobile_ai_clean.png"), fullPage: false });
    console.log("Captured mobile_ai_clean.png");

    // 3. Desktop Calendar Modal
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3001/home", { waitUntil: "networkidle2" });
    await page.click('button[aria-label="Google Calendar Integration Status"]');
    await page.waitForSelector('div[role="dialog"]', { timeout: 2000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "desktop_calendar_modal.png"), fullPage: false });
    console.log("Captured desktop_calendar_modal.png");
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
