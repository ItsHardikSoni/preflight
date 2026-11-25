# Contributing to Preflight

Thanks for helping! Preflight is built to make a first contribution easy: every check is one small file, there's no build step, and there are no dependencies to install.

## Add a check in 3 steps

1. **Copy the template.** `cp src/rules/_template.js src/rules/<your-check-id>.js`, then fill in `id`, `title`, `category` (`security`, `reliability` or `launch`), `severity` (`critical`, `warning` or `info`) and the `check(project)` function.
2. **Add two example folders.**
   - `tests/fixtures/<your-check-id>/bad/`: a tiny project your check **must** flag.
   - `tests/fixtures/<your-check-id>/good/`: a similar project it **must not** flag.
   - Need a fake secret? Write a placeholder such as `__STRIPE_LIVE__` (see `src/demo.js`). The tests fill in an obviously fake key, so the repo never contains anything that looks like a real one.
3. **Run the tests.** `node --test`. The contract tests check your rule automatically. Add a focused test in `tests/rules/` if your check has edge cases.

Then add a row to [docs/rules.md](docs/rules.md), update the check count in the README, and open a PR.

## What makes a good check

- **Every finding has a fix.** One sentence that tells the person exactly what to do.
- **Quiet on good code.** A false positive costs more trust than a missed issue. When in doubt, be narrower.
- **No network, no AI calls, no new dependencies.** Checks read files and nothing else.
- **Fast.** Use `project.files`, `project.read(file)` and `project.lines(file)`. Don't spawn processes.
- **Never print a secret.** Say what kind of key was found and where, not the key itself.

## Picking something to work on

Look for issues labelled [`good first issue`](https://github.com/erdellll/preflight/issues?q=is%3Aopen+label%3A%22good+first+issue%22). Each one names the check id, what it should flag, a good and a bad example, and when it's done. Comment that you're taking it so nobody duplicates your work.

Run `npm run demo` to see a full report on the broken demo app.

## Reporting a false positive

Open a "False positive" issue with the smallest snippet that triggers it. Those get fixed first.

## Pull requests

- One check or one fix per PR.
- `node --test` passes on Node 20 and 22 (CI runs both).
- Use [Conventional Commits](https://www.conventionalcommits.org/) titles: `feat(rules): add firebase-rules-open`, `fix(rules): ...`, `docs: ...`.
- AI-assisted contributions are welcome. Please say so in the PR and make sure you understand every line you submit.

Reviews aim to happen within a day or two. Thanks for making launches safer!
