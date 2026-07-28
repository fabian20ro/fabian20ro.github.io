const test = require('node:test');
const assert = require('node:assert');
const { projectSections, translations } = require('../app.js');

const languages = ['en', 'ro', 'fr', 'es', 'de', 'it', 'pt'];

test('projectSections metadata translation completeness', () => {
  for (const lang of languages) {
    const trans = translations[lang];
    assert.ok(trans, `Translations for ${lang} are missing`);

    for (const section of projectSections.liveProjects) {
      assert.ok(trans[section.titleKey], `Missing titleKey: ${section.titleKey} in ${lang}`);
      assert.ok(trans[section.descKey], `Missing descKey: ${section.descKey} in ${lang}`);
    }

    for (const repo of projectSections.repositories) {
      assert.ok(trans[repo.titleKey], `Missing titleKey: ${repo.titleKey} in ${lang}`);
      assert.ok(trans[repo.descKey], `Missing descKey: ${repo.descKey} in ${lang}`);
      if (repo.linkKey) {
        assert.ok(trans[repo.linkKey], `Missing linkKey: ${repo.linkKey} in ${lang}`);
      }
    }
  }
});

test('projectSections entries have required fields', () => {
  const requiredKeys = ['href', 'icon', 'titleKey', 'descKey'];

  for (const item of projectSections.liveProjects) {
    assert.ok(typeof item.href === 'string' && item.href.length > 0, `liveProjects[${item.titleKey}]: href must be a non-empty string`);
    assert.ok(typeof item.icon === 'string' && item.icon.length > 0, `liveProjects[${item.titleKey}]: icon must be a non-empty string`);
    assert.strictEqual(typeof item.titleKey, 'string', `liveProjects[${item.href}]: titleKey must be a string`);
    assert.ok(item.titleKey.length > 0, `liveProjects[${item.href}]: titleKey must not be empty`);
    assert.strictEqual(typeof item.descKey, 'string', `liveProjects[${item.href}]: descKey must be a string`);
    assert.ok(item.descKey.length > 0, `liveProjects[${item.href}]: descKey must not be empty`);
    assert.ok(typeof item.badgeUrl === 'string' && item.badgeUrl.length > 0, `liveProjects[${item.titleKey}]: badgeUrl is missing or empty`);
  }

  for (const item of projectSections.repositories) {
    assert.ok(typeof item.href === 'string' && item.href.length > 0, `repositories[${item.titleKey}]: href must be a non-empty string`);
    assert.ok(typeof item.icon === 'string' && item.icon.length > 0, `repositories[${item.titleKey}]: icon must be a non-empty string`);
    assert.strictEqual(typeof item.titleKey, 'string', `repositories[${item.href}]: titleKey must be a string`);
    assert.ok(item.titleKey.length > 0, `repositories[${item.href}]: titleKey must not be empty`);
    assert.strictEqual(typeof item.descKey, 'string', `repositories[${item.href}]: descKey must be a string`);
    assert.ok(item.descKey.length > 0, `repositories[${item.href}]: descKey must not be empty`);
  }
});
test('projectSections titleKeys are unique within each list', () => {
  const checkList = (list) => {
    const seen = new Set();
    for (const item of list) {
      assert.ok(!seen.has(item.titleKey), `Duplicate titleKey: ${item.titleKey}`);
      seen.add(item.titleKey);
    }
  };

  checkList(projectSections.liveProjects);
  checkList(projectSections.repositories);
});

test('projectSections entries have only expected keys', () => {
  const allowedLive = new Set(['href', 'icon', 'titleKey', 'descKey', 'badgeUrl', 'linkKey']);
  const allowedRepo = new Set(['href', 'icon', 'titleKey', 'descKey', 'badgeUrl', 'linkKey', 'liveSiteUrl']);

  for (const item of projectSections.liveProjects) {
    assert.deepStrictEqual(
      Object.keys(item).sort(),
      Object.keys(item).filter(k => allowedLive.has(k)).sort(),
      `liveProjects[${item.titleKey}] should only contain keys from ${[...allowedLive].join(', ')}`
    );
  }

  for (const item of projectSections.repositories) {
    assert.deepStrictEqual(
      Object.keys(item).sort(),
      Object.keys(item).filter(k => allowedRepo.has(k)).sort(),
      `repositories[${item.titleKey}] should only contain keys from ${[...allowedRepo].join(', ')}`
    );
  }
});

// Behavioral resolution: every titleKey/descKey/linkKey referenced by projectSections
// must produce a non-empty translated string when passed through the runtime t() function.
// Shape tests verify key presence; this test verifies that translations are actually usable —
// catching empty values, missing entries, or t() returning raw keys back to users.
test('projectSections metadata resolves via t() to non-empty strings', () => {
  const allSections = [...projectSections.liveProjects, ...projectSections.repositories];

  for (const section of allSections) {
    if (section.titleKey) {
      assert.ok(section.titleKey in translations.en, `titleKey "${section.titleKey}" missing from en`);
    }
    if (section.descKey) {
      assert.ok(section.descKey in translations.en, `descKey "${section.descKey}" missing from en`);
    }
  }

  for (const section of allSections) {
    const keys = [];
    if (section.titleKey) keys.push(section.titleKey);
    if (section.descKey) keys.push(section.descKey);
    if (section.linkKey) keys.push(section.linkKey);

    for (const key of keys) {
      assert.ok(key in translations.en, `Key "${key}" not present in English translations`);

      Object.entries(translations).forEach(([lang, trans]) => {
        const value = trans[key];
        assert.ok(typeof value === 'string', `t("${key}") in "${lang}" must return a string (got ${typeof value})`);
        const trimmed = String(value).trim();
        assert.notStrictEqual(trimmed, key, `t("${key}") in "${lang}" returned raw key (lookup failed)`);
        assert.ok(trimmed.length > 0, `Translation for "${key}" in "${lang}" resolved to empty string`);
      });
    }
  }
});

// Badge URL structural validity: badgeUrl values must point to GitHub Actions workflow badges.
// Invalid or HTTP-only badges would show broken images in the project card UI silently.
test('projectSections badgeUrls reference valid GitHub workflow badges', () => {
  const allSections = [...projectSections.liveProjects, ...projectSections.repositories];

  for (const section of allSections) {
    if (section.badgeUrl !== undefined && section.badgeUrl !== null) {
      assert.ok(section.badgeUrl.startsWith('https://'), `badgeUrl must use HTTPS: ${section.href}`);
      const repoMatch = /^https:\/\/github\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\//.test(section.badgeUrl);
      assert.ok(repoMatch, `badgeUrl "${section.badgeUrl}" must follow github.com/{owner}/{repo} pattern`);
      const workflowMatch = /workflows\/|actions\//.test(section.badgeUrl);
      assert.ok(workflowMatch, `badgeUrl "${section.badgeUrl}" must contain workflows/ or actions/ endpoint`);
      assert.ok(section.badgeUrl.endsWith('/badge.svg'), `badgeUrl must end with /badge.svg: ${section.badgeUrl}`);
    }
  }
});

// Icon format: every icon must be simple display text — no URLs, HTML tags, or whitespace.
// Non-emoji icons would render inconsistently across OS/browsers and break the project card UI.
test('projectSections icons are valid emoji', () => {
  for (const section of projectSections.liveProjects) {
    assert.ok(typeof section.icon === 'string' && section.icon.length > 0, `liveProjects[${section.titleKey}]: icon must be a non-empty string`);
    const isValidIcon = /^[^\s\/<>]+$/u.test(section.icon) && !section.icon.startsWith('http');
    assert.ok(isValidIcon, `liveProjects[${section.titleKey}]: icon "${section.icon}" must be simple display text (no URLs, whitespace, or slashes)`);
  }

  for (const section of projectSections.repositories) {
    if (section.icon !== undefined && section.icon !== null) {
      assert.ok(typeof section.icon === 'string' && section.icon.length > 0, `repositories[${section.titleKey}]: icon must be a non-empty string`);
      const isValidIcon = /^[^\s\/<>]+$/u.test(section.icon) && !section.icon.startsWith('http');
      assert.ok(isValidIcon, `repositories[${section.titleKey}]: icon "${section.icon}" must be simple display text (no URLs, whitespace, or slashes)`);
    }
  }
});
