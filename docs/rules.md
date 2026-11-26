# Checks

Every check lives in `src/rules/<id>.js`. Want one that isn't here? [Add it](../CONTRIBUTING.md), it's usually under 40 lines.

| Check | Category | Severity | Flags |
|---|---|---|---|
| `env-file-committed` | Security | critical | A `.env` file (not `.env.example`) that `.gitignore` doesn't cover |
| `secret-in-client` | Security | critical | Live Stripe, Anthropic, OpenAI, AWS or Supabase `service_role` keys in code that ships to the browser or app |
| `supabase-rls-disabled` | Security | critical | A SQL migration that creates a table without enabling row-level security |
| `stripe-webhook-unverified` | Security | critical | A Stripe webhook handler that never verifies the signature with `constructEvent` |
| `cors-wildcard` | Security | warning | `cors()` with no options, or `Access-Control-Allow-Origin: *` |
| `no-error-monitoring` | Reliability | info | A JavaScript app with no Sentry, PostHog, Bugsnag, Rollbar or LogRocket |
| `no-privacy-policy` | Launch basics | warning | An app that signs users up or collects emails but has no privacy page |
| `missing-meta-tags` | Launch basics | warning | An `index.html` or Next.js root layout without a title, description or share image |
| `missing-favicon` | Launch basics | info | An `index.html` or Next.js root layout with no `favicon.ico`, `icon.png`, `app/icon.*` or `<link rel="icon">` |
| `missing-robots-txt` | Launch basics | info | An `index.html`, Next.js root layout or `pages/_app` with no `robots.txt` (root or `public/`) and no `app/robots.*` route |
| `missing-404-page` | Launch basics | info | A Next.js, Astro or SvelteKit project with no custom 404 page |

## Scoring

Every scan starts at 100. Each **critical** finding costs 15 points, each **warning** 5 and each **info** 1. Grades: **A** 90+, **B** 80+, **C** 70+, **D** 50+, **F** below 50.

## Silencing a finding

Add a comment on the line, or the line above:

```js
// preflight-ignore cors-wildcard
app.use(cors());
```

This works for findings that point at a line. Findings about a whole file or project (`env-file-committed`, `stripe-webhook-unverified`, `no-error-monitoring`, `no-privacy-policy`, `missing-meta-tags`, `missing-favicon`, `missing-robots-txt`) are skipped with `--ignore` instead:

```bash
npx vibe-preflight --ignore no-error-monitoring,no-privacy-policy
```
