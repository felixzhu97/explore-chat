#!/usr/bin/env node
// Fails when a relative link in a tracked Markdown file points at a missing file.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

const files = execFileSync('git', ['ls-files', '*.md'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const broken = [];
for (const file of files) {
  const absolute = resolve(ROOT, file);
  if (!existsSync(absolute)) continue;
  const text = readFileSync(absolute, 'utf8')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '');
  for (const [, target] of text.matchAll(LINK)) {
    if (/^([a-z][a-z0-9+.-]*:|#|<|\/|~)/i.test(target)) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    if (path && !existsSync(resolve(dirname(absolute), path))) {
      broken.push(`${file} -> ${target}`);
    }
  }
}

if (broken.length) {
  console.error(`Broken relative links (${broken.length}):`);
  for (const line of broken) console.error(`  ${line}`);
  console.error('Fix: point each link at the moved file, or remove it.');
  process.exit(1);
}
console.log(`Doc links OK (${files.length} files)`);
