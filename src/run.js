import { loadProject } from './project.js';
import { loadRules } from './rules/index.js';
import { score } from './score.js';

function ignoredInline(project, finding, ruleId) {
  if (!finding.file) return false;
  const lines = project.lines(finding.file);
  const token = `preflight-ignore ${ruleId}`;
  // A finding with no line is about the file as a whole (a committed .env, an unverified webhook),
  // so the comment silences it from the head of the file rather than from one line (#16).
  if (!finding.line) return lines.slice(0, FILE_LEVEL_IGNORE_LINES).some((l) => l?.includes(token));
  return [lines[finding.line - 1], lines[finding.line - 2]].some((l) => l?.includes(token));
}

/** How far into a file a `preflight-ignore` is still read for a finding that has no line. */
const FILE_LEVEL_IGNORE_LINES = 5;

/**
 * Scans a project and returns the full report.
 * @param {string} root
 * @param {{ ignore?: string[], rules?: object[] }} [opts]
 */
export async function run(root, opts = {}) {
  const project = await loadProject(root);
  const rules = opts.rules ?? (await loadRules());
  const ignore = new Set(opts.ignore ?? []);
  // An id that matches no rule is almost always a typo, and today it silently ignores nothing (#19).
  // Reported rather than thrown: the rest of the scan is still useful.
  const known = new Set(rules.map((r) => r.id));
  const unknownIgnore = [...ignore].filter((id) => !known.has(id));
  const results = [];
  for (const rule of rules) {
    if (ignore.has(rule.id)) continue;
    for (const finding of rule.check(project)) {
      if (ignoredInline(project, finding, rule.id)) continue;
      results.push({ ruleId: rule.id, title: rule.title, category: rule.category, severity: rule.severity, ...finding });
    }
  }
  return {
    root,
    results,
    ...score(results),
    rulesRun: rules.length,
    filesScanned: project.files.length,
    ...(unknownIgnore.length ? { unknownIgnore } : {}),
  };
}
