# JSON Output

Preflight supports machine-readable JSON output through the `--json` option. This is useful when integrating Preflight with CI pipelines, scripts, or other tools that need to process scan results automatically.

## Generate JSON Output

Run the following command from your project:

```bash
npx vibe-preflight --json
```

To see an example using the demo application:

```bash
node bin/preflight.js --demo --json --fail-on never
```

## Output Structure

The JSON report contains the following top-level fields:

| Field | Description |
|---|---|
| `root` | Absolute path of the scanned project |
| `score` | Overall project score from 0 to 100 |
| `grade` | Project grade from A to F |
| `counts` | Number of critical, warning and info findings |
| `byCategory` | Findings grouped by category |
| `results` | Individual findings detected during the scan |
| `rulesRun` | Number of checks executed |
| `filesScanned` | Number of project files scanned |

## Understanding a Finding

Each entry in `results` describes an issue detected by Preflight.

A finding can contain:

- `ruleId`: Unique identifier of the check.
- `title`: Short description of the issue.
- `category`: Category such as security, reliability or launch.
- `severity`: Issue severity (`critical`, `warning` or `info`).
- `file`: File where the issue was detected, when applicable.
- `line`: Line number, when applicable.
- `message`: Explanation of the finding.
- `fix`: Suggested solution.

File and line information are optional and depend on the check.

## Practical Example

You can use `jq` to extract specific information from the JSON report.

Get the project score:

```bash
npx vibe-preflight --json | jq '.score'
```

Get the project grade:

```bash
npx vibe-preflight --json | jq '.grade'
```

Display the number of critical findings:

```bash
npx vibe-preflight --json | jq '.counts.critical'
```

Display all detected findings:

```bash
npx vibe-preflight --json | jq '.results'
```

## Exit Codes

Preflight also returns an exit code based on the configured `--fail-on` level.

| Exit code | Meaning |
|---|---|
| `0` | No finding reached the configured failure level |
| `1` | A finding reached the configured failure level |
| `2` | Invalid arguments or an invalid project path |

Use `--fail-on never` when you want to generate a report without failing based on findings.

## Use Cases

JSON output is particularly useful for:

- Automating project checks in CI/CD pipelines.
- Extracting scores and findings using tools such as `jq`.
- Integrating Preflight with other development tools.
- Processing scan results programmatically.

For the complete list of available checks, see [Checks](rules.md).