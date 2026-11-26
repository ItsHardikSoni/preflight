/**
 * Only a page a visitor can land on: the root index.html, or one directly under public/ or src/.
 * `supabase/templates/index.html` is the body of a confirmation email and `public/docs/index.html`
 * is generated documentation, so neither is the entry page any of this advice is about (#21).
 */
const HTML_ENTRY = /^(?:index\.html|(?:public|src)\/index\.html)$/;
const LAYOUT = /^(?:src\/)?app\/layout\.(?:tsx|jsx|js|ts)$/;
/** Next.js generates the share image from this file rather than from an `openGraph` block. */
const OPENGRAPH_FILE = /(?:^|\/)app\/opengraph-image\.(?:png|jpe?g|gif|webp|avif|svg|tsx?|jsx?)$/;

function missingInHtml(text) {
  const missing = [];
  if (!/<title>[^<]+<\/title>/i.test(text)) missing.push('<title>');
  if (!/<meta[^>]+name=["']description["']/i.test(text)) missing.push('meta description');
  if (!/<meta[^>]+property=["']og:image["']/i.test(text)) missing.push('og:image');
  return missing;
}

function missingInLayout(text) {
  if (!/export\s+(?:const\s+metadata|(?:async\s+)?function\s+generateMetadata)/.test(text)) return ['metadata export'];
  const missing = [];
  if (!/\btitle\s*:/.test(text)) missing.push('title');
  if (!/\bdescription\s*:/.test(text)) missing.push('description');
  if (!/\bopenGraph\s*:/.test(text)) missing.push('openGraph image');
  return missing;
}

export default {
  id: 'missing-meta-tags',
  title: 'Missing title, description or share image',
  category: 'launch',
  severity: 'warning',
  check(project) {
    const findings = [];
    // A Next.js app can satisfy the share image with a file next to the layout, which the layout's
    // own text cannot show.
    const hasOpengraphFile = project.files.some((f) => OPENGRAPH_FILE.test(f));
    for (const file of project.files) {
      const isHtml = HTML_ENTRY.test(file) && !file.includes('/dist/');
      const isLayout = LAYOUT.test(file);
      if (!isHtml && !isLayout) continue;
      const missing = isHtml
        ? missingInHtml(project.read(file))
        : missingInLayout(project.read(file)).filter((m) => !(m === 'openGraph image' && hasOpengraphFile));
      if (missing.length) {
        findings.push({
          file,
          message: `Missing ${missing.join(', ')}: search results and link previews will look empty or broken.`,
          fix: 'Add a page title, a one-sentence meta description and an og:image (1200x630) so shared links get a proper preview.',
        });
      }
    }
    return findings;
  },
};
