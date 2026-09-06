# Day 2 — Shared API Contract

This is the single source of truth for request and response shapes. All Day 2 implementations must code against this contract exactly.

## Authentication

Every endpoint below requires `Authorization: Bearer <accessToken>`, obtained from
`POST /auth/register` or `POST /auth/login` (see `docs/AUTH_SETUP.md`). There is no
`userId` field on any request anymore — the backend derives it from the token, and
rejects requests with a missing/invalid token as `401`. This is enforced server-side
(`JwtAuthGuard`), the same way GDPR consent is — see `CLAUDE.md`.

### POST /auth/register / POST /auth/login

**Request:**

```json
{ "email": "string", "password": "string (min 8 chars on register)" }
```

**Response `201`/`200`:**

```json
{ "accessToken": "string (JWT)", "userId": "uuid", "email": "string" }
```

`register` returns `409` if the email is already taken; `login` returns `401` for a
wrong email or password (the same error for both, so login can't be used to enumerate
registered emails).

## POST /mood-entries

Creates a check-in, runs Haiku extraction, and stores it.

**Request:**

```json
{
  "rawUserText": "string | null",
  "consentGiven": true
}
```

`consentGiven` must be `true` or the request is rejected with `403`. The backend is the final enforcement point for GDPR consent, not just the UI.

**Response `201`:**

```json
{
  "id": "uuid",
  "moodTag": "stress | anxiety | sadness | calm | tired",
  "intensity": 1,
  "topic": "work | relationship | health | sleep | other | null",
  "aiSummary": "string",
  "createdAt": "ISO8601"
}
```

## GET /mood-entries/weekly-pattern

Returns the aggregated pattern, or null for new users. No query parameters — the user
comes from the bearer token.

**Response `200`:**

```json
{
  "patternSummary": "string | null",
  "entryCount": 0
}
```

## POST /meditations/generate

**Request:**

```json
{
  "language": "de | en",
  "checkInId": "uuid"
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "script": "string (the meditation text)",
  "language": "de | en",
  "generatedAt": "ISO8601"
}
```

Audio/TTS generation is out of scope for Day 2. This endpoint returns text only.

## Error Shape (All Endpoints)

```json
{ "statusCode": 400, "message": "string", "error": "string" }
```
