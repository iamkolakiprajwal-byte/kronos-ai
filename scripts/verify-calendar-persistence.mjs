import puppeteer from "puppeteer";

async function run() {
  console.log("==================================================");
  console.log("VERIFYING GOOGLE CALENDAR AUTHORIZATION PERSISTENCE");
  console.log("==================================================");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Set dev test auth cookie to access protected routes
    await page.setCookie({
      name: "x-mock-test-auth",
      value: "true",
      domain: "localhost",
      path: "/",
    });

    // 1. Check GET /api/calendar/sync endpoint
    console.log("1. Testing GET /api/calendar/sync endpoint...");
    const apiRes = await page.goto("http://localhost:3001/api/calendar/sync");
    const json = await apiRes.json();
    console.log("   API Response:", json);
    if (json.connected !== undefined && json.syncStatus !== undefined) {
      console.log("   ✓ GET /api/calendar/sync returned valid structured connection schema");
    } else {
      throw new Error("Invalid response from GET /api/calendar/sync: " + JSON.stringify(json));
    }

    // 2. Test initial page load with simulated cached connection
    console.log("\n2. Testing persistent status on /home with cached connection...");
    await page.goto("http://localhost:3001/home", { waitUntil: "domcontentloaded" });

    // Prime localStorage with synced status
    await page.evaluate(() => {
      localStorage.setItem("kronos_cached_sync_status", "synced");
      localStorage.setItem("kronos_welcome_dismissed_v1", "true");
    });

    // Reload page to test cold hydration persistence
    await page.reload({ waitUntil: "networkidle2" });

    // Check header text
    const headerPillText = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Google Calendar Integration Status"]');
      return btn ? btn.textContent.trim() : null;
    });

    console.log("   Header calendar status pill text:", headerPillText);
    if (!headerPillText || !headerPillText.includes("Synced")) {
      throw new Error(`Expected 'Google Calendar: Synced' but got '${headerPillText}'`);
    }
    console.log("   ✓ Cold reload preserves 'Google Calendar: Synced' without prompting for OAuth!");

    // 3. Test navigation between all core routes to ensure no unsolicited OAuth prompts
    console.log("\n3. Testing route transitions across /my-day, /growth, /profile, /ai...");
    const routes = ["/my-day", "/growth", "/profile", "/ai"];
    for (const r of routes) {
      await page.goto(`http://localhost:3001${r}`, { waitUntil: "networkidle2" });
      const currentUrl = page.url();
      if (currentUrl.includes("accounts.google.com")) {
        throw new Error(`Unsolicited redirect to Google OAuth on ${r}! URL: ${currentUrl}`);
      }
      console.log(`   ✓ Navigated to ${r} safely: no unauthorized OAuth redirect.`);
    }

    // 4. Test Profile Page Calendar Card State
    console.log("\n4. Checking Profile page Google Calendar integration card...");
    await page.goto("http://localhost:3001/profile", { waitUntil: "networkidle2" });
    const profileCalText = await page.evaluate(() => {
      const allText = document.body.innerText;
      return allText.includes("Google Calendar Integration") &&
        (allText.includes("Live Connected") || allText.includes("Your Google account is linked"));
    });
    console.log("   Profile card shows Google Account Linked:", profileCalText);
    if (!profileCalText) {
      throw new Error("Profile card did not reflect active Google integration state");
    }

    // 5. Verify modal interaction: clicking calendar pill opens modal without triggering OAuth navigation
    console.log("\n5. Testing calendar modal interaction...");
    await page.click('button[aria-label="Google Calendar Integration Status"]');
    await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
    const modalContent = await page.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      return dialog ? dialog.innerText : "";
    });
    if (!modalContent.includes("Google Calendar Two-Way Integration")) {
      throw new Error("Calendar modal did not render expected title");
    }
    console.log("   ✓ Calendar modal opened cleanly without navigating away from page.");

    console.log("\n==================================================");
    console.log("CALENDAR PERSISTENCE ACCEPTANCE CRITERIA VERIFIED!");
    console.log("==================================================");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
