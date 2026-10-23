#!/usr/bin/env node
/**
 * Enforces the project's 250-line ceiling on authored source files.
 *
 * Atomic Design keeps each file focused on a single responsibility; a hard line
 * budget makes that promise measurable. The limit applies to every `.js`/`.jsx`
 * file under `src/`. If a file legitimately cannot be split, add it to
 * `EXEMPTIONS` with a short reason so the exception is deliberate and visible.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const MAX_LINES = 250;
const SOURCE_ROOT = join(process.cwd(), 'src');

// Files that are allowed to exceed MAX_LINES, with the reason it is justified.
const EXEMPTIONS = new Map([
  ['src/hooks/usePhotoCapture.js', 'Capture session glue: the mutable session bundle would scatter if split further.'],
]);

function walk(directory) {
  const entries = [];
  for (const name of readdirSync(directory)) {
    const fullPath = join(directory, name);
    if (statSync(fullPath).isDirectory()) entries.push(...walk(fullPath));
    else if (/\.(js|jsx)$/.test(name)) entries.push(fullPath);
  }
  return entries;
}

function countLines(file) {
  const contents = readFileSync(file, 'utf8');
  if (contents.length === 0) return 0;
  return contents.replace(/\n$/, '').split('\n').length;
}

const offenders = [];
for (const file of walk(SOURCE_ROOT)) {
  const relativePath = relative(process.cwd(), file);
  if (EXEMPTIONS.has(relativePath)) continue;
  const lines = countLines(file);
  if (lines > MAX_LINES) offenders.push({ relativePath, lines });
}

if (offenders.length === 0) {
  console.log(`✓ All source files are within ${MAX_LINES} lines.`);
  process.exit(0);
}

console.error(`✗ ${offenders.length} file(s) exceed the ${MAX_LINES}-line limit:\n`);
for (const { relativePath, lines } of offenders.sort((a, b) => b.lines - a.lines)) {
  console.error(`  ${String(lines).padStart(4)}  ${relativePath}`);
}
console.error('\nSplit the file, or add a justified entry to EXEMPTIONS in scripts/check-file-length.js.');
process.exit(1);
