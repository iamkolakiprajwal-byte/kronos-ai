const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const VIEWPORTS = [
  { name: "mobile_320", width: 320, height: 650 },
  { name: "mobile_375", width: 375, height: 812 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1440", width: 1440, height: 900 },
];

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(__dirname, "../screenshots");
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Puppeteer verification...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Test 1: Login page
  console.log("Testing /login...");
  await page.setViewport(VIEWPORTS[3]); // desktop
  await page.goto("http://localhost:3001/login", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_login_desktop.png") });

  // Test 2: Forgot Password page
  console.log("Testing /forgot-password...");
  await page.goto("http://localhost:3001/forgot-password", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_forgot_password.png") });

  // Test 3: Reset Password page
  console.log("Testing /reset-password...");
  await page.goto("http://localhost:3001/reset-password", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_reset_password.png") });

  // Test 4: Mobile Login Viewport
  console.log("Testing /login mobile 375px...");
  await page.setViewport(VIEWPORTS[1]);
  await page.goto("http://localhost:3001/login", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_login_mobile_375.png") });

  // Test 5: Verify invalid credentials cannot log in
  console.log("Testing invalid credentials rejection on /login...");
  await page.type('input[type="email"]', "unregistered_user@example.com");
  await page.type('input[type="password"]', "WrongPassword123!");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1200));

  // Confirm error is shown and still on /login
  const currentPath = await page.evaluate(() => window.location.pathname);
  if (currentPath !== "/login") {
    throw new Error("Security failure: Invalid credentials bypassed login page!");
  }
  console.log("✓ Correctly rejected invalid credentials and remained on /login.");

  // Test 6: Authenticated dashboard access via mock test session in dev mode
  console.log("Setting dev test session and checking /home...");
  await page.setCookie({
    name: "x-mock-test-auth",
    value: "true",
    domain: "localhost",
  });
  await page.goto("http://localhost:3001/home", { waitUntil: "networkidle0" });

  // Verify /home desktop
  await page.setViewport(VIEWPORTS[3]);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_home_desktop.png") });

  // Verify /home mobile 375px
  await page.setViewport(VIEWPORTS[1]);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_home_mobile_375.png") });

  // Verify /ai page
  console.log("Checking /ai page...");
  await page.goto("http://localhost:3001/ai", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_ai_desktop.png") });

  // Verify /growth page
  console.log("Checking /growth page...");
  await page.goto("http://localhost:3001/growth", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "production_growth_desktop.png") });

  console.log("All screenshots captured successfully!");
  await browser.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
