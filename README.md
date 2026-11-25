<div align="center">

# ✈️ Preflight

**Is your vibe-coded app ready to launch? Find out in one command.**

Preflight scans your project for leaked keys, open databases, unverified payments and missing launch basics, then gives you a report card with a fix for every finding.

[![License: MIT](https://img.shields.io/badge/license-MIT-34d399.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-38bdf8.svg)](package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-fbbf24.svg)](CONTRIBUTING.md)

![Preflight report card](docs/assets/report-card.png)

</div>

```bash
npx vibe-preflight
```

No install, no account, no network calls. Your code never leaves your machine.

## Why

AI tools make it easy to build an app in a weekend, and just as easy to ship it with your Stripe secret key in the browser bundle or a Supabase table anyone can read. Preflight checks for the mistakes that hurt most after launch, before you launch.

## Try it on a broken app first

```bash
npx vibe-preflight --demo
```

Scans a deliberately broken demo app (every secret is fake) so you can see what a failing report looks like.

## What it checks

10 checks today, across security, reliability and launch basics. See [all checks](docs/rules.md).

| | |
|---|---|
| 🔑 Live secrets in client code | 🗄️ Supabase tables without row-level security |
| 📄 `.env` files that can be committed | 💳 Stripe webhooks without signature checks |
| 🌍 CORS open to every website | 🚨 No error monitoring |
| 🔒 No privacy policy | 🔗 Missing title, description or share image |

## Options

```bash
npx vibe-preflight [path]          # scan a folder (default: current folder)
npx vibe-preflight --html          # also write a shareable preflight-report.html
npx vibe-preflight --json          # machine-readable output
npx vibe-preflight --ignore a,b    # skip checks by id
npx vibe-preflight --fail-on warning   # exit code policy: critical (default) | warning | never
```

Silence a finding that points at a line with `// preflight-ignore <check-id>` on that line or the line above. For findings about a whole file or project (for example a missing privacy page), skip the check with `--ignore <check-id>`.

## Use it in CI

```yaml
- run: npx vibe-preflight --fail-on critical
```

The command exits with code 1 when a finding reaches the `--fail-on` level, so a leaked key blocks the merge.

## Use it inside Claude Code

Preflight ships as a Claude Code plugin with a `/preflight` command that runs the scan, explains the results and offers to fix critical issues one at a time, asking before every change.

In Claude Code, run:

```text
/plugin marketplace add erdellll/preflight
/plugin install preflight@preflight
```

Then type `/preflight` in any project.

## Add a check in 10 minutes

Every check is one small file plus two example folders, one it must flag and one it must leave alone. No build step, no dependencies. Read [CONTRIBUTING.md](CONTRIBUTING.md), or pick an issue labelled [`good first issue`](https://github.com/erdellll/preflight/issues?q=is%3Aopen+label%3A%22good+first+issue%22).

## Not a security audit

Preflight catches common, high-impact mistakes with fast pattern checks. A clean report means none of its checks fired, not that your app is secure. Use it as a seatbelt, not a substitute for a review.

## License

[MIT](LICENSE). Free for any use.

## Contributors

Thanks to everyone who has made Preflight better! 💛

<a href="https://github.com/erdellll/preflight/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=erdellll/preflight" alt="Preflight contributors" />
</a>