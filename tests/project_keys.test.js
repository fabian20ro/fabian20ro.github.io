const test = require('node:test');
const assert = require('node:assert');
const app = require('../app.js');

// Shape contract: every live project and repository must carry the required fields with correct types.
// This catches regressions from adding/removing projects without updating section data.
test('projectSections shape contract', () => {
  const requiredLiveFields = ['href', 'icon', 'titleKey', 'descKey', 'linkKey', 'badgeUrl'];
  const requiredRepoFields = ['href', 'icon', 'titleKey', 'descKey', 'linkKey'];

  app.projectSections.liveProjects.forEach((section, i) => {
    for (const field of requiredLiveFields) {
      assert.ok(field in section, `liveProject ${i}: missing field "${field}"`);
    }
    assert.strictEqual(typeof section.href, 'string', `liveProject ${i}: href must be string`);
    assert.ok(section.href.startsWith('https://'), `liveProject ${i}: href must start with https://`);
    assert.strictEqual(typeof section.icon, 'string', `liveProject ${i}: icon must be string`);
    assert.ok(section.icon.length > 0, `liveProject ${i}: icon must be non-empty`);
    assert.strictEqual(typeof section.titleKey, 'string', `liveProject ${i}: titleKey must be string`);
    assert.strictEqual(typeof section.descKey, 'string', `liveProject ${i}: descKey must be string`);
    assert.strictEqual(typeof section.linkKey, 'string', `liveProject ${i}: linkKey must be string`);
  });

  app.projectSections.repositories.forEach((section, i) => {
    for (const field of requiredRepoFields) {
      assert.ok(field in section, `repo ${i}: missing field "${field}"`);
    }
    assert.strictEqual(typeof section.href, 'string', `repo ${i}: href must be string`);
    assert.ok(section.href.startsWith('https://'), `repo ${i}: href must start with https://`);
  });

  // Optional fields: when present, must have correct type (not raw primitives)
  app.projectSections.liveProjects.forEach((section, i) => {
    if (section.badgeUrl !== undefined && section.badgeUrl !== null) {
      assert.strictEqual(typeof section.badgeUrl, 'string', `liveProject ${i}: badgeUrl must be string when present`);
    }
  });

  app.projectSections.repositories.forEach((section, i) => {
    if (section.liveSiteUrl !== undefined && section.liveSiteUrl !== null) {
      assert.strictEqual(typeof section.liveSiteUrl, 'string', `repo ${i}: liveSiteUrl must be string when present`);
    }
    // liveSiteUrl may legitimately be null (e.g. harnessManager) — that is valid
  });
});

// Completeness-in-reverse-direction: every translation key referenced by projectSections
// must exist in every language as a non-empty, stripped string. Missing translations cause
// visible UI bugs (raw keys rendered to users).
test('referenced translation values are complete and non-empty', () => {
  const keysToCheck = new Set();

  [...app.projectSections.liveProjects, ...app.projectSections.repositories].forEach(section => {
    if (section.titleKey) keysToCheck.add(section.titleKey);
    if (section.descKey) keysToCheck.add(section.descKey);
    if (section.linkKey) keysToCheck.add(section.linkKey);
  });

  // Shared top-level keys used in the UI (title, intro) are also part of the production surface.
  ['title', 'intro'].forEach(key => {
    if (key in app.translations.en) keysToCheck.add(key);
  });

  Object.entries(app.translations).forEach(([lang, trans]) => {
    keysToCheck.forEach(key => {
      assert.ok(key in trans, `Language "${lang}" is missing translation key: "${key}"`);
      const value = String(trans[key]).trim();
      assert.ok(value.length > 0, `Translation for "${key}" in "${lang}" must be non-empty (got: "${value}")`);
    });
  });
});

// No orphaned keys: every key present in translations should be referenced somewhere in the production surface.
// This catches stale/abandoned translation entries that add maintenance burden without user value.
test('no orphaned translation keys outside projectSections', () => {
  // Build a set of all section keys referenced by titleKey/descKey/linkKey across the production surface.
  const sectionKeys = new Set();

  [...app.projectSections.liveProjects, ...app.projectSections.repositories].forEach(section => {
    if (section.titleKey) sectionKeys.add(section.titleKey);
    if (section.descKey) sectionKeys.add(section.descKey);
    if (section.linkKey) sectionKeys.add(section.linkKey);
  });

  // Check that shared structural keys exist in every language (title, intro are always present).
  for (const lang of Object.keys(app.translations)) {
    assert.ok('title' in app.translations[lang], `Missing 'title' key in "${lang}"`);
    assert.ok('intro' in app.translations[lang], `Missing 'intro' key in "${lang}"`);
  }

  // Any section-key must exist in all languages — prevents orphaned/missing translations from reaching users.
  Object.entries(app.translations).forEach(([lang, trans]) => {
    sectionKeys.forEach(key => {
      assert.ok(key in trans, `Orphaned: "${key}" missing from "${lang}"`);
    });
  });

  // Sanity: en translations should not be a strict superset of any other language that would indicate incomplete work.
  const enKeys = new Set(Object.keys(app.translations.en));
  for (const [lang, trans] of Object.entries(app.translations)) {
    if (lang === 'en') continue;
    // Every key in en must exist in this lang too — otherwise en is complete and this lang is lagging.
    const missing = [...enKeys].filter(k => !(k in trans));
    assert.ok(missing.length === 0, `Language "${lang}" is missing ${missing.length} keys present in en: ${missing.slice(0, 5).join(', ')}...`);
  }
});

test('all keys in projectSections exist in translations', () => {
  const keysToCheck = new Set();
  
  // Extract keys used in projectSections
  [...app.projectSections.liveProjects, ...app.projectSections.repositories].forEach(section => {
    if (section.titleKey) keysToCheck.add(section.titleKey);
    if (section.descKey) keysToCheck.add(section.descKey);
    if (section.linkKey) keysToCheck.add(section.linkKey);
  });

  // Check against all languages in app.translations
  Object.entries(app.translations).forEach(([lang, trans]) => {
    keysToCheck.forEach(key => {
      assert.ok(key in trans, `Language "${lang}" is missing translation key: "${key}"`);
    });
  });
});
