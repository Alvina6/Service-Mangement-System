# Google OAuth Implementation Plan — ServiceFlow

## Top-Level Overview

**Goal:** Add "Sign in with Google" as an additional authentication method for customers on
the ServiceFlow MERN/Next.js application. Staff users (admin, dispatcher, technician) are
created exclusively by admins via POST /api/auth/staff and are therefore out of scope for
Google OAuth self-registration.

**Scope:**
- New backend route/controller action: `POST /api/auth/google`
- Minimal User schema additions: `googleId`, `authProvider`
- Single new frontend component: `<GoogleOAuthButton />`
- Changes to two existing frontend files: `AuthContext.js` and `login/page.js`
- No changes to existing JWT verification, RBAC, DashboardShell, or Axios interceptor

**Approach selected:** Custom backend token-exchange using the `google-auth-library`
(no Passport.js). The frontend uses the **Google Identity Services (GIS)** `<script>` tag
(`accounts.google.com/gsi/client`) to obtain a one-time `credential` (ID token).
That token is POSTed to the backend, verified server-side, and the existing JWT-issuing
infrastructure does the rest.

---

## 1. Feature Goal

Allow users to register or log in with a Google account in a single click, without a
password, while:
- Sharing the same JWT/localStorage/AuthContext pipeline already in use
- Protecting the existing password login from any regressions
- Gracefully linking a Google login to an existing password account with the same email

---

## 2. Recommended OAuth Strategy

### Option A — Passport.js (`passport-google-oauth20`) with redirect-based server flow

**How it works:**
1. Frontend redirects browser to `GET /api/auth/google`
2. Backend proxies to Google OAuth consent screen
3. Google redirects back to `GET /api/auth/google/callback`
4. Passport exchanges code for tokens, calls `done(null, user)`
5. Backend sets a session cookie or redirects with a token in query string

**Pros:** Mature library, handles token refresh, well-documented.

**Cons:**
- Requires a server-side session store or awkward query-string token hand-off
- Breaks the current stateless architecture — no sessions exist anywhere
- Introduces a redirect loop that is incompatible with Next.js App Router client components
- Adds `passport`, `passport-google-oauth20`, `express-session` (3 new deps)
- CORS complications between Express redirect and Next.js origin

### Option B — Google Identity Services (GIS) one-tap + custom backend verification ✅ SELECTED

**How it works:**
1. Frontend loads GIS `<script>` once (CDN, no npm package)
2. User clicks "Sign in with Google" → GIS renders Google's pop-up/one-tap UI
3. Google returns a signed **ID token** (`credential` string) directly to the browser
4. Frontend POSTs `{ credential }` to `POST /api/auth/google`
5. Backend uses `google-auth-library` to verify the ID token signature and audience
6. Backend finds-or-creates a User, signs a JWT, returns `{ success, user, token }`
7. Frontend stores the JWT in localStorage under `serviceflow_token` — **identical to
   the current password login flow**

**Why this best fits the existing architecture:**
- The existing `AuthContext.login()` already handles `{ user, token }` responses; the
  `googleLogin()` method we add follows the exact same pattern
- No sessions, no redirects, no new middleware — stateless JWT is preserved end to end
- Only one new backend dependency (`google-auth-library`); no Passport ecosystem
- The Axios interceptor, `protect` middleware, `DashboardShell`, and all downstream code
  remain completely unchanged
- GIS is loaded from CDN so the Next.js bundle size is unaffected

---

## 3. Exact Files to Modify

### 3.1 `backend/models/User.js`
- **Function/component:** Mongoose schema definition
- **Purpose:** Add two optional fields:
  - `googleId: { type: String, unique: true, sparse: true }` — stores the Google `sub`
    (subject) claim; sparse index allows multiple documents with `null`
  - `authProvider: { type: String, enum: ['local', 'google'], default: 'local' }` — records
    how the account was first created; used in account-linking logic
- **Dependencies:** None; must be done before any controller changes

### 3.2 `backend/controllers/authController.js`
- **Function/component:** Add new exported function `googleAuth`
- **Purpose:** Verify the GIS ID token, implement find-or-create + account-linking logic,
  and return `{ success: true, user, token }` in the same shape as the existing `login()`
  response
- **Dependencies:** `User.js` schema changes (3.1), `google-auth-library` installed

### 3.3 `backend/routes/authRoutes.js`
- **Function/component:** Route registration
- **Purpose:** Add `router.post('/google', googleAuth)` — one line under the existing
  `/login` route; apply the existing auth rate-limiter (already applied at the router
  level in `server.js`)
- **Dependencies:** `googleAuth` exported from `authController.js` (3.2)

### 3.4 `backend/server.js`
- **Function/component:** CORS configuration
- **Purpose:** The GIS pop-up posts back to the same origin so no CORS change is needed
  for the API call. However, if `Content-Security-Policy` headers set by `helmet` block
  `accounts.google.com`, the CSP must be relaxed to allow `script-src accounts.google.com`
  and `frame-src accounts.google.com`. This is the only change needed.
- **Dependencies:** None; can be done in parallel with other tasks

### 3.5 `frontend/src/context/AuthContext.js`
- **Function/component:** `AuthContext` provider + exported `useAuth` hook
- **Purpose:** Add a `googleLogin(credential)` method that:
  1. POSTs `{ credential }` to `/api/auth/google`
  2. Stores the returned JWT in `localStorage` under `serviceflow_token`
  3. Updates `user` state
  4. Returns the `user` object (consistent with existing `login()`)
  The method is exposed through the context value object so any component can call it.
- **Dependencies:** Backend route live (3.3) — not a code dependency, just a runtime one

### 3.6 `frontend/src/app/login/page.js`
- **Function/component:** `LoginPage` component
- **Purpose:** Import and render `<GoogleOAuthButton />` below the existing form, separated
  by an "or" divider. On callback from GoogleOAuthButton, call `googleLogin()` from
  `useAuth()`, handle errors, then redirect to `/dashboard/{user.role}` — identical
  redirect logic already in the component.
- **Dependencies:** `GoogleOAuthButton` component (4.1), `googleLogin` in AuthContext (3.5)

---

## 4. Exact Files to Create

### 4.1 `frontend/src/components/GoogleOAuthButton.jsx`
- **Purpose:** Self-contained component that:
  1. Dynamically injects the GIS `<script>` tag if not already present
  2. Calls `google.accounts.id.initialize({ client_id, callback })` on mount
  3. Renders the Google-branded "Sign in with Google" button using
     `google.accounts.id.renderButton()`
  4. Accepts an `onCredential(credentialString)` prop that the parent calls when the
     ID token arrives
  5. Cleans up on unmount
- **Style:** Matches existing Tailwind class conventions; minimal wrapper div
- **No npm package** — relies solely on the CDN script

### 4.2 `backend/.env.example` update — see Section 6 (env vars); this is not a new file
  but must be updated

---

## 5. Dependencies to Add

### Backend (1 package)
```
google-auth-library   ^9.x   (Google's official Node.js library for token verification)
```
No other backend packages required.

### Frontend (0 packages)
Google Identity Services is loaded from CDN (`https://accounts.google.com/gsi/client`)
inside `GoogleOAuthButton.jsx`. No npm package is added to `frontend/package.json`.

---

## 6. Environment Variables Required

### Backend (`backend/.env` and `backend/.env.example`)
```
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>.apps.googleusercontent.com
```
Used in `authController.js` to instantiate `OAuth2Client` and verify the audience claim
of incoming ID tokens.

### Frontend (`frontend/.env.local` and `frontend/.env.local.example`)
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same-google-oauth-client-id>.apps.googleusercontent.com
```
Used in `GoogleOAuthButton.jsx` to initialize the GIS library. Must be prefixed with
`NEXT_PUBLIC_` because it is read in a client component. The value is the same Client ID
as the backend variable.

### Google Cloud Console setup required before development:
1. Create or select a GCP project
2. Enable the "Google Identity" API
3. Create OAuth 2.0 credentials (Web application type)
4. Add `http://localhost:3000` to Authorized JavaScript Origins
5. No Authorized Redirect URIs needed (GIS popup flow, not redirect flow)
6. Copy the Client ID into both env files

---

## 7. Database / Schema Changes

### User collection — two new fields

| Field | Type | Index | Default | Notes |
|---|---|---|---|---|
| `googleId` | String | Unique + sparse | `undefined` | Google `sub` claim; sparse allows multiple `null` values |
| `authProvider` | String (enum) | None | `'local'` | Values: `'local'`, `'google'`; existing users default to `'local'` |

### Migration notes
- Existing users are unaffected — both fields are optional with defaults
- No migration script needed; Mongoose will add the fields the next time a document is
  written; the sparse index will be created by Mongoose on startup
- The existing unique index on `email` stays unchanged and is the anchor for account linking

### Password field behaviour after schema change
- `password` field stays as-is (required for `local` registration, NOT required for Google)
- For Google-created accounts, `password` is never set; the `required` validator on
  `password` must be changed to `required: function() { return this.authProvider === 'local'; }`

---

## 8. Complete Authentication Flow

```
User clicks "Sign in with Google"
        │
        ▼
GoogleOAuthButton (frontend component)
  google.accounts.id.initialize({ client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID, callback })
  google.accounts.id.renderButton()
        │
        ▼ (User selects Google account in popup)
GIS returns credential (signed ID token JWT)
        │
        ▼
onCredential(credential) prop fires
        │
        ▼
LoginPage calls googleLogin(credential)   [AuthContext.js]
        │
        ▼
POST /api/auth/google  { credential }     [api.js Axios instance — same base URL]
        │
        ▼
authRateLimiter (15 req/15 min)           [server.js — already applied to /api/auth]
        │
        ▼
authController.googleAuth()               [backend/controllers/authController.js]
  1. new OAuth2Client(GOOGLE_CLIENT_ID)
  2. client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
  3. Extract { sub, email, name, picture } from payload
  4. Account-linking logic (see Section 9)
  5. jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  6. Return { success: true, user: user.toSafeObject(), token }
        │
        ▼
AuthContext.googleLogin() receives { user, token }
  localStorage.setItem('serviceflow_token', token)
  setUser(user)
  return user
        │
        ▼
LoginPage redirects to /dashboard/{user.role}
        │
        ▼
DashboardShell checks useAuth() → user exists, role matches → renders dashboard
        │
        ▼
Subsequent API calls — Axios interceptor reads serviceflow_token from localStorage
  → Authorization: Bearer <JWT>
  → protect middleware verifies JWT (unchanged)
  → req.user set → controller handles request
```

---

## 9. Existing-Account Linking Strategy

All cases are handled inside `authController.googleAuth()` after the ID token is verified.
The `email` and `sub` (googleId) values come from the verified payload.

### Case 1 — New Google user (no existing account with this email)
```
1. User.findOne({ email }) → null
2. User.create({
     name, email, avatarUrl: picture,
     googleId: sub,
     authProvider: 'google',
     role: 'customer',    // same default as self-registration
     isActive: true
   })
3. Sign JWT, return { success: true, user, token }
```

### Case 2 — Existing password user with the same email (`authProvider: 'local'`)
```
1. User.findOne({ email }) → found, authProvider: 'local', googleId: undefined
2. Attach googleId: sub to existing document, save
   (user.googleId = sub; user.save())
   — The account is now linked; user retains their role and all data
3. Sign JWT, return { success: true, user, token }
   — Optional: include a flag in the response so the frontend can show
     "Your Google account has been linked to your existing account."
```

### Case 3 — Existing Google user returning (`authProvider: 'google'`, googleId matches)
```
1. User.findOne({ googleId: sub }) → found
2. Check isActive (see Case 6)
3. Sign JWT, return { success: true, user, token }
```

### Case 4 — Duplicate googleId (same Google account attempts to create second account)
```
— This cannot happen after Case 3 is handled: findOne({ googleId }) finds the existing
  record and returns it. There is no insert. The sparse unique index is a database-level
  safety net.
— If the index throws E11000 duplicate key, the global errorHandler returns 400.
```

### Case 5 — Invalid Google token (expired, wrong audience, tampered)
```
1. client.verifyIdToken() throws an Error
2. Caught in the try/catch block
3. Return 401: { success: false, message: 'Invalid Google token' }
```

### Case 6 — Inactive user (`isActive: false`)
```
1. User found (Case 2 or Case 3) but user.isActive === false
2. Return 403: { success: false, message: 'Account deactivated. Contact support.' }
   — Identical behaviour to the existing password login inactive check
```

---

## 10. Security Considerations

| # | Concern | Mitigation |
|---|---|---|
| 1 | Forged Google ID token | `google-auth-library` verifies signature cryptographically against Google's public keys and checks the `aud` (audience) claim against our Client ID |
| 2 | Client ID exposed in browser | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is intentionally public — it is not a secret; the secret is the token verification on the backend |
| 3 | Email-spoofing to hijack account | Verification via `googleId` (sub) after first link; `email` alone is not trusted for subsequent logins — `findOne({ googleId: sub })` is the primary lookup |
| 4 | Rate limiting on `/api/auth/google` | The existing auth rate limiter (15 req/15 min) already covers `/api/auth/*` — no additional config needed |
| 5 | CSRF on the POST endpoint | CORS is restricted to `CLIENT_URL`; the ID token itself is short-lived (≤1 hr) and single-use |
| 6 | Helmet CSP blocking GIS script | CSP `script-src` and `frame-src` must explicitly allow `accounts.google.com` |
| 7 | localStorage XSS risk | Existing architecture already uses localStorage for JWT; no regression introduced. A future improvement would be httpOnly cookies, but that is out of scope. |
| 8 | Google account takeover | `google_auth_library` checks `email_verified: true` claim; if false, reject with 401 |
| 9 | Staff account creation via Google | `googleAuth` always defaults role to `'customer'`; staff creation remains exclusively via POST /api/auth/staff (admin only) |
| 10 | googleId uniqueness collision | Sparse unique index at the database level is the final guard |

---

## 11. Testing Strategy

The project currently has no test infrastructure. The following establishes a minimal,
purpose-built test suite.

### Test framework / dependencies to add

**Backend:**
```
jest                  ^29.x  (test runner + assertion library)
supertest             ^7.x   (HTTP integration tests against Express app)
```
Add to `backend/package.json` devDependencies.
Add `"test": "jest --runInBand"` to the `scripts` block.
Create `backend/jest.config.js` with `testEnvironment: 'node'`.

**Frontend:**
```
@testing-library/react   ^16.x  (component testing)
@testing-library/jest-dom ^6.x
jest                       ^29.x
jest-environment-jsdom     ^29.x
```
Add to `frontend/package.json` devDependencies.
Create `frontend/jest.config.js` pointing to jsdom environment.

---

### Backend Tests

**File: `backend/__tests__/auth.google.test.js`**

#### OAuth success tests
```
POST /api/auth/google
  ✓ with valid credential for new user → 200, returns { success: true, user, token }
  ✓ new user has role: "customer"
  ✓ new user has authProvider: "google"
  ✓ JWT in response is verifiable with JWT_SECRET
  ✓ second call with same credential links to existing user (no duplicate created)
```

#### Invalid token tests
```
  ✓ missing credential field → 400
  ✓ malformed credential string → 401 "Invalid Google token"
  ✓ credential with wrong audience → 401
  ✓ expired credential → 401
```

#### Duplicate email / account-linking tests
```
  ✓ existing local user same email → googleId attached, same _id returned
  ✓ existing Google user returns (googleId already set) → same user returned
  ✓ inactive user with valid credential → 403 "Account deactivated"
  ✓ duplicate googleId insert attempt → handled gracefully (existing user returned)
```

#### Existing password login regression tests
**File: `backend/__tests__/auth.local.test.js`**
```
POST /api/auth/register
  ✓ valid registration → 201, token returned
  ✓ duplicate email → 400
  ✓ missing required fields → 400

POST /api/auth/login
  ✓ valid credentials → 200, token returned
  ✓ wrong password → 401
  ✓ inactive user → 403
  ✓ unknown email → 401

GET /api/auth/me
  ✓ valid JWT → 200, user returned
  ✓ no token → 401
  ✓ invalid token → 401
```

**Test isolation strategy:**
- Each test file connects to a separate in-memory MongoDB instance using
  `mongodb-memory-server` (add as devDependency)
- `google-auth-library` `OAuth2Client.verifyIdToken` is mocked with `jest.mock()` —
  no real Google API calls in tests

---

### Frontend Tests

**File: `frontend/src/__tests__/GoogleOAuthButton.test.jsx`**
```
  ✓ renders without crashing when GIS script not yet loaded
  ✓ injects GIS script tag into document head
  ✓ calls onCredential prop when GIS returns a credential
  ✓ does not inject duplicate script tags on re-render
```

**File: `frontend/src/__tests__/AuthContext.googleLogin.test.jsx`**
```
  ✓ googleLogin() stores token in localStorage
  ✓ googleLogin() sets user state
  ✓ googleLogin() returns user object
  ✓ googleLogin() with API error re-throws error
```

---

### Manual end-to-end verification checklist
```
□ Click "Sign in with Google" on /login — Google popup appears
□ Select Google account — redirected to /dashboard/customer
□ Refresh page — still logged in (token in localStorage persists)
□ Log out — token removed, redirect to /
□ Sign in again with same Google account — same user returned, no duplicate
□ Create a local account with the same email first, then sign in with Google
    — "linked" success, same dashboard, no data loss
□ Admin deactivates the Google user → Google login returns 403 message
□ Existing password login for admin/dispatcher/technician/customer unchanged
□ Rate limit: 16 rapid Google login attempts → 429 response
□ Chrome DevTools Network: no token in URL, token only in localStorage
```

---

## 12. Documentation Changes

### Files to update

**`backend/.env.example`**
- Add `GOOGLE_CLIENT_ID=` with a comment explaining where to obtain it

**`frontend/.env.local.example`**
- Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID=` with matching comment

**`README.md`** (if one exists at root or in backend/frontend)
- Add a "Google OAuth Setup" section covering:
  1. Creating GCP credentials
  2. Setting Authorized JavaScript Origins
  3. Copying Client ID into both env files
  4. Note that staff accounts are not created via Google OAuth

---

## 13. Implementation Order

The following sequence minimises blocked work. Each step must be complete before the
next step that depends on it begins.

```
Step 1 — Dependencies
  Install google-auth-library in backend

Step 2 — Environment variables
  Add GOOGLE_CLIENT_ID to backend/.env
  Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to frontend/.env.local
  Update both .env.example files

Step 3 — Schema change
  Modify backend/models/User.js
  (add googleId, authProvider, fix password required validator)

Step 4 — Backend controller
  Add googleAuth() to backend/controllers/authController.js

Step 5 — Backend route
  Add POST /google route to backend/routes/authRoutes.js

Step 6 — Helmet CSP
  Update Content-Security-Policy in backend/server.js
  to allow accounts.google.com

Step 7 — Frontend component
  Create frontend/src/components/GoogleOAuthButton.jsx

Step 8 — AuthContext
  Add googleLogin() to frontend/src/context/AuthContext.js

Step 9 — Login page
  Add GoogleOAuthButton to frontend/src/app/login/page.js

Step 10 — Test infrastructure
  Add jest/supertest to backend devDependencies
  Add jest/testing-library to frontend devDependencies
  Create jest config files

Step 11 — Backend tests
  Write backend/__tests__/auth.google.test.js
  Write backend/__tests__/auth.local.test.js (regression)

Step 12 — Frontend tests
  Write frontend/src/__tests__/GoogleOAuthButton.test.jsx
  Write frontend/src/__tests__/AuthContext.googleLogin.test.jsx

Step 13 — Manual E2E verification
  Run through checklist in Section 11

Step 14 — Documentation
  Update .env.example files and README
```

---

## 14. Rollback Plan

Because Google OAuth is additive (new route, new fields, new component), rollback is
surgical:

**Backend rollback:**
1. Remove `POST /api/auth/google` from `authRoutes.js`
2. Remove `googleAuth` from `authController.js`
3. Revert `User.js` schema (remove `googleId` and `authProvider` fields)
4. Uninstall `google-auth-library`
5. Remove `GOOGLE_CLIENT_ID` from `.env`

**Frontend rollback:**
1. Remove `<GoogleOAuthButton />` from `login/page.js`
2. Remove `googleLogin()` from `AuthContext.js`
3. Delete `GoogleOAuthButton.jsx`
4. Remove `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from `.env.local`

**Database rollback:**
- Run a MongoDB update to unset `googleId` and `authProvider` from all documents
- Drop the sparse `googleId` index
- Users who registered exclusively via Google will lose their login method — identify them
  with `{ authProvider: 'google' }` before rolling back and notify them

**Zero downtime:** Because all existing routes and the JWT pipeline are untouched, the
rollback does not affect any active password-based sessions.

---

## 15. Risk Register

| # | Risk | Likelihood | Impact | Classification | Mitigation |
|---|---|---|---|---|---|
| R1 | GIS script blocked by Helmet CSP | High | High — OAuth button never loads | **Critical** | Explicitly configure CSP in server.js before testing |
| R2 | GOOGLE_CLIENT_ID env var missing in production | Medium | High — all Google logins fail silently | **Critical** | Add startup assertion in authController; CI env check |
| R3 | password required validator not updated — Google users cannot be saved | High | High — registration fails | **Critical** | Conditional required validator in Step 3 |
| R4 | Existing local user email-collision not handled — duplicate user created | Medium | High — data integrity | **High** | Implement Case 2 logic in googleAuth before User.create |
| R5 | googleId sparse index not created — duplicate googleId possible | Low | High — two accounts share one Google identity | **High** | Verified at startup via Mongoose ensureIndexes |
| R6 | GIS pop-up blocked by browser (third-party cookie policies) | Medium | Medium — affects some users | **Medium** | GIS one-tap fallback; document known browser behaviour |
| R7 | Rate limiter counts Google + password attempts together — legitimate users locked out | Low | Medium | **Medium** | Acceptable given 15 req/15 min limit; monitor in production |
| R8 | Client ID accidentally committed to version control | Low | Medium | **Medium** | `.env` is in `.gitignore`; verify before first commit |
| R9 | `email_verified: false` Google accounts allowed | Low | Medium — unverified emails bypass security | **Medium** | Explicitly check `email_verified` claim in googleAuth |
| R10 | Google deprecates GIS popup API | Very Low | Low — long migration runway | **Low** | Monitor Google Identity changelog |
| R11 | No refresh token — Google ID token expires after 1 hr browser session | Low | Low — only affects GIS popup lifecycle, not our JWT | **Low** | Our JWT has its own 7-day expiry; no impact |

---

## 16. Developer Approval Checklist

The following decisions must be explicitly approved before implementation begins:

```
□ SCOPE: Google OAuth is restricted to 'customer' role only.
         Staff (admin/dispatcher/technician) continue to be created only by admins.
         Approved? ___

□ ACCOUNT LINKING: When a Google email matches an existing password account,
         the googleId is silently attached to the existing account without prompting
         the user.
         Approved? ___
         Alternative: Require the user to enter their password to confirm linking? ___

□ PASSWORD FIELD: The password field validator will be changed to conditional
         (required only for authProvider: 'local').
         Approved? ___

□ ROLE ASSIGNMENT: All Google-authenticated new users receive role: 'customer'.
         No mechanism for Google users to self-select a different role.
         Approved? ___

□ TOKEN STORAGE: JWT continues to be stored in localStorage (not httpOnly cookie).
         This is consistent with the existing implementation.
         Approved? ___

□ UI PLACEMENT: The Google button appears on the /login page only, not on
         the /register page (register is already customer-only and Google covers it).
         Approved? ___
         Alternative: Also add to /register page? ___

□ STAFF ACCOUNTS: No Google OAuth for staff creation flow. Admin-created staff
         can link their Google account if they log in via Google with a matching email.
         Approved? ___

□ TEST INFRASTRUCTURE: Jest + Supertest + mongodb-memory-server will be added as
         devDependencies. This is the first test infrastructure in the project.
         Approved? ___

□ CSP CHANGE: Helmet Content-Security-Policy will be relaxed to allow
         accounts.google.com for script-src and frame-src.
         Approved? ___

□ GOOGLE CLOUD SETUP: A developer must create GCP credentials before implementation
         can be tested. Who is responsible? ___
```

---

## Implementation Summary

### Files to Modify (6)
| File | Change |
|---|---|
| `backend/models/User.js` | Add `googleId`, `authProvider` fields; fix conditional password validator |
| `backend/controllers/authController.js` | Add `googleAuth()` function |
| `backend/routes/authRoutes.js` | Add `POST /google` route |
| `backend/server.js` | Relax Helmet CSP for accounts.google.com |
| `frontend/src/context/AuthContext.js` | Add `googleLogin(credential)` method |
| `frontend/src/app/login/page.js` | Render `<GoogleOAuthButton />` with "or" divider |

### Files to Create (3)
| File | Purpose |
|---|---|
| `frontend/src/components/GoogleOAuthButton.jsx` | GIS-powered sign-in button component |
| `backend/__tests__/auth.google.test.js` | Google OAuth backend tests |
| `backend/__tests__/auth.local.test.js` | Existing login regression tests |
| `frontend/src/__tests__/GoogleOAuthButton.test.jsx` | Button component tests |
| `frontend/src/__tests__/AuthContext.googleLogin.test.jsx` | AuthContext method tests |

*(5 new files total, plus jest config files)*

### Packages to Install
| Package | Location | Purpose |
|---|---|---|
| `google-auth-library` | backend | Verify Google ID tokens server-side |
| `jest` | backend devDep | Test runner |
| `supertest` | backend devDep | HTTP integration testing |
| `mongodb-memory-server` | backend devDep | In-memory DB for tests |
| `jest` | frontend devDep | Test runner |
| `jest-environment-jsdom` | frontend devDep | Browser environment simulation |
| `@testing-library/react` | frontend devDep | React component testing |
| `@testing-library/jest-dom` | frontend devDep | Custom matchers |

### Environment Variables
```
backend/.env        →  GOOGLE_CLIENT_ID=...
frontend/.env.local →  NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Critical Risks
- **R1** Helmet CSP blocks GIS script — must be fixed before any frontend testing
- **R2** Missing GOOGLE_CLIENT_ID env var — add startup guard
- **R3** Conditional password validator not updated — Google users cannot be saved

### Tests
- 4 test files: Google OAuth success/error, account linking, password login regression,
  frontend component, AuthContext method
- Mock `google-auth-library` to avoid live Google API calls
- Manual E2E checklist (12 items) to verify end-to-end flow

### Recommended OAuth Approach
**Google Identity Services (GIS) one-tap popup + custom `POST /api/auth/google` endpoint
verified with `google-auth-library`.**
Reasons: stateless JWT is fully preserved, only one new backend dependency, no sessions,
no redirects, zero change to the Axios interceptor / `protect` middleware / `DashboardShell`
pipeline.
