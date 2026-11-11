# Kronos AI — Known Issues, Limitations & Edge-Case Mitigations

This document provides a transparent log of known platform behaviors, third-party library deprecation warnings, browser API constraints, and recommended engineering mitigations for **Kronos AI**.

---

## 1. Third-Party Library & Tooling Notices

### 1.1 Next.js 16 Middleware Deprecation Notice
- **Symptom**: During `npm run build`, Turbopack logs:
  ```
  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
  ```
- **Analysis**: Next.js 16.4 introduces the new `proxy.ts` convention for edge request interceptors. However, the existing `src/middleware.ts` convention remains fully backward-compatible and functions with 100% stability.
- **Impact**: Zero runtime failure. All protected routes are strictly defended.
- **Planned Action**: Migration to `proxy.ts` will be conducted during the next scheduled Next.js canary release cycle.

### 1.2 Supabase JS Node.js 20 Deprecation Notice
- **Symptom**: In terminal output during test execution:
  ```
  ⚠️ Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later.
  ```
- **Analysis**: The `@supabase/supabase-js` library has announced that future major versions will mandate Node.js 22 LTS.
- **Impact**: Zero runtime issue on current Node.js 20.x runtime; all auth and database operations execute cleanly.
- **Mitigation**: Upgrading local and CI environments to Node.js 22 LTS is recommended prior to upgrading `@supabase/supabase-js` beyond version 2.x.

---

## 2. Browser & Hardware Environment Constraints

### 2.1 Web Speech API Browser Compatibility
- **Symptom**: Voice dictation button displays an unconfigured or disabled state on certain browsers.
- **Analysis**: The Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) is natively supported on Chromium-based browsers (Google Chrome, Microsoft Edge, Brave). Mozilla Firefox and certain iOS Safari versions require explicit user permission flags or do not expose continuous transcript streaming.
- **Mitigation**: Kronos AI features graceful degradation: if speech recognition is unsupported by the browser, the voice microphone button gracefully hides itself, and keyboard input remains fully operational.

### 2.2 Google OAuth 7-Day Refresh Token Limit (Test Mode)
- **Symptom**: Google Calendar sync prompts for reconnection after 7 days during development.
- **Analysis**: When a Google Cloud OAuth consent screen is configured in **"Testing"** status, Google imposes an automatic 7-day expiration limit on OAuth refresh tokens.
- **Mitigation**: To achieve indefinite token persistence, the Google Cloud Project OAuth consent screen must be switched from **"Testing"** to **"Published"** (Internal or External).

---

## 3. Storage & Network Limitations

### 3.1 LocalStorage Quota Boundaries
- **Constraint**: Web browsers typically enforce a 5MB to 10MB quota limit on `window.localStorage`.
- **Analysis**: In extreme use cases involving hundreds of completed tasks, focus session reflection logs, and habit histories accumulated over several years, local storage may approach capacity.
- **Mitigation Implemented**:
  1. Automatic state compression and schema optimization.
  2. JSON Export / Import functionality in the Profile workspace (`/profile`) allows users to back up and prune legacy histories.

### 3.2 Non-Interactive Token Refresh Environment Requirement
- **Requirement**: Non-interactive background Google OAuth token refresh requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the server `.env.local` (or Vercel project environment variables).
- **Behavior**: If these variables reside only inside the Supabase Auth dashboard, Kronos functions normally while the 1-hour access token is active, but background auto-sync cannot renew the token on the server without interactive user re-auth.
- **Mitigation Implemented**: Kronos gracefully detects missing environment credentials (`error: "config_missing"`), continues using valid tokens without corrupting stored records, and provides clear configuration guidance. Setting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local` unlocks 100% autonomous background token renewal.
  3. Seamless cloud persistence via Supabase PostgreSQL bypasses local browser storage limits.

### 3.2 Offline Planning & Reconnection
- **Behavior**: If the user loses internet connectivity while in the application, local scheduling calculations, task checkoffs, and focus timers continue to function via partitioned local storage. However, bi-directional Google Calendar sync transitions to a paused state until connectivity is restored.
- **Mitigation**: Network reconnect listeners automatically retry calendar sync upon restoration of online status.
