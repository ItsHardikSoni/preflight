const ENV_FILE = /(?:^|\/)\.env(?:\.[\w.-]+)?$/;
const SAFE = /\.?(?:example|sample|template|defaults|dist)$/;
const PUBLIC_PREFIX = /^(?:VITE_|NEXT_PUBLIC_)/;

function isPublicOnly(content) {
  const keys = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1])
    .filter(Boolean);

  return keys.length > 0 && keys.every((key) => PUBLIC_PREFIX.test(key));
}

export default {
  id: 'env-file-committed',
  title: '.env file is not git-ignored',
  category: 'security',
  severity: 'critical',
  check(project) {
    return project.files
      .filter((file) => {
        if (!ENV_FILE.test(file) || SAFE.test(file)) return false;

        // Encrypted dotenv-vault files are intended to be committed.
        if (/(?:^|\/)\.env\.vault$/.test(file)) return false;

        // Only flag files that are not ignored by Git.
        if (project.isIgnored(file)) return false;

        // Public-only environment files do not contain private secrets.
        if (isPublicOnly(project.read(file))) return false;

        return true;
      })
      .map((file) => ({
        file,
        message: `${file} holds secrets but .gitignore does not cover it, so it can be committed and pushed.`,
        fix: 'Add `.env*` (and `!.env.example`) to .gitignore, run `git rm --cached ' + file + '`, and rotate any keys that were pushed.',
      }));
  },
};
