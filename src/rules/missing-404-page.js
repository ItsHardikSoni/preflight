
import { existsSync } from 'node:fs';
import path from 'node:path';

const APP_LAYOUT = /^((?:.*\/)?)((?:src\/)?app)\/layout\.(?:tsx|jsx|js|ts)$/;
const PAGES_APP = /^((?:.*\/)?)(?:src\/)?pages\/_app\.(?:tsx|jsx|js|ts)$/;
const ASTRO_CONFIG = /^(?:.*\/)?astro\.config\.(?:mjs|js|cjs|ts|mts|cts)$/;
const SVELTE_CONFIG = /^(?:.*\/)?svelte\.config\.(?:js|cjs|ts|mjs)$/;

const EXTENSIONS = ['tsx', 'jsx', 'js', 'ts'];

const anyExists = (root, paths) =>
  paths.some((file) => existsSync(path.join(root, file)));

export default {
  id: 'missing-404-page',
  title: 'Custom 404 page is missing',
  category: 'launch',
  severity: 'info',

  check(project) {
    const findings = [];
    const files = project.files;

    const hasNextApp = files.some((file) => APP_LAYOUT.test(file));
    const hasNextPages = files.some((file) => PAGES_APP.test(file));
    const hasAstro = files.some((file) => ASTRO_CONFIG.test(file));
    const hasSvelteKit = files.some((file) => SVELTE_CONFIG.test(file));

    if (hasNextApp) {
      for (const file of files) {
        const match = APP_LAYOUT.exec(file);
        if (!match) continue;

        const [, dir, appDir] = match;
        const candidates = EXTENSIONS.map(
          (ext) => `${dir}${appDir}/not-found.${ext}`,
        );

        if (!anyExists(project.root, candidates)) {
          findings.push({
            file,
            message: 'Next.js App Router has no custom 404 page.',
            fix: 'Add app/not-found.tsx (or the equivalent file in your app directory).',
          });
        }
      }
    }

    if (hasNextPages) {
      for (const file of files) {
        const match = PAGES_APP.exec(file);
        if (!match) continue;

        const [, dir] = match;
        const candidates = EXTENSIONS.map(
          (ext) => `${dir}pages/404.${ext}`,
        );

        if (!anyExists(project.root, candidates)) {
          findings.push({
            file,
            message: 'Next.js Pages Router has no custom 404 page.',
            fix: 'Add pages/404.tsx (or the equivalent file in your pages directory).',
          });
        }
      }
    }

    if (hasAstro && !anyExists(project.root, ['src/pages/404.astro', 'pages/404.astro'])) {
      findings.push({
        file: files.find((file) => ASTRO_CONFIG.test(file)),
        message: 'Astro project has no custom 404 page.',
        fix: 'Add src/pages/404.astro to create a custom 404 page.',
      });
    }

    if (hasSvelteKit && !anyExists(project.root, ['src/routes/+error.svelte'])) {
      findings.push({
        file: files.find((file) => SVELTE_CONFIG.test(file)),
        message: 'SvelteKit project has no custom error page.',
        fix: 'Add src/routes/+error.svelte to provide a custom error page.',
      });
    }

    return findings;
  },
};
