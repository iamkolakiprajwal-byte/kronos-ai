import { cleanOnboardingInitialData } from "../../src/lib/onboarding/defaults";
import { getCleanInitialState, cleanDefaultProfile } from "../../src/lib/storage";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("=================================================");
console.log("KRONOS CLEAN AUTH & ONBOARDING DATA TEST SUITE");
console.log("=================================================");

// Test 1: Clean Onboarding Initial Data must be completely empty of demo data
assert(cleanOnboardingInitialData.name === "", "Initial onboarding name is empty string");
assert(cleanOnboardingInitialData.email === "", "Initial onboarding email is empty string");
assert(cleanOnboardingInitialData.headline === "", "Initial onboarding headline is empty string");
assert(cleanOnboardingInitialData.institutionOrCompany === "", "Initial onboarding institution/company is empty string");
assert(cleanOnboardingInitialData.course === "", "Initial onboarding course is empty string");
assert(cleanOnboardingInitialData.semester === "", "Initial onboarding semester is empty string");
assert(Array.isArray(cleanOnboardingInitialData.subjects) && cleanOnboardingInitialData.subjects.length === 0, "Initial onboarding subjects array is empty");
assert(Array.isArray(cleanOnboardingInitialData.timetable) && cleanOnboardingInitialData.timetable.length === 0, "Initial onboarding timetable array is empty");
assert(cleanOnboardingInitialData.jobRole === "", "Initial onboarding jobRole is empty string");
assert(cleanOnboardingInitialData.company === "", "Initial onboarding company is empty string");
assert(Array.isArray(cleanOnboardingInitialData.recurringMeetings) && cleanOnboardingInitialData.recurringMeetings.length === 0, "Initial onboarding recurringMeetings is empty");
assert(cleanOnboardingInitialData.shortTermGoal === "", "Initial short term goal is empty string");
assert(cleanOnboardingInitialData.longTermGoal === "", "Initial long term goal is empty string");
assert(Array.isArray(cleanOnboardingInitialData.existingHabits) && cleanOnboardingInitialData.existingHabits.length === 0, "Initial existing habits is empty");
assert(Array.isArray(cleanOnboardingInitialData.desiredHabits) && cleanOnboardingInitialData.desiredHabits.length === 0, "Initial desired habits is empty");

// Test 2: Clean Storage Initial State must be completely empty of seeded tasks & habits
const studentClean = getCleanInitialState("student");
assert(studentClean.tasks.length === 0, "Clean student state has zero tasks");
assert(studentClean.calendarEvents.length === 0, "Clean student state has zero calendar events");
assert(studentClean.goals.length === 0, "Clean student state has zero goals");
assert(studentClean.habits.length === 0, "Clean student state has zero habits");
assert(studentClean.focusSessions.length === 0, "Clean student state has zero focus sessions");
assert(studentClean.profile.name === "", "Clean student profile has empty name");

const proClean = getCleanInitialState("professional");
assert(proClean.tasks.length === 0, "Clean professional state has zero tasks");
assert(proClean.calendarEvents.length === 0, "Clean professional state has zero calendar events");
assert(proClean.goals.length === 0, "Clean professional state has zero goals");
assert(proClean.habits.length === 0, "Clean professional state has zero habits");

const dualClean = getCleanInitialState("both");
assert(dualClean.tasks.length === 0, "Clean dual state has zero tasks");
assert(dualClean.calendarEvents.length === 0, "Clean dual state has zero calendar events");

// Test 3: Zero Demo Personas in Welcome Message
assert(!studentClean.chatMessages[0].text.includes("Aria"), "Clean welcome message does not mention Aria");
assert(!studentClean.chatMessages[0].text.includes("Stanford"), "Clean welcome message does not mention Stanford");
assert(!proClean.chatMessages[0].text.includes("Marcus"), "Clean welcome message does not mention Marcus");
assert(!dualClean.chatMessages[0].text.includes("Elena"), "Clean welcome message does not mention Elena");
assert(!dualClean.chatMessages[0].text.includes("Synthetix"), "Clean welcome message does not mention Synthetix");

// Test 4: Supabase Secret Key Detection Guardrails
import { isSupabaseSecretKey } from "../../src/lib/supabase/client";
import { formatAuthError } from "../../src/context/auth-context";

const dummySecretRoleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64") + ".sig";
const dummyAnonRoleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + Buffer.from(JSON.stringify({ role: "anon" })).toString("base64") + ".sig";

assert(isSupabaseSecretKey(dummySecretRoleJwt) === true, "Detects service_role JWT as secret key");
assert(isSupabaseSecretKey("sb_secret_123456789") === true, "Detects sb_secret_ prefix as secret key");
assert(isSupabaseSecretKey(dummyAnonRoleJwt) === false, "Recognizes anon JWT as safe public key");
assert(isSupabaseSecretKey("sb_publishable_12345") === false, "Recognizes sb_publishable_ prefix as safe public key");

const formattedSecretErr = formatAuthError("Forbidden use of secret API key in browser");
assert(formattedSecretErr.includes("service_role"), "Transforms secret API key error into actionable message");
assert(formattedSecretErr.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), "Actionable message mentions NEXT_PUBLIC_SUPABASE_ANON_KEY");

console.log("=================================================");
console.log("TEST RESULTS: ALL 29 CHECKS PASSED");
console.log("=================================================");
