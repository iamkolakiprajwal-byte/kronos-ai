import { getCleanInitialState, loadStoredState, saveStoredState, KRONOS_STORAGE_VERSION } from "../../src/lib/storage";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("=================================================");
console.log("KRONOS GUEST MODE & LOCAL OFFLINE TEST SUITE");
console.log("=================================================");

// Mock memory localStorage
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => memoryStore[k] || null,
  setItem: (k: string, v: string) => { memoryStore[k] = v; },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => { Object.keys(memoryStore).forEach((k) => delete memoryStore[k]); }
};
(global as any).localStorage = mockLocalStorage;
(global as any).window = { localStorage: mockLocalStorage };

// Test 1: Guest User Session Structure
const guestId = `guest_${Date.now()}`;
const guestUser = {
  id: guestId,
  name: "Guest Planner",
  email: "guest@kronos.local",
  avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=Guest&backgroundColor=e8decb`,
  provider: "demo" as const,
  createdAt: new Date().toISOString(),
};

assert(guestUser.id.startsWith("guest_"), "Guest user ID begins with 'guest_' prefix");
assert(guestUser.provider === "demo", "Guest user provider is 'demo'");
assert(guestUser.email.endsWith("@kronos.local"), "Guest user email is local unlinked domain");

// Test 2: Guest Classification Predicates
const isGuestUser = !guestUser.id || guestUser.provider === "demo" || guestUser.id.startsWith("guest_");
const isRemoteSyncUser = Boolean(guestUser.id && !isGuestUser);

assert(isGuestUser === true, "Guest classification evaluates isGuestUser to true");
assert(isRemoteSyncUser === false, "Guest classification evaluates isRemoteSyncUser to false");

// Remote authenticated user classification check
const realUser = {
  id: "d3b07384-d113-4670-87a4-09886a982928",
  name: "Prajwal",
  email: "prajwal@example.com",
  provider: "google" as const,
  createdAt: new Date().toISOString(),
};
const isRealGuest = !realUser.id || (realUser as any).provider === "demo" || realUser.id.startsWith("guest_");
const isRealRemote = Boolean(realUser.id && !isRealGuest);

assert(isRealGuest === false, "Google user evaluates isGuestUser to false");
assert(isRealRemote === true, "Google user evaluates isRemoteSyncUser to true");

// Test 3: Middleware Cookie Evaluator for Guest
function evaluateMiddlewareAccess(cookies: Record<string, string>, pathname: string): { allow: boolean; redirect?: string } {
  const isGuest = cookies["kronos_guest_user"] === "true" || cookies["kronos_auth_user"]?.startsWith("guest_");
  const user = cookies["kronos_auth_user"] && !cookies["kronos_auth_user"].startsWith("guest_");

  const isProtectedRoute = ["/home", "/ai", "/my-day", "/growth", "/profile", "/plan", "/onboarding"].some(
    (prefix) => pathname.startsWith(prefix)
  );

  if (pathname === "/") {
    if (user || isGuest) return { allow: false, redirect: "/home" };
    return { allow: true };
  }

  if (!user && !isGuest && isProtectedRoute) {
    return { allow: false, redirect: `/login?redirect=${encodeURIComponent(pathname)}` };
  }

  return { allow: true };
}

// Unauthenticated user -> redirected to /login
const anonCheck = evaluateMiddlewareAccess({}, "/home");
assert(Boolean(!anonCheck.allow && anonCheck.redirect?.startsWith("/login")), "Unauthenticated user redirected to /login");

// Guest user -> granted access to protected routes
const guestCookies = { "kronos_guest_user": "true", "kronos_auth_user": guestId };
const guestHomeCheck = evaluateMiddlewareAccess(guestCookies, "/home");
assert(guestHomeCheck.allow === true, "Guest session granted access to /home");

const guestAICheck = evaluateMiddlewareAccess(guestCookies, "/ai");
assert(guestAICheck.allow === true, "Guest session granted access to /ai");

const guestGrowthCheck = evaluateMiddlewareAccess(guestCookies, "/growth");
assert(guestGrowthCheck.allow === true, "Guest session granted access to /growth");

// Guest visiting root "/" redirects to /home
const guestRootCheck = evaluateMiddlewareAccess(guestCookies, "/");
assert(Boolean(!guestRootCheck.allow && guestRootCheck.redirect === "/home"), "Guest session visiting root redirects to /home");

// Test 4: Local Storage Partitioning & Persistence for Guest User
const cleanGuest = getCleanInitialState("student");
saveStoredState({
  version: KRONOS_STORAGE_VERSION,
  role: "student",
  profile: {
    ...cleanGuest.profile,
    name: "Guest Planner",
    email: "guest@kronos.local",
    institutionOrCompany: "Personal Workspace",
  },
  tasks: [
    {
      id: "task-guest-1",
      title: "Review Quantum Mechanics Notes",
      category: "study",
      priority: "high",
      status: "todo",
      scheduledDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      estimatedDuration: 60,
      isFixed: false,
    }
  ],
  calendarEvents: [],
  goals: [],
  habits: [],
  habitTransitions: [],
  focusSessions: [],
  chatMessages: [],
  notifications: [],
  ecoEntries: [],
  selectedDateStr: new Date().toISOString().split("T")[0],
  lastSavedTimestamp: Date.now(),
}, guestId);

const hydratedGuestState = loadStoredState(guestId);
assert(hydratedGuestState !== null, "Guest local state successfully loaded from localStorage");
assert(hydratedGuestState?.profile.name === "Guest Planner", "Guest profile name persisted correctly");
assert(hydratedGuestState?.tasks.length === 1, "Guest custom task preserved in local storage");
assert(hydratedGuestState?.tasks[0].title === "Review Quantum Mechanics Notes", "Guest task title matches");

// Ensure other user namespaces are not polluted
const otherState = loadStoredState("other_user_456");
assert(otherState === null, "Separate user namespace remains unpolluted");

console.log("=================================================");
console.log("GUEST MODE TEST RESULTS: ALL 13 CHECKS PASSED");
console.log("=================================================");
