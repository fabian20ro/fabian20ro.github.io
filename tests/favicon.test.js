'use strict';

const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

test('tab icons resolve to self-contained local vector assets', () => {
  const root = join(__dirname, '..');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const rel of ['icon', 'mask-icon']) {
    const link = html.match(new RegExp(`<link rel="${rel}"[^>]+>`))?.[0];
    assert.ok(link, `Missing ${rel}`);
    const href = link.match(/href="([^"]+)"/)[1];
    assert.match(href, /^[^/]+\.svg$/);
    const svg = readFileSync(join(root, href), 'utf8');
    assert.ok(svg.includes('viewBox="0 0 32 32"'));
    assert.doesNotMatch(svg, /<(?:script|image|foreignObject|text)\b|(?:href|onload)=/);
  }
});
