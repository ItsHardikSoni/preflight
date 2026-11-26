import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { run } from '../src/run.js';
import { loadRules } from '../src/rules/index.js';

const root = fileURLToPath(new URL('./fixtures/ignore/', import.meta.url));
const fakeRule = {
  id: 'fake', title: 'Fake', category: 'security', severity: 'warning',
  check: (project) => project.lines('app.js').flatMap((l, i) => (l.includes('BAD') ? [{ file: 'app.js', line: i + 1, message: 'bad', fix: 'fix it' }] : [])),
};

test('run honours preflight-ignore on the same and previous line', async () => {
  const report = await run(root, { rules: [fakeRule] });
  assert.deepEqual(report.results.map((x) => x.line), [1]);
  assert.equal(report.results[0].ruleId, 'fake');
  assert.equal(report.results[0].severity, 'warning');
  assert.equal(report.rulesRun, 1);
  assert.equal(report.score, 95);
});

test('run honours --ignore', async () => {
  const report = await run(root, { rules: [fakeRule], ignore: ['fake'] });
  assert.equal(report.results.length, 0);
});

test('loadRules skips index and underscore files and sorts by id', async () => {
  const rules = await loadRules();
  const ids = rules.map((x) => x.id);
  assert.deepEqual(ids, [...ids].sort());
  assert.ok(!ids.includes('_template'));
});

// A finding with no line - a committed .env, a webhook with no signature check - could only be
// silenced with --ignore, not with the comment the line-level ones use (#16).
const fileRule = {
  id: 'filelevel', title: 'File level', category: 'security', severity: 'warning',
  check: (project) => (project.files.includes('app.js')
    ? [{ file: 'app.js', message: 'file level', fix: 'fix it' }]
    : []),
};

test('run honours preflight-ignore at the top of a file for a file-level finding', async () => {
  const withComment = await import('node:fs/promises').then(async ({ mkdtemp, writeFile }) => {
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');
    const dir = await mkdtemp(path.join(tmpdir(), 'preflight-ignore-file-'));
    await writeFile(path.join(dir, 'app.js'), '// preflight-ignore filelevel\nconst a = 1;\n');
    return run(dir, { rules: [fileRule] });
  });
  assert.deepEqual(withComment.results, [], 'the comment silences it');

  const withoutComment = await import('node:fs/promises').then(async ({ mkdtemp, writeFile }) => {
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');
    const dir = await mkdtemp(path.join(tmpdir(), 'preflight-ignore-file-'));
    await writeFile(path.join(dir, 'app.js'), 'const a = 1;\n');
    return run(dir, { rules: [fileRule] });
  });
  assert.equal(withoutComment.results.length, 1, 'and without it the finding stays');
});
