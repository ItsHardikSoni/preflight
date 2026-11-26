import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtureProject } from '../helpers.js';
import cors from '../../src/rules/cors-wildcard.js';
import monitoring from '../../src/rules/no-error-monitoring.js';
import privacy from '../../src/rules/no-privacy-policy.js';
import meta from '../../src/rules/missing-meta-tags.js';
import favicon from '../../src/rules/missing-favicon.js';
import robots from '../../src/rules/missing-robots-txt.js';
import notFound from '../../src/rules/missing-404-page.js';

test('cors-wildcard flags cors() with no options and a * header', async () => {
  const f = cors.check(await fixtureProject('cors-wildcard', 'bad'));
  assert.deepEqual(f.map((x) => `${x.file}:${x.line}`).sort(), ['api/x.ts:2', 'server.js:2']);
  assert.equal(cors.severity, 'warning');
});

test('cors-wildcard is quiet with an origin list', async () => {
  assert.deepEqual(cors.check(await fixtureProject('cors-wildcard', 'good')), []);
});

test('missing-404-page flags a Next.js App Router without a not-found page', async () => {
  const f = notFound.check(await fixtureProject('missing-404-page', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'app/layout.tsx');
  assert.equal(notFound.category, 'launch');
  assert.equal(notFound.severity, 'info');
});

test('missing-404-page is quiet with a Next.js not-found page', async () => {
  assert.deepEqual(
    notFound.check(await fixtureProject('missing-404-page', 'good')),
    [],
  );
});

test('missing-404-page flags a Next.js Pages Router without a 404 page', async () => {
  const f = notFound.check(await fixtureProject('missing-404-page', 'bad-pages'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'src/pages/_app.tsx');
});

test('missing-404-page is quiet with a Next.js Pages Router 404 page', async () => {
  assert.deepEqual(
    notFound.check(await fixtureProject('missing-404-page', 'good-pages')),
    [],
  );
});

test('missing-404-page flags an Astro project without a 404 page', async () => {
  const f = notFound.check(await fixtureProject('missing-404-page', 'bad-astro'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'astro.config.mjs');
});

test('missing-404-page is quiet with an Astro 404 page', async () => {
  assert.deepEqual(
    notFound.check(await fixtureProject('missing-404-page', 'good-astro')),
    [],
  );
});

test('missing-404-page flags a SvelteKit project without an error page', async () => {
  const f = notFound.check(await fixtureProject('missing-404-page', 'bad-svelte'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'svelte.config.js');
});

test('missing-404-page is quiet with a SvelteKit error page', async () => {
  assert.deepEqual(
    notFound.check(await fixtureProject('missing-404-page', 'good-svelte')),
    [],
  );
});

test('missing-404-page stays quiet for non-web projects', () => {
  const findings = notFound.check({
    root: process.cwd(),
    files: ['src/main.java', 'src/database/connection.java'],
  });

  assert.deepEqual(findings, []);
});

test('no-error-monitoring flags a JS app with no monitoring dependency', async () => {
  const f = monitoring.check(await fixtureProject('no-error-monitoring', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'package.json');
  assert.equal(monitoring.category, 'reliability');
  assert.equal(monitoring.severity, 'info');
});

test('no-error-monitoring is quiet with Sentry, or when there is no package.json', async () => {
  assert.deepEqual(monitoring.check(await fixtureProject('no-error-monitoring', 'good')), []);
  assert.deepEqual(monitoring.check(await fixtureProject('no-error-monitoring', 'good-no-js')), []);
});

test('no-privacy-policy flags an app with sign-up and no privacy page', async () => {
  const f = privacy.check(await fixtureProject('no-privacy-policy', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(privacy.category, 'launch');
});

test('no-privacy-policy is quiet with a privacy page or without auth', async () => {
  assert.deepEqual(privacy.check(await fixtureProject('no-privacy-policy', 'good')), []);
  assert.deepEqual(privacy.check(await fixtureProject('no-privacy-policy', 'good-no-auth')), []);
});

test('missing-meta-tags names the missing tags', async () => {
  const f = meta.check(await fixtureProject('missing-meta-tags', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'index.html');
  assert.match(f[0].message, /description/);
  assert.match(f[0].message, /og:image/);
  assert.doesNotMatch(f[0].message, /title/);
});

test('missing-meta-tags is quiet for complete HTML and Next.js metadata', async () => {
  assert.deepEqual(meta.check(await fixtureProject('missing-meta-tags', 'good')), []);
  assert.deepEqual(meta.check(await fixtureProject('missing-meta-tags', 'good-next')), []);
});

test('missing-favicon flags an index.html with no icon', async () => {
  const f = favicon.check(await fixtureProject('missing-favicon', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'index.html');
  assert.equal(favicon.category, 'launch');
  assert.equal(favicon.severity, 'info');
});

test('missing-favicon is quiet with public/favicon.ico, a <link rel="icon"> or Next.js app/favicon.ico', async () => {
  assert.deepEqual(favicon.check(await fixtureProject('missing-favicon', 'good')), []);
  assert.deepEqual(favicon.check(await fixtureProject('missing-favicon', 'good-vite')), []);
  assert.deepEqual(favicon.check(await fixtureProject('missing-favicon', 'good-next')), []);
});

test('missing-robots-txt flags a Vite app with no public/robots.txt', async () => {
  const f = robots.check(await fixtureProject('missing-robots-txt', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'index.html');
  assert.equal(robots.category, 'launch');
  assert.equal(robots.severity, 'info');
});

test('missing-robots-txt is quiet with public/robots.txt, Next.js app/robots.ts, or no website', async () => {
  assert.deepEqual(robots.check(await fixtureProject('missing-robots-txt', 'good')), []);
  assert.deepEqual(robots.check(await fixtureProject('missing-robots-txt', 'good-next')), []);
  assert.deepEqual(robots.check(await fixtureProject('missing-robots-txt', 'good-backend')), []);
});

// The `[^>]+` in COLLECTS_DATA backtracks over every `<input ` run that has no closing `>`, so a
// file full of them costs time quadratic in its length (#23): 20,000 copies took over 1.5 s here,
// and a 120,000-copy file took over a minute. The bound makes the scan linear.
test('no-privacy-policy scans a pathological file of unclosed input tags quickly', () => {
  const pathological = '<input '.repeat(120_000);
  const project = {
    has: () => false,
    files: ['app/page.tsx'],
    read: () => pathological,
  };
  const started = performance.now();
  const findings = privacy.check(project);
  const elapsed = performance.now() - started;
  assert.ok(
    elapsed < 1000,
    `took ${Math.round(elapsed)} ms on 120,000 unclosed tags; the pattern is backtracking`,
  );
  // It still finds nothing, because no tag reaches type="email".
  assert.deepEqual(findings, []);
});

test('no-privacy-policy still recognises an email input inside a long tag', () => {
  // A real tag can carry many attributes; the bound has to be generous enough for that.
  const attributes = Array.from({ length: 40 }, (_, i) => `data-a${i}="v"`).join(' ');
  const markup = `<input ${attributes} type="email" name="email">`;
  const findings = privacy.check({
    has: () => false,
    files: ['app/page.tsx'],
    read: () => markup,
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, 'app/page.tsx');
});

// The check asked whether any file path contains "privacy", so an iOS privacy manifest silenced it
// while a linked policy page did not count (#20).
test('no-privacy-policy counts a linked policy URL and ignores an xcprivacy manifest', () => {
  const signUp = 'supabase.auth.signUp({ email, password });';
  const link = '<a href="https://example.com/privacy-policy">Privacy</a>';

  const linked = {
    has: () => false,
    files: ['app/page.tsx'],
    read: () => `${signUp}\n${link}`,
  };
  assert.deepEqual(privacy.check(linked), [], 'a linked policy is a policy');

  const manifestOnly = {
    has: () => true,
    files: ['ios/PrivacyInfo.xcprivacy', 'app/page.tsx'],
    read: () => signUp,
  };
  const found = privacy.check(manifestOnly);
  assert.equal(found.length, 1, 'a privacy manifest is not a policy');
  assert.equal(found[0].file, 'app/page.tsx');

  const localPage = {
    has: () => true,
    files: ['app/privacy/page.tsx', 'app/page.tsx'],
    read: () => signUp,
  };
  assert.deepEqual(privacy.check(localPage), [], 'a local /privacy page still counts');
});

test('no-privacy-policy: the new fixtures behave as the rule says', async () => {
  const linked = await fixtureProject('no-privacy-policy', 'good-linked-policy');
  assert.deepEqual(privacy.check(linked), [], 'a linked policy URL counts');

  const manifest = await fixtureProject('no-privacy-policy', 'bad-apple-manifest');
  const found = privacy.check(manifest);
  assert.equal(found.length, 1, 'an xcprivacy manifest alone does not silence the check');
});

// Supabase's own edge-function template sets Access-Control-Allow-Origin: '*', so every function
// in supabase/functions/ was flagged with advice that does not fit that template (#22).
test('cors-wildcard names corsHeaders for a Supabase edge function, and keeps the finding', () => {
  const supabase = {
    has: () => false,
    files: ['supabase/functions/hello/index.ts'],
    lines: () => ["export const corsHeaders = { 'Access-Control-Allow-Origin': '*', };"],
    read: () => '',
  };
  const found = cors.check(supabase);
  assert.equal(found.length, 1, 'the finding stays');
  assert.match(found[0].fix, /corsHeaders/);
  assert.match(found[0].fix, /origin/i);

  const elsewhere = {
    has: () => false,
    files: ['src/server.ts'],
    lines: () => ["app.use(cors({ origin: '*' }));"],
    read: () => '',
  };
  const generic = cors.check(elsewhere);
  assert.equal(generic.length, 1);
  assert.doesNotMatch(generic[0].fix, /corsHeaders/, 'the generic advice stays generic');
});

// Every index.html counted as an entry page, so supabase/templates/ and public/docs/ were flagged;
// and Next.js's app/opengraph-image.png convention was not recognised at all (#21).
test('missing-meta-tags checks only entry pages, and accepts an opengraph-image file', () => {
  const layoutWithoutOpenGraph = 'export const metadata = { title: "x", description: "y" };';

  // supabase/templates/index.html is an email template, not a page a visitor lands on.
  const template = {
    files: ['supabase/templates/index.html'],
    read: () => '<html><body>Confirm your email</body></html>',
    has: () => false,
  };
  assert.deepEqual(meta.check(template), [], 'an email template is not an entry page');

  // public/docs/index.html is generated documentation, not the site's entry page.
  const docs = {
    files: ['public/docs/index.html'],
    read: () => '<html><body>Docs</body></html>',
    has: () => false,
  };
  assert.deepEqual(meta.check(docs), [], 'generated docs are not the entry page');

  // The root index.html is still checked.
  const root = {
    files: ['index.html'],
    read: () => '<html><head><title>t</title></head></html>',
    has: () => false,
  };
  const flagged = meta.check(root);
  assert.equal(flagged.length, 1);
  assert.match(flagged[0].message, /description/);
});

test('missing-meta-tags accepts app/opengraph-image.* as the share image', () => {
  const layout = {
    files: ['app/layout.tsx', 'app/opengraph-image.png'],
    read: (f) => (f === 'app/layout.tsx' ? 'export const metadata = { title: "x", description: "y" };' : ''),
    has: (re) => ['app/layout.tsx', 'app/opengraph-image.png'].some((f) => re.test(f)),
  };
  assert.equal(layout.read('app/layout.tsx'), 'export const metadata = { title: "x", description: "y" };');
  assert.deepEqual(meta.check(layout), [], 'the opengraph-image file satisfies the share image');
});
