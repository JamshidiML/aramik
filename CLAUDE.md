# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Aramik is an AI-powered personalized meditation app — MVP for the German market (DE/EN).
It is a monorepo with two independently-versioned apps:

```
aramik/
├── mobile/     # React Native (Expo SDK 54) — iOS/Android app
├── backend/    # NestJS 11 + PostgreSQL + TypeORM — API, AI pipeline
├── docs/       # Master spec, API contracts, security audit
└── .github/    # CI (GitHub Actions)
```

**`docs/MASTER_SPEC.md` is the project's single source of truth** for scope, tech-stack
decisions, and the AI memory architecture — read it before making any scope or
architecture change. `docs/DAY2_API_CONTRACT.md` is the authoritative request/response
shape for the mood/meditation endpoints; mobile and backend must both match it exactly.

## Commands

There is no root package.json — `mobile/` and `backend/` are independent npm projects,
each with its own lockfile. Run all commands from inside the relevant directory.

### Backend (`backend/`)

```bash
npm install
npm run start:dev        # nest start --watch
npm run build            # nest build
npm run lint             # eslint src
npx tsc --noEmit         # type check (not a package.json script)
npm test                 # jest --no-watchman (runs backend/test/**/*.spec.ts)
npm test -- --testPathPattern=mood.service   # run a single test file
```

Backend requires a running PostgreSQL instance and env vars from `backend/.env.example`
(`DATABASE_URL`, `ANTHROPIC_API_KEY`, etc.) — copy it to `.env` before `start:dev`.

### Mobile (`mobile/`)

```bash
npm install
npx expo start            # dev server (also: npm start)
npm run android / npm run ios
npm run lint               # expo lint
npx tsc --noEmit           # type check (not a package.json script)
npm test                   # jest --no-watchman (jest-expo preset)
npm test -- CheckInScreen  # run a single test file by name pattern
node scripts/check-i18n-parity.js   # DE/EN translation keys must match exactly
```

Mobile points at the backend via `EXPO_PUBLIC_API_BASE_URL` (see `mobile/app.config.js`),
default `http://localhost:3000`.

### CI (`.github/workflows/ci.yml`)

Two independent jobs (`mobile-checks`, `backend-checks`) run on every PR and on push to
`main`, each on Node 20.19.4 with `npm ci`. Mobile: i18n parity → lint → typecheck →
`expo-doctor` → test → prod-dependency audit → Android/iOS export. Backend: lint →
typecheck → test → prod-dependency audit. A change must pass the equivalent commands
locally before pushing.

## Architecture

### Two-model AI pipeline (the core product feature)

This is the piece that spans multiple files and is easy to get wrong — read
`backend/src/common/claude.service.ts` and `docs/MASTER_SPEC.md` §3 together.

```
check-in (mobile) → POST /mood-entries
  → ClaudeService.extractMoodStructured()  [Haiku 4.5]   → {moodTag, intensity, topic, summary}
  → stored as a MoodEntry row (long-term memory)

GET /mood-entries/weekly-pattern (≥3 entries in the last 7 days)
  → ClaudeService.summarizeWeeklyPattern()  [Haiku 4.5]  → one-paragraph pattern

POST /meditations/generate
  → loads the check-in + the weekly pattern
  → ClaudeService.generatePersonalizedMeditation()  [Sonnet 5]  → meditation script
  → stored as a Meditation row
```

Rules encoded in `ClaudeService`, not to be bypassed elsewhere:
- **Haiku (`claude-haiku-4-5-20251001`)** does cheap structured extraction/aggregation;
  **Sonnet (`claude-sonnet-5`)** is reserved for the final user-facing generation. Never
  hardcode a model name outside `ClaudeService` — change it there so all callers follow.
- Both mood extraction and pattern summarization return raw JSON/text that is
  hand-parsed and validated (`isExtractedMood` in `mood.service.ts`) before being
  trusted — Claude failures/malformed output surface as `BadGatewayException`, not a
  silent fallback.
- The meditation system prompt explicitly forbids medical/therapeutic claims.

### Backend (NestJS module structure)

- `AppModule` wires `ConfigModule` (global env), `TypeOrmModule` (Postgres, entities
  autoloaded, `synchronize` only when `DB_SYNCHRONIZE=true`), `CommonModule`
  (`ClaudeService`), `MoodModule`, `MeditationModule`.
- Each feature module follows controller → service → TypeORM entity, with
  `class-validator` DTOs (`ValidationPipe` is global with `whitelist` +
  `forbidNonWhitelisted` in `main.ts`, so unlisted fields are rejected, not ignored).
- `MeditationService` depends on `MoodEntriesService` directly (not through HTTP) to
  fetch the check-in and weekly pattern — cross-module calls go through injected
  services, not internal HTTP requests.
- **GDPR consent is enforced server-side**: `MoodEntriesService.createMoodEntry` throws
  `ForbiddenException` unless `consentGiven === true` on the request body. This is the
  final enforcement point (see `docs/DAY2_API_CONTRACT.md`) — the mobile consent gate is
  UX, not the actual guard, and must not be treated as sufficient on its own.
- `mood_entries` holds mental-health data under GDPR Art. 9: encryption at rest is a
  database-config concern, not application code — don't try to add app-level encryption
  here instead.

### Mobile (Expo / React Native)

- Navigation is one native stack (`RootNavigator.tsx`) gated by consent: it renders
  `Onboarding` until `useConsentStore` resolves `consentGiven === true` (persisted via
  `expo-secure-store` in `consentStorage.ts`), otherwise `CheckIn`. Revoking consent
  clears both the consent store and `useCheckInStore`.
- State is Zustand, split by concern: `consentStore` (persisted, source of truth for the
  nav gate) and `checkInStore` (in-memory draft of the current check-in).
- `mobile/src/services/moodService.ts` wraps the three API calls and runtime-validates
  every response shape (`isSubmitCheckInResponse`, etc.) before returning typed data —
  follow this pattern rather than trusting `axios` responses raw when touching the API
  layer. `MoodId` in `checkInStore.ts` must stay in sync with backend `MoodTag`
  (commented in the source).
- **i18n is mandatory**: every string goes through `useTranslation()`/`t()`, defined in
  both `src/i18n/locales/de.json` and `en.json`. `scripts/check-i18n-parity.js` fails CI
  if the two files' key sets diverge — add a key to both files in the same change.
  Default language follows the device locale, falling back to German.

### Testing conventions

- Backend: Jest + `ts-jest`, specs under `backend/test/**/*.spec.ts` (not colocated).
  Services are tested with hand-built mock repositories/`ClaudeService` (see
  `mood.service.spec.ts`) rather than a NestJS testing module — no live DB or API calls.
- Mobile: `jest-expo` preset, specs colocated in `__tests__/` next to the code they
  cover (`src/screens/__tests__`, `src/services/__tests__`, `src/store/__tests__`).
  Stores/services are tested by spying on the underlying storage/API module.
