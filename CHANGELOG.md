# Changelog

All notable changes to Preflight are documented in this file.

This project follows the
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format.

## [Unreleased]

## [0.2.0] - 2026-11-26

### Added

- `missing-favicon` and `missing-robots-txt` checks (now 10 in total).
- `--ignore` warns about an id that matches no check and suggests the closest one.
- `preflight-ignore` at the top of a file now silences findings about the whole file.
- `--html` accepts a file name ending in `.htm`.
- `npm run demo`, a FAQ, JSON output docs, a Hindi README, a security policy and issue templates.

### Fixed

- `env-file-committed` no longer flags `.env.vault` or env files that hold only public `VITE_*` / `NEXT_PUBLIC_*` variables.
- `no-privacy-policy` counts a linked policy URL, is no longer silenced by an iOS `PrivacyInfo.xcprivacy` manifest, and scans huge files in linear time.
- `missing-meta-tags` checks only real entry pages (not email templates or generated docs) and accepts a Next.js `opengraph-image` file.
- `cors-wildcard` gives Supabase edge functions a fix that names their `corsHeaders`.
- `--html` into a missing folder prints a clear message instead of a stack trace.
- `--demo` deletes the temporary copy of the demo app when it finishes.

## [0.1.0] - 2026-11-25

### Added

- Eight built-in checks for security, reliability
  and launch readiness.
- Terminal report cards for displaying scan results.
- HTML report cards for viewing scan results.
- `--json` flag for JSON output.
- `--ignore` flag for ignoring specific checks.
- `--fail-on` flag for controlling exit behavior.
- `--demo` flag for running the demonstration scan.
- Inline `preflight-ignore` comments for suppressing
  individual findings.
- Claude Code `/preflight` command.
