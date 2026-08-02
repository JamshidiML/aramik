# Aramik

AI-powered personalized meditation — MVP for the German market (DE/EN).

## Repository Structure (Monorepo)

```
aramik/
├── mobile/     # React Native (Expo) — iOS/Android mobile app
├── backend/    # NestJS + PostgreSQL — API, AI pipeline, payments
├── docs/       # Master Spec, Codex prompts, GDPR documentation
└── .github/    # CI/CD (GitHub Actions)
```

## Project Source of Truth

All technical decisions, the MVP scope, and the timeline are defined in `docs/MASTER_SPEC.md`.
Every team member (human or AI) must read this file before starting any work.

## Quick Start

```bash
# Mobile
cd mobile && npm install && npx expo start

# Backend
cd backend && npm install && npm run start:dev
```

## Team

- **Technical lead / Architect / Final QC:** Claude
- **Peer reviewer / First QC:** ChatGPT
- **Implementation:** Codex
- **Project manager:** Mohsen Jamshidi
