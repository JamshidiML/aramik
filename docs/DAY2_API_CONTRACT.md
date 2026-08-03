# Day 2 — Shared API Contract

This is the single source of truth for request and response shapes. All Day 2 implementations must code against this contract exactly.

## POST /mood-entries

Creates a check-in, runs Haiku extraction, and stores it.

**Request:**

```json
{
  "userId": "string (uuid)",
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

## GET /mood-entries/weekly-pattern?userId=xxx

Returns the aggregated pattern, or null for new users.

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
  "userId": "string (uuid)",
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
