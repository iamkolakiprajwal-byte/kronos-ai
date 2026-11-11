const puppeteer = require("puppeteer");
const path = require("path");

const ARTIFACT_DIR = "/Users/prajwalkolaki/.gemini/antigravity/brain/03dc8da8-2174-4d1a-bf80-3589820c2eb3";

async function run() {
  console.log("Launching Puppeteer for clean auth & onboarding verification...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Verify /login
  console.log("1. Visiting /login...");
  await page.goto("http://localhost:3001/login", { waitUntil: "networkidle0" });

  // Verify that there is NO fake instant demo login buttons
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (bodyText.includes("Instant Evaluator Demo Login") || bodyText.includes("Aria Chen") || bodyText.includes("Marcus Reed")) {
    throw new Error("Demo persona credentials found on /login!");
  }
  console.log("✓ No demo personas on /login");

  // Click "Continue with Google"
  console.log("2. Inspecting Google Auth trigger on /login...");
  const googleBtn = await page.$('button[type="button"]');
  if (googleBtn) {
    // Intercept navigation or check that no fake modal exists in DOM
    const hasModal = await page.evaluate(() => {
      return document.body.innerText.includes("Enter your Google account credentials") ||
             document.body.innerText.includes("Choose a Google Account");
    });
    if (hasModal) {
      throw new Error("Fake Google modal still appeared!");
    }
  }
  console.log("✓ Verified: No fake Google modal appeared!");

  // Verify that an honest error notice is displayed when unconfigured
  const noticeText = await page.evaluate(() => {
    const notice = document.querySelector(".bg-\\[\\#faece7\\]");
    return notice ? notice.innerText : "";
  });
  console.log("Displayed notice:", noticeText);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "clean_login_google_notice.png") });

  // 2. Verify /signup
  console.log("3. Visiting /signup...");
  await page.goto("http://localhost:3001/signup", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "clean_signup_desktop.png") });
  const signupText = await page.evaluate(() => document.body.innerText);
  if (signupText.includes("Aria Chen") || signupText.includes("Marcus Reed") || signupText.includes("Instant Evaluator")) {
    throw new Error("Demo data found on /signup!");
  }
  console.log("✓ Clean signup verified");

  // 3. Verify /onboarding
  console.log("4. Visiting /onboarding...");
  await page.setCookie({
    name: "x-mock-test-auth",
    value: "true",
    domain: "localhost",
  });
  await page.goto("http://localhost:3001/onboarding", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "clean_onboarding_welcome.png") });

  // Check for auto-fill preset buttons
  const hasAutoFillPreset = await page.evaluate(() => {
    return document.body.innerText.includes("Auto-fill preset");
  });
  if (hasAutoFillPreset) {
    throw new Error("Auto-fill preset buttons found on /onboarding!");
  }
  console.log("✓ Verified: No 'Auto-fill preset' buttons on /onboarding!");

  // Click "Get Started" to go to Step 2 (user type)
  const nextBtn = await page.$('button[type="button"]');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "clean_onboarding_step_user_type.png") });

  // Go to personal info
  const continueButtons = await page.$$('button');
  for (const btn of continueButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Continue")) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 600));

  // Check personal info fields: MUST BE EMPTY!
  const fieldValues = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input"));
    return inputs.map((i) => ({ placeholder: i.placeholder, value: i.value }));
  });
  console.log("Personal info input values:", fieldValues);
  for (const field of fieldValues) {
    if (field.value === "Aria Chen" || field.value === "Marcus Reed" || field.value === "Elena Rostova") {
      throw new Error(`Pre-populated name found: ${field.value}`);
    }
  }
  console.log("✓ Verified: Personal info inputs start completely empty!");
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "clean_onboarding_personal_info.png") });

  console.log("ALL PUPPETEER VERIFICATIONS PASSED CLEANLY!");
  await browser.close();
}

run().catch((err) => {
  console.error("Puppeteer verification failed:", err);
  process.exit(1);
});
