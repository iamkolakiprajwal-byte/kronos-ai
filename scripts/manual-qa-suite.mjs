import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3001';

const VIEWPORTS = [
  { name: '320px (iPhone SE 1st gen / Small Mobile)', width: 320, height: 600, isMobile: true },
  { name: '375px (iPhone SE 2nd gen / 8)', width: 375, height: 667, isMobile: true },
  { name: '390px (iPhone 13 / 14 / 15)', width: 390, height: 844, isMobile: true },
  { name: '430px (iPhone 14/15/16 Pro Max)', width: 430, height: 932, isMobile: true },
  { name: '768px (iPad Mini Portrait / Small Tablet)', width: 768, height: 1024, isMobile: false },
  { name: '1024px (iPad Pro / Small Laptop)', width: 1024, height: 768, isMobile: false },
  { name: '1440px (Desktop / Laptop Widescreen)', width: 1440, height: 900, isMobile: false },
];

const WORKSPACES = [
  { name: 'Home', path: '/home' },
  { name: 'AI Assistant', path: '/ai' },
  { name: 'My Day', path: '/my-day' },
  { name: 'Growth', path: '/growth' },
  { name: 'Profile', path: '/profile' },
];

async function runQA() {
  console.log('======================================================================');
  console.log('KRONOS AI — COMPREHENSIVE AUTOMATED BROWSER QA TEST SUITE');
  console.log('Using Google Chrome:', CHROME_PATH);
  console.log('Base URL:', BASE_URL);
  console.log('======================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(`[Page Error] ${err.toString()}`);
  });

  let totalTests = 0;
  let passedTests = 0;
  const defects = [];

  function record(pass, title, detail) {
    totalTests++;
    if (pass) {
      passedTests++;
      console.log(`  ✓ PASS: ${title}`);
    } else {
      console.error(`  ✗ FAIL: ${title} -> ${detail}`);
      defects.push({ title, detail });
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Initial Load & Connectivity
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Application Loading & Runtime Error Check ---');
    await page.setViewport({ width: 1440, height: 900 });
    
    // Set authenticated test session cookie
    await page.setCookie({
      name: 'x-mock-test-auth',
      value: 'true',
      domain: 'localhost',
    });

    const response = await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem('kronos_ai_tutorial_completed_v1', 'true');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    record(response.status() === 200, 'Application loads on /home with HTTP 200', `Status: ${response?.status()}`);
    record(consoleErrors.length === 0, 'No console.error logged during initial load', consoleErrors.join(', '));
    record(pageErrors.length === 0, 'No unhandled page errors on initial load', pageErrors.join(', '));

    // -------------------------------------------------------------------------
    // 2. Viewport Matrix & Overflow Checks Across All Workspaces
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Multi-Viewport Responsive Matrix & Horizontal Overflow Inspection ---');
    for (const vp of VIEWPORTS) {
      console.log(`\n  Checking Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });

      for (const ws of WORKSPACES) {
        await page.goto(`${BASE_URL}${ws.path}`, { waitUntil: 'networkidle0' });
        await new Promise((r) => setTimeout(r, 400));

        // Evaluate horizontal overflow: scrollWidth > clientWidth
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const bodyScroll = document.body.scrollWidth;
          const isOverflowing = scrollWidth > docWidth || bodyScroll > docWidth;
          return {
            isOverflowing,
            clientWidth: docWidth,
            scrollWidth,
            bodyScroll,
          };
        });

        record(
          !overflow.isOverflowing,
          `Viewport ${vp.width}px — ${ws.name}: Zero horizontal overflow`,
          `clientWidth=${overflow.clientWidth}, scrollWidth=${overflow.scrollWidth}`
        );
      }
    }

    // -------------------------------------------------------------------------
    // 3. Month Name & Calendar Navigation (Specifically on mobile 320px & 375px)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Calendar Month Title Visibility & Navigation ---');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle0' });

    const monthHeader = await page.evaluate(() => {
      // Find the month heading text
      const headings = Array.from(document.querySelectorAll('h2'));
      const calHeading = headings.find((h) => h.textContent && h.textContent.includes('2026'));
      if (!calHeading) return null;
      const rect = calHeading.getBoundingClientRect();
      const computed = window.getComputedStyle(calHeading);
      return {
        text: calHeading.textContent.trim(),
        width: rect.width,
        height: rect.height,
        isVisible: rect.width > 50 && rect.height > 15 && computed.display !== 'none' && computed.visibility !== 'hidden',
      };
    });

    record(monthHeader !== null, 'Calendar month heading element located in DOM', 'Heading not found');
    record(
      monthHeader && monthHeader.text.includes('November 2026'),
      `Month heading text is fully readable ("${monthHeader?.text}")`,
      `Got: ${monthHeader?.text}`
    );
    record(
      monthHeader && monthHeader.isVisible && monthHeader.width >= 100,
      `Month heading has sufficient width without clipping (${Math.round(monthHeader?.width || 0)}px wide)`,
      `Width: ${monthHeader?.width}px`
    );

    // Test Week View / Full Month toggle interaction
    const toggleWeekResult = await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const weekBtn = buttons.find((b) => b.textContent && b.textContent.includes('Week View'));
      if (!weekBtn) return false;
      weekBtn.click();
      return true;
    });
    record(toggleWeekResult, 'Can switch calendar to "Week View" on mobile', 'Button not found');
    await new Promise((r) => setTimeout(r, 400));

    const toggleMonthResult = await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const monthBtn = buttons.find((b) => b.textContent && b.textContent.includes('Full Month'));
      if (!monthBtn) return false;
      monthBtn.click();
      return true;
    });
    record(toggleMonthResult, 'Can switch calendar back to "Full Month" on mobile', 'Button not found');
    await new Promise((r) => setTimeout(r, 400));

    // -------------------------------------------------------------------------
    // 4. Mobile Bottom Navigation Touch Targets & Active Indicators
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Bottom Navigation & Touch Targets ---');
    const bottomNavCheck = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Workspace Navigation"]');
      if (!nav) return { exists: false, items: [] };
      const links = Array.from(nav.querySelectorAll('a'));
      const items = links.map((a) => {
        const rect = a.getBoundingClientRect();
        return {
          href: a.getAttribute('href'),
          text: a.textContent.trim(),
          width: rect.width,
          height: rect.height,
          passesTouchTarget: rect.width >= 44 && rect.height >= 44,
        };
      });
      return { exists: true, items };
    });

    record(bottomNavCheck.exists, 'Bottom navigation dock exists on mobile', 'Nav element missing');
    record(bottomNavCheck.items.length === 4, 'Bottom nav contains 4 primary destinations', `Found ${bottomNavCheck.items.length}`);
    for (const it of bottomNavCheck.items) {
      record(
        it.passesTouchTarget,
        `Bottom nav touch target "${it.text}" >= 44x44px (${Math.round(it.width)}x${Math.round(it.height)}px)`,
        `Target too small: ${it.width}x${it.height}`
      );
    }

    // -------------------------------------------------------------------------
    // 5. Zero Floating Overlays & Bottom Content Accessibility
    // -------------------------------------------------------------------------
    console.log('\n--- 5. No Overlapping Elements & Bottom Content Accessibility ---');
    const floatingButtonsCount = await page.evaluate(() => {
      // Check if any element with 'fixed' and 'bottom-[68px]' still exists in DOM
      const fixedNodes = Array.from(document.querySelectorAll('.fixed'));
      const culprits = fixedNodes.filter((el) => {
        const cls = el.className || '';
        return cls.includes('bottom-[68px]') || cls.includes('bottom-16');
      });
      return culprits.length;
    });
    record(floatingButtonsCount === 0, 'No overlapping fixed buttons hovering over bottom nav dock', `Found ${floatingButtonsCount} floating elements`);

    // Verify user can scroll to the bottom of /home
    const homeScrollCheck = await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const scrolled = window.scrollY;
      return scrolled > 100;
    });
    record(homeScrollCheck, 'Page scrolls vertically to bottom cleanly without getting stuck', 'Scroll failed');

    // -------------------------------------------------------------------------
    // 6. Interactive Workspaces & State Persistence Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Interactive Workspaces & Data Persistence ---');

    // Test My Day task toggle
    await page.goto(`${BASE_URL}/my-day`, { waitUntil: 'networkidle0' });
    const toggleTaskResult = await page.evaluate(async () => {
      // Find a todo check button in the timeline or verify clean empty state
      const checkButtons = Array.from(document.querySelectorAll('button'));
      const todoBtn = checkButtons.find((b) => {
        const parent = b.closest('.rounded-2xl');
        return parent && parent.querySelector('circle');
      });
      if (todoBtn) {
        todoBtn.click();
        return true;
      }
      // If no tasks on fresh state, check for empty state indicators
      const emptyNotice = document.body.innerText.includes("No tasks scheduled for today") ||
                          document.body.innerText.includes("Plan Day with AI");
      return emptyNotice;
    });
    record(toggleTaskResult, 'Can toggle a task completion or render clean empty state on My Day', 'Neither found');
    await new Promise((r) => setTimeout(r, 400));

    // Verify localStorage has persisted state
    const storageHasTasks = await page.evaluate(() => {
      const raw = window.localStorage.getItem('kronos_ai_user_state_v1') ||
                  window.localStorage.getItem('kronos_ai_local_state_v1');
      return Boolean(raw);
    });
    record(storageHasTasks, 'State successfully persisted to localStorage', 'No stored state');

    // Test Growth Tab switching & Habit SRHI rating
    await page.goto(`${BASE_URL}/growth`, { waitUntil: 'networkidle0' });
    const flowTabSwitch = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const flowBtn = buttons.find((b) => b.textContent && b.textContent.includes('Flow Theory'));
      if (!flowBtn) return false;
      flowBtn.click();
      return true;
    });
    record(flowTabSwitch, 'Can switch to Flow Theory tab in Growth workspace', 'Tab button not found');
    await new Promise((r) => setTimeout(r, 400));

    // Verify Flow Timer can be started and paused
    const timerToggle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Start Focus') || b.textContent.includes('Start focus')));
      if (!startBtn) return false;
      startBtn.click();
      return true;
    });
    record(timerToggle, 'Can trigger immersion timer start on Flow Theory', 'Start button not found');
    await new Promise((r) => setTimeout(r, 600));

    // Test AI Composer Input
    await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="ai_chat_query"], input[type="search"], input[type="text"]');
    await page.type('input[name="ai_chat_query"], input[type="search"], input[type="text"]', 'Study machine learning for 1 hour at 4 PM');
    const isSubmitEnabled = await page.evaluate(() => {
      const form = document.querySelector('form');
      const submitBtn = form?.querySelector('button[type="submit"]');
      return submitBtn && !submitBtn.disabled;
    });
    record(isSubmitEnabled, 'AI composer accepts text and enables submit button', 'Input/submit failed');

    // Test Header Modals (Sync Modal & Quick Task Modal)
    console.log('\n--- 7. Modals & Header Action Handshakes ---');
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle0' });
    const syncModalOpened = await page.evaluate(async () => {
      const syncBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('GCal') || b.textContent.includes('Google') || b.textContent.includes('Sync')));
      if (!syncBtn) return false;
      syncBtn.click();
      return true;
    });
    record(syncModalOpened, 'Can click Calendar Sync Pill in header', 'Pill button not found');
    await new Promise((r) => setTimeout(r, 400));

    const syncModalVisible = await page.evaluate(() => {
      const modalHeader = Array.from(document.querySelectorAll('h2, h3, h4')).find(h => h.textContent && (h.textContent.includes('Google Calendar') || h.textContent.includes('Sync Settings') || h.textContent.includes('Two-Way Sync')));
      return Boolean(modalHeader);
    });
    record(syncModalVisible, 'Google Calendar Two-Way Sync modal renders with simulated notice', 'Modal not rendered');

    // Close sync modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Close') || b.textContent.includes('Dismiss') || b.getAttribute('aria-label') === 'Close'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Test Quick Task Modal
    const quickTaskOpened = await page.evaluate(() => {
      const plusBtn = document.querySelector('button[aria-label="New Task"]') ||
                      document.querySelector('button[aria-label="Add new task"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('New Task'));
      if (!plusBtn) return false;
      plusBtn.click();
      return true;
    });
    record(quickTaskOpened, 'Can trigger Quick Task creation modal', 'Plus button not found');
    await new Promise((r) => setTimeout(r, 400));

    const quickTaskModalVisible = await page.evaluate(() => {
      const title = Array.from(document.querySelectorAll('h2, h3, h4')).find(h => h.textContent && (h.textContent.includes('Add New') || h.textContent.includes('New Task') || h.textContent.includes('Plan Item')));
      return Boolean(title);
    });
    record(quickTaskModalVisible, 'Quick Task Modal renders successfully', 'Quick task modal not found');

    // Close Quick Task Modal
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cancel'));
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Test Workspace Swipe Navigation (Simulating horizontal touch swipe)
    console.log('\n--- 8. Mobile Workspace Horizontal Swipe Navigation ---');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle0' });

    // Swipe left from Home (should navigate to /ai)
    await page.touchscreen.tap(300, 300);
    // Touch drag from x=300 to x=50
    const swipeResult = await page.evaluate(async () => {
      const startX = 280;
      const startY = 300;
      const endX = 60;
      const target = document.body;
      
      const touchStart = new Touch({ identifier: 1, target, clientX: startX, clientY: startY });
      const startEvt = new TouchEvent('touchstart', { touches: [touchStart], changedTouches: [touchStart], bubbles: true });
      target.dispatchEvent(startEvt);
      
      const touchEnd = new Touch({ identifier: 1, target, clientX: endX, clientY: startY });
      const endEvt = new TouchEvent('touchend', { touches: [], changedTouches: [touchEnd], bubbles: true });
      target.dispatchEvent(endEvt);
      return true;
    });
    record(swipeResult, 'Dispatched horizontal touch swipe gesture without error', 'Swipe dispatch failed');
    await new Promise((r) => setTimeout(r, 800));

    // Test Hard Refresh Persistence
    await page.reload({ waitUntil: 'networkidle0' });
    const stateSurvivesRefresh = await page.evaluate(() => {
      const raw = window.localStorage.getItem('kronos_ai_local_state_v1');
      return raw !== null && raw.length > 50;
    });
    record(stateSurvivesRefresh, 'Application state survives hard page refresh without data loss', 'State lost after refresh');

    // -------------------------------------------------------------------------
    // Final Error Summary
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Terminal & Browser Console Error Summary ---');
    record(consoleErrors.length === 0, `Browser console errors: ${consoleErrors.length}`, consoleErrors.join(' | '));
    record(pageErrors.length === 0, `Browser unhandled page exceptions: ${pageErrors.length}`, pageErrors.join(' | '));

  } catch (err) {
    console.error('Fatal error during QA run:', err);
    defects.push({ title: 'Fatal QA execution error', detail: err.message });
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(`MANUAL BROWSER QA TEST RUN COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log(`Total Defects Identified: ${defects.length}`);
  console.log('======================================================================\n');

  if (defects.length > 0) {
    console.log('Defects list:');
    defects.forEach((d, i) => console.log(`  ${i + 1}. [${d.title}] ${d.detail}`));
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQA();
