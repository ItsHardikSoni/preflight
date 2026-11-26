import { readdir, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { isGitignored } from './rules/_gitignore.js';

/** Directories that are never scanned: dependencies, VCS data and build output. */
export const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.vercel',
  '.svelte-kit', '.nuxt', '.turbo', '.cache', '.expo', 'Pods', 'DerivedData', '.output', '.parcel-cache',
  '.venv', 'venv', '__pycache__', 'vendor', 'target', '.gradle', '.dart_tool', '.terraform', 'bower_components', '.yarn',
]);

/** Files larger than this are skipped (bundles, dumps, generated code). */
export const MAX_FILE_BYTES = 1024 * 1024;

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.icns', '.bmp', '.tiff', '.psd',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.zip', '.gz', '.tgz', '.bz2', '.xz', '.7z', '.rar', '.jar',
  '.mp3', '.mp4', '.mov', '.wav', '.ogg', '.webm', '.m4a', '.avi',
  '.pdf', '.exe', '.dll', '.so', '.dylib', '.bin', '.wasm', '.sqlite', '.db', '.lockb',
]);

async function walk(root, dir, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    // readdir reports a symlink as neither a file nor a directory unless it is dereferenced, so
    // both branches below skip one on purpose: following links can loop (a folder linked into
    // itself) and can read outside the project, and a scan is meant to report on the tree it was
    // given. A symlinked `.env` is therefore not checked (#24).
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(root, full, out);
    } else if (entry.isFile()) {
      if (BINARY_EXT.has(path.extname(entry.name).toLowerCase())) continue;
      try {
        if ((await stat(full)).size > MAX_FILE_BYTES) continue;
      } catch {
        continue;
      }
      out.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
}

/**
 * Builds the view of a project that every rule receives.
 * @param {string} root
 */
export async function loadProject(root) {
  const files = [];
  await walk(root, root, files);
  files.sort();
  const cache = new Map();
  const read = (file) => {
    if (!cache.has(file)) {
      let text = '';
      try {
        text = readFileSync(path.join(root, file), 'utf8');
      } catch {
        text = '';
      }
      cache.set(file, text);
    }
    return cache.get(file);
  };
  const gitignore = files.includes('.gitignore')
    ? read('.gitignore').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    : [];
  // .gitignore files that apply: parents up to the repo root (outermost first), then nested ones.
  const sources = [];
  const parents = [];
  for (let dir = path.dirname(path.resolve(root)); ; dir = path.dirname(dir)) {
    if (existsSync(path.join(dir, '.gitignore'))) parents.unshift(dir);
    if (existsSync(path.join(dir, '.git')) || path.dirname(dir) === dir) break;
  }
  if (existsSync(path.join(root, '.git'))) parents.length = 0;
  const parse = (text) => text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  for (const dir of parents) {
    let text = '';
    try { text = readFileSync(path.join(dir, '.gitignore'), 'utf8'); } catch { text = ''; }
    sources.push({ base: path.relative(dir, path.resolve(root)).split(path.sep).join('/'), patterns: parse(text) });
  }
  for (const f of files.filter((f) => f === '.gitignore' || f.endsWith('/.gitignore'))) {
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    sources.push({ prefix: dir, patterns: parse(read(f)) });
  }
  const isIgnored = (file) => {
    let ignored = false;
    for (const src of sources) {
      let rel;
      if ('base' in src) rel = src.base ? `${src.base}/${file}` : file;
      else if (!src.prefix) rel = file;
      else if (file.startsWith(src.prefix + '/')) rel = file.slice(src.prefix.length + 1);
      else continue;
      const verdict = isGitignored(rel, src.patterns, null);
      if (verdict !== null) ignored = verdict;
    }
    return ignored;
  };
  return {
    root,
    isIgnored,
    files,
    read,
    lines: (file) => read(file).split(/\r?\n/),
    has: (pattern) => files.some((f) => pattern.test(f)),
    gitignore,
  };
}
