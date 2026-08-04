# Aramik — Master Spec & 30-Day Sprint Plan

**Version 1.0 | Prepared by Claude (Technical Lead) | For execution by: Mohsen (Project Manager) + Codex (Implementation) + ChatGPT (Peer Review)**

This document is the project's single source of truth. Every technical decision made in a conversation with Codex or ChatGPT must also be updated in this file so all three team members remain synchronized.

---

## 1. First-Month MVP Scope — What Is IN and What Is OUT

### ✅ IN (Must Launch by Day 30)

- iOS + Android mobile app (React Native, one codebase)
- Two complete languages: **German (default) and English**, switchable in settings without requiring an app update
- Registration/sign-in (email + Apple/Google Sign-In)
- Daily mood check-in (free text or quick selection from predefined options)
- AI-generated personalized meditation based on the check-in (text + TTS audio)
- Basic library: 15–20 pre-generated meditations (for offline mode/users in a hurry)
- MVP long-term memory: store weekly mood patterns + a simple reminder ("You mentioned work stress three times this week")
- In-app payments (App Store + Google Play IAP) — limited free plan / monthly / annual
- Simple subscription-cancellation button (German legal requirement, §312k BGB)
- Separate, explicit consent for mental-health data (GDPR Art. 9)

### ❌ OUT (Later Phase — Do Not Spend Time on These)

- ZPP certification / insurance reimbursement (a multi-month administrative process)
- Persian/Arabic languages
- Social/community features
- Apple Watch / wearable integration
- Video content (audio only for the MVP)

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Mobile | Node.js ≥20.19.4 + React Native 0.81.5 + Expo SDK 54 (TypeScript strict) | One codebase, faster releases for both stores, strong i18n ecosystem (`i18next` + `expo-localization`) |
| Backend | Node.js ≥20.19.4 (NestJS 11, TypeScript strict) + PostgreSQL | Type-safe, modular structure suitable for an AI-assisted team; Postgres fits relational user/memory data |
| AI — Main chat + meditation generation | **Claude Sonnet 5** (API) | High emotional-understanding quality and an appropriate cost/quality balance for the MVP |
| AI — Background processing (mood tagging, summarization, pattern extraction) | **Claude Haiku 4.5** (API) | Fast and very inexpensive, suitable for structured classification tasks |
| TTS (text to speech) | ElevenLabs (natural German + English) | Natural voice quality also used by competitors |
| Authentication | Firebase Auth or Auth0 | Fast, ready-made support for Apple/Google Sign-In |
| Payments | RevenueCat (on top of App Store/Google Play IAP) | Manages subscriptions/cancellations/receipts in one layer instead of separate implementations for both stores |
| Hosting | Hetzner or AWS (eu-central region, Frankfurt) | EU-based servers simplify GDPR compliance |
| CI/CD | GitHub Actions | Free, standard, and easy to integrate with Codex |

### Runtime Reliability and Privacy Decisions

- Structured AI data such as mood extraction must use Claude JSON Schema structured outputs; prompt-only JSON followed by an unguarded `JSON.parse` is not allowed.
- Every Claude response must be checked for a natural completion reason and validated again at the domain boundary before sensitive health data is stored.
- Mobile API endpoints are supplied through `EXPO_PUBLIC_API_BASE_URL`; device-specific LAN addresses must not be hardcoded in committed Expo configuration.
- Development request logs may include method, path, status, duration, provider status, and provider request ID. They must never include health-data request bodies, API keys, or user identifiers.

---

## 3. Long-Term Memory Architecture (Core Competitive Feature)

```
[User's daily check-in]
        │
        ▼
[Claude Haiku: structured extraction]
   → mood_tag (enum: stress/anxiety/sadness/calm/...)
   → intensity (1-5)
   → topic (work/relationship/health/sleep/...)
   → free_text_summary (≤50 words)
        │
        ▼
[Store in PostgreSQL: mood_entries table]
        │
        ▼ (weekly / every 10 check-ins)
[Claude Haiku: aggregate pattern → weekly_pattern_summary]
        │
        ▼
[Claude Sonnet: when generating a new meditation,
 receives weekly_pattern_summary + today's check-in as context
 → generates a personalized meditation]
```

This architecture keeps AI costs low (the expensive model is called only when generating the final output) and provides something none of Calm/Headspace/7Mind/Balloon currently offers.

**Privacy note:** `mood_entries` must be encrypted at the database level (encryption at rest), and the user must be able to delete their complete history (GDPR right to erasure).

---

## 4. 30-Day Sprint Plan (Compressed)

| Week | Focus | End-of-week Deliverable |
|---|---|---|
| **Week 1 (Days 1–7)** | Architecture + project skeleton + brand | Repository initialized, CI/CD active, final logo/colors/typography, working auth, bilingual navigation skeleton |
| **Week 2 (Days 8–14)** | AI personalization engine + memory | Complete daily check-in, working Haiku→storage→Sonnet pipeline, first real AI-generated meditation |
| **Week 3 (Days 15–21)** | Basic library + payments + UX polish | 15–20 prepared meditations, RevenueCat connected, payment/cancellation pages, complete i18n testing |
| **Week 4 (Days 22–30)** | Testing, QC, bug fixes, store submission | Beta test with 20–30 real German users, critical bug fixes, App Store/Google Play review submission, final GDPR/privacy documentation |

**Realistic warning:** Apple review usually takes 1–3 days, but an app may be rejected and require changes. Days 28–30 must remain a buffer for this risk, not be allocated to new work.

---

## 5. QC Loop — How Codex Output Is Evaluated

Every Pull Request created by Codex follows this cycle:

1. **Codex** writes the code and opens a PR.
2. **ChatGPT** (first reviewer) scores the code using the rubric below and leaves comments.
3. **Claude (me)** performs the second/final review — checking both the logic and compliance with this Master Spec.
4. If the two reviewers' average score is **below 80**, specific corrective comments are sent to Codex → Codex applies the fixes → the cycle repeats.
5. A score ≥80 → merge.

### Rubric (20 Points per Criterion, 100 Total)

| Criterion | What Is Evaluated |
|---|---|
| Functional correctness | Does it behave exactly as specified in this document? |
| Code quality | Readability, naming, lack of duplication, modular structure |
| Security/privacy | Is sensitive data (`mood_entries`) handled correctly? Are API keys protected? |
| Test coverage | Are there unit tests for critical logic (memory pipeline, payments)? |
| i18n compliance | Is every new string in both DE and EN, rather than hardcoded? |

---

## 6. Immediate Next Step (Today)

1. You (Mohsen) create a private GitHub repository and add me/ChatGPT/Codex (by email or invite link).
2. I create the initial project skeleton (folder structure, package.json, i18n settings, config files) here and deliver it as a zip/files so you can make the first commit.
3. I prepare the first Codex prompt to begin Day 1 work (auth + navigation skeleton).

Should I start step 2 (creating the project skeleton) now?
