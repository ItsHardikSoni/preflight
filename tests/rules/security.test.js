import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtureProject } from '../helpers.js';
import envFile from '../../src/rules/env-file-committed.js';
import secret from '../../src/rules/secret-in-client.js';
import rls from '../../src/rules/supabase-rls-disabled.js';
import webhook from '../../src/rules/stripe-webhook-unverified.js';
import { isClientFile } from '../../src/rules/_client-paths.js';

test('env-file-committed flags .env with no gitignore', async () => {
  const f = envFile.check(await fixtureProject('env-file-committed', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, '.env');
  assert.ok(f[0].fix);
});

test('env-file-committed is quiet when ignored, and for .env.example', async () => {
  assert.deepEqual(envFile.check(await fixtureProject('env-file-committed', 'good')), []);
  assert.deepEqual(envFile.check(await fixtureProject('env-file-committed', 'good-local')), []);
});

test('env-file-committed never flags .env.vault', async () => {
  assert.deepEqual(
    envFile.check(await fixtureProject('env-file-committed', 'good-vault')),
    [],
  );
});

test('env-file-committed still flags a private .env file', async () => {
  const findings = envFile.check(
    await fixtureProject('env-file-committed', 'bad-vault'),
  );

  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, '.env');
});

test('env-file-committed skips public-only production variables', async () => {
  assert.deepEqual(
    envFile.check(await fixtureProject('env-file-committed', 'good-public')),
    [],
  );
});

test('env-file-committed flags production files containing private variables', async () => {
  const findings = envFile.check(
    await fixtureProject('env-file-committed', 'bad-public'),
  );

  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, '.env.production');
});

test('secret-in-client flags a live key in client code', async () => {
  const f = secret.check(await fixtureProject('secret-in-client', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'src/lib/stripe.ts');
  assert.equal(f[0].line, 2);
  assert.ok(!f[0].message.includes('51Hdemo'), 'never echo the secret itself');
});

test('secret-in-client is quiet in server-only code and for publishable keys', async () => {
  assert.deepEqual(secret.check(await fixtureProject('secret-in-client', 'good')), []);
});

test('isClientFile splits client and server paths', () => {
  for (const p of ['src/lib/a.ts', 'app/page.tsx', 'components/B.jsx', 'index.html', 'public/app.js', 'lib/x.ts']) assert.ok(isClientFile(p), p);
  for (const p of ['api/x.ts', 'server/y.js', 'supabase/functions/f/index.ts', 'pages/api/z.ts', 'app/api/w/route.ts', 'scripts/s.js', 'src/db.server.ts', 'README.md']) assert.ok(!isClientFile(p), p);
});

test('supabase-rls-disabled flags a table without RLS at its create line', async () => {
  const f = rls.check(await fixtureProject('supabase-rls-disabled', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'supabase/migrations/001_init.sql');
  assert.equal(f[0].line, 2);
  assert.match(f[0].message, /profiles/);
});

test('supabase-rls-disabled is quiet when RLS is enabled (any case)', async () => {
  assert.deepEqual(rls.check(await fixtureProject('supabase-rls-disabled', 'good')), []);
});

test('stripe-webhook-unverified flags a handler without constructEvent', async () => {
  const f = webhook.check(await fixtureProject('stripe-webhook-unverified', 'bad'));
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'app/api/stripe/webhook/route.ts');
});

test('stripe-webhook-unverified is quiet when verified or not a webhook', async () => {
  assert.deepEqual(webhook.check(await fixtureProject('stripe-webhook-unverified', 'good')), []);
});
