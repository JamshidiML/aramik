# Production Dependency Audit

**Last checked:** 2026-08-02
**Command:** `npm audit --omit=dev`

## Mobile

- Result: **0 critical, 0 high, 10 moderate**.
- The prior High finding was PostCSS path traversal/file disclosure through Expo's Metro toolchain
  (`GHSA-r28c-9q8g-f849`, affected through `postcss <=8.5.17`).
- Remediation: `mobile/package.json` overrides PostCSS to `8.5.25`, a patched release in the
  same major line. Expo Doctor and Android/iOS exports must pass with this override.
- Residual Moderate findings are transitive dependencies of the Expo SDK 54 CLI/config toolchain
  (`@expo/cli`, config plugins, Expo Asset/Constants, `uuid`, and `xcode`). npm only offers an
  Expo major-version change for those paths, which is incompatible with the current SDK 54 Expo Go
  requirement. They are accepted temporarily and must be reassessed during the next controlled Expo
  SDK upgrade.

CI fails on any future High or Critical production finding through
`npm audit --omit=dev --audit-level=high`.

## Backend

- Result: **0 vulnerabilities**.
- High findings in the NestJS 10 Express stack (`multer`, `lodash`, and related adapter paths) were
  remediated by upgrading the aligned NestJS runtime/tooling packages to NestJS 11.

No `npm audit fix --force` command was used.
