# Ready-to-use Codex Prompt — Day 1

Give the following text directly to Codex (without changes, except where marked):

---

You are working on the `aramik` repository. Before doing any work, read these files:

- `docs/MASTER_SPEC.md` (complete product specification)
- `mobile/src/i18n/locales/de.json` and `en.json` (all existing UI strings)
- `mobile/src/navigation/RootNavigator.tsx` (existing navigation skeleton)

## Day 1 Task

Implement the following placeholder screens in `mobile/src/screens/`:

1. **OnboardingScreen.tsx** — A welcome screen using the `onboarding.*` translation keys. The "Get Started" button takes the user to `CheckIn`.
2. **CheckInScreen.tsx** — A daily check-in form: quick selection from five moods (using the `checkin.mood_*` keys) plus an optional TextInput for free text. For now, the submit button should only store the data in state and navigate to `MeditationPlayer` (the backend API connection will be implemented on Day 2; mock it for now).
3. **SettingsScreen.tsx** — Include a language switch (change `i18n.language` between `de` and `en`), a "Cancel subscription" button (placeholder alert for now), and a "Delete my data" button (placeholder alert for now).

## Mandatory Rules (According to the QC Rubric — Every Violation Lowers the Score)

- **No text may be written directly in JSX.** Always use `const { t } = useTranslation()` and `t('namespace.key')`.
- If a new string is needed, add it to **both** `de.json` and `en.json` at the same time (`node mobile/scripts/check-i18n-parity.js` must pass without errors).
- Use TypeScript strict mode; do not use `any` without justification in a comment.
- Components must be functional and use hooks (not class components).
- Use `StyleSheet.create` for styling, not repeated inline style objects.
- Write at least one simple unit test (Jest + React Native Testing Library) for the mood-selection logic in CheckInScreen.

## Expected Output

A Pull Request titled `feat: day1 onboarding + checkin + settings screens` containing all changes above.

---

*This prompt was prepared by Claude (the project's technical lead) according to `docs/MASTER_SPEC.md`.*
