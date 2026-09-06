# Auth Setup

## What works today

Email + password auth is fully implemented and requires no external account:

- `POST /auth/register` and `POST /auth/login` (backend, `src/modules/auth/`) issue a
  JWT signed with `JWT_SECRET` (see `backend/.env.example`).
- The mobile app's `SignInScreen`/`SignUpScreen` call these endpoints, store the token
  with `expo-secure-store`, and `apiClient` attaches it as `Authorization: Bearer <token>`
  on every request.
- Every mood/meditation endpoint requires this token (`JwtAuthGuard`) and derives the
  user id from it — never from a client-supplied field. See `CLAUDE.md` for why.

## What still needs your accounts

"Continue with Apple" and "Continue with Google" are visible in `SignInScreen` but only
show a "not available yet" message. Wiring them up needs credentials tied to accounts
only you can create — no amount of engineering substitutes for these:

### Sign in with Apple
1. An active Apple Developer Program membership (paid, tied to your Apple ID).
2. In developer.apple.com → Certificates, Identifiers & Profiles: enable "Sign In with
   Apple" on the app's bundle identifier, and create a Services ID if you also want web
   login.
3. Add the `expo-apple-authentication` package and the `usesAppleSignIn: true` field in
   `app.json`'s `ios` config, then implement the button using its `AppleAuthentication`
   API.
4. Backend: add a `POST /auth/apple` endpoint that verifies Apple's identity token
   (Apple's public JWKS) and creates/looks up a `User` by the verified Apple subject id.

### Sign in with Google
1. A Google Cloud project (free) with the "Google Sign-In"/OAuth consent screen
   configured.
2. OAuth 2.0 client IDs for iOS, Android, and web (Expo's Auth Proxy) from
   console.cloud.google.com.
3. Add `expo-auth-session` + `expo-web-browser` and implement the button with Google's
   OAuth endpoint and your client IDs (put them in `app.config.js`, not hardcoded).
4. Backend: add a `POST /auth/google` endpoint that verifies the Google ID token and
   creates/looks up a `User` by the verified Google subject id.

Until you have those accounts, do not fake the buttons into "working" — showing a clear
"not available yet" message (current behavior) is preferable to a button that silently
does nothing or lies about signing the user in.

## Other MVP integrations still gated on your accounts

Per `docs/MASTER_SPEC.md` §2, none of these can be built end-to-end without you creating
the account first — the code can be written against their SDKs/APIs, but the app cannot
run without a real project/key from you:

| Integration | What you need to create |
|---|---|
| TTS audio | An ElevenLabs account + API key (`ELEVENLABS_API_KEY`) |
| Payments | An App Store Connect + Google Play Console app listing, and a RevenueCat account wired to both (`REVENUECAT_API_KEY`) |
| Hosting | A Postgres instance and a server/VM in an `eu-central` region (Hetzner or AWS Frankfurt) |
| Store submission | Apple Developer Program + Google Play Console accounts, app icons/screenshots, and a published privacy policy |
