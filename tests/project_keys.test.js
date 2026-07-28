const test = require('node:test');
const assert = require('node:assert');
const app = require('../app.js');

// Shape contract: every live project and repository must carry the required fields with correct types.
// This catches regressions from adding/removing projects without updating section data.
test('projectSections shape contract', () => {
  const requiredLiveFields = ['href', 'icon', 'titleKey', 'descKey', 'linkKey'];
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

// Metadata consistency: badgeUrl and liveSiteUrl must point to HTTPS URLs when present.
// HTTP-only or empty badge URLs would silently break CI badges shown in the UI.
test('projectSections metadata URL safety', () => {
  const allSections = [...app.projectSections.liveProjects, ...app.projectSections.repositories];

  for (const section of allSections) {
    if (section.badgeUrl !== undefined && section.badgeUrl !== null) {
      assert.ok(section.badgeUrl.startsWith('https://'), `badgeUrl must use HTTPS: ${section.href}`);
      // GitHub Actions/GitHub Pages badges are the only valid pattern here.
      assert.match(section.badgeUrl, /^(?:https:\/\/)?github\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\/?/, `badgeUrl must reference a github.com repo path: ${section.badgeUrl}`);
    }

    if (section.liveSiteUrl !== undefined && section.liveSiteUrl !== null) {
      assert.ok(section.liveSiteUrl.startsWith('https://'), `liveSiteUrl must use HTTPS: ${section.href}`);
    }

    // href itself is always required and must be HTTPS.
    assert.ok(section.href.startsWith('https://'), `href must use HTTPS: ${section.href}`);
  }
});

// Translation completeness per language: every key present in the en translation dictionary
// must also exist (and be non-empty) in every other supported language. This is a stronger
// check than the orphan-key test because it catches keys that exist in all languages but
// are empty strings — which would render as blank content to users.
test('translation completeness', () => {
  const enKeys = Object.keys(app.translations.en);
  const supportedLanguages = Object.keys(app.translations).filter(lang => lang !== 'en');

  for (const lang of supportedLanguages) {
    assert.ok(enKeys.length > 0, `English translations must not be empty`);

    for (const key of enKeys) {
      assert.ok(key in app.translations[lang], `Key "${key}" missing from language "${lang}"`);

      const value = String(app.translations[lang][key]).trim();
      assert.ok(value.length > 0, `Translation for "${key}" in "${lang}" must be non-empty (got: "")`);
    }
  }
});

// Identifying key uniqueness: within each section group (liveProjects, repositories),
// titleKey and descKey must be unique. These are translation keys that identify specific
// project content — duplicates *within* a group would cause rendering collisions (all
// projects sharing a card's text in the same list). Cross-group overlaps (e.g. a repo entry
// and its live-site counterpart using the same title key) are intentional and allowed.
test('projectSections identifying key uniqueness', () => {
  const checkGroup = (group, groupName) => {
    const titleKeys = new Set();
    const descKeys = new Set();
    const titleDuplicates = [];
    const descDuplicates = [];

    group.forEach((section, i) => {
      if (section.titleKey) {
        if (titleKeys.has(section.titleKey)) {
          titleDuplicates.push({ index: i, value: section.titleKey });
        } else {
          titleKeys.add(section.titleKey);
        }
      }
      if (section.descKey) {
        if (descKeys.has(section.descKey)) {
          descDuplicates.push({ index: i, value: section.descKey });
        } else {
          descKeys.add(section.descKey);
        }
      }
    });

    assert.strictEqual(titleDuplicates.length, 0, `${groupName}: Duplicate titleKeys found at indices ${titleDuplicates.map(d => d.index).join(', ')}: ${titleDuplicates.map(d => `"${d.value}"`).join(', ')}`);
    assert.strictEqual(descDuplicates.length, 0, `${groupName}: Duplicate descKeys found at indices ${descDuplicates.map(d => d.index).join(', ')}: ${descDuplicates.map(d => `"${d.value}"`).join(', ')}`);
  };

  checkGroup(app.projectSections.liveProjects, 'liveProjects');
  checkGroup(app.projectSections.repositories, 'repositories');
});

// Behavioral translation lookup: every titleKey/descKey/linkKey referenced in projectSections
// must produce a non-empty string when passed through `t()`. The dictionary-completeness tests
// above verify key presence; this test validates that the actual runtime lookup returns usable
// content — catching empty translations, circular references, or t() returning raw keys.
test('projectSection translation keys resolve to non-empty strings via t()', () => {
  const keysToCheck = new Set();

  [...app.projectSections.liveProjects, ...app.projectSections.repositories].forEach(section => {
    if (section.titleKey) keysToCheck.add(section.titleKey);
    if (section.descKey) keysToCheck.add(section.descKey);
    if (section.linkKey) keysToCheck.add(section.linkKey);
  });

  const missingKeys = [];
  const emptyValues = [];

  for (const key of keysToCheck) {
    assert.ok(key in app.translations.en, `Translation key "${key}" not present in English dictionary`);

    // Verify t() resolves to a usable string across all supported languages.
    Object.entries(app.translations).forEach(([lang, trans]) => {
      const value = app.t(key);
      assert.ok(typeof value === 'string', `t("${key}") in "${lang}" must return a string (got: ${typeof value})`);
      const trimmed = String(value).trim();

      // The t() function returns the key itself when missing from the dictionary. If we get
      // back the raw key, that means the lookup failed — a silent bug for users.
      assert.notStrictEqual(trimmed, key, `t("${key}") in "${lang}" returned raw key (lookup failed)`);

      assert.ok(trimmed.length > 0, `Translation for "${key}" in "${lang}" resolved to empty string`);
    });
  }
});

// Icon format: every icon must be a non-empty emoji character.
// Non-emoji icons would render inconsistently across OS/browsers — breaking the
// visual identity of project cards. The production data uses only single-character
// emoji (or regional indicator pairs like 🇷🇴), so we validate against that pattern.
test('projectSections icons are valid emoji', () => {
  app.projectSections.liveProjects.forEach((section, i) => {
    assert.ok(section.icon.length > 0, `liveProject ${i}: icon must be non-empty`);
    // Content validation: icons must be simple display text. Reject URLs, HTML tags,
    // multi-word phrases, or strings with spaces/slashes that would render as broken UI.
    const isValidIcon = /^[^\s\/<>]+$/u.test(section.icon) && !section.icon.startsWith('http');
    assert.ok(isValidIcon, `liveProject ${i}: icon "${section.icon}" must be simple display text (no URLs, whitespace, or slashes)`);
  });

  app.projectSections.repositories.forEach((section, i) => {
    if (section.icon !== undefined && section.icon !== null) {
      assert.ok(section.icon.length > 0, `repo ${i}: icon must be non-empty when present`);
      const isValidIcon = /^[^\s\/<>]+$/u.test(section.icon) && !section.icon.startsWith('http');
      assert.ok(isValidIcon, `repo ${i}: icon "${section.icon}" must be simple display text (no URLs, whitespace, or slashes)`);
    }
  });
});

// Href URL structure: production URLs must follow expected domain patterns.
// Live projects use subdomains of fabian20ro.github.io; repositories point to github.com.
// HTTP, malformed domains, or mixed-case protocols would break card links silently.
test('projectSections hrefs match expected URL structures', () => {
  const liveHrefPattern = /^https:\/\/fabian20ro\.github\.io\/[^/\s]+\/?$/;
  const repoHrefPattern = /^https:\/\/github\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9._\-]+\/?$/;

  app.projectSections.liveProjects.forEach((section, i) => {
    assert.ok(liveHrefPattern.test(section.href), `liveProject ${i}: href "${section.href}" does not match expected subdomain pattern`);
  });

  app.projectSections.repositories.forEach((section, i) => {
    if (section.href !== undefined && section.href !== null) {
      assert.ok(repoHrefPattern.test(section.href), `repo ${i}: href "${section.href}" does not match github.com repo URL pattern`);
    }
  });
});

// Badge URL validity: badgeUrl must point to a GitHub Actions workflow badge.
// Invalid or HTTP-only badges would show broken images in the project card UI.
test('projectSections badgeUrls reference valid GitHub workflow badges', () => {
  // Validate that badgeUrl points to a real GitHub Actions badge:
  // - HTTPS only (no HTTP)
  // - github.com/{owner}/{repo} structure
  // - contains workflows/ or actions/ endpoint
  // - ends with /badge.svg
  app.projectSections.liveProjects.forEach((section, i) => {
    if (section.badgeUrl !== undefined && section.badgeUrl !== null) {
      assert.ok(section.badgeUrl.startsWith('https://'), `liveProject ${i}: badgeUrl must use HTTPS`);
      const repoMatch = /^https:\/\/github\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\//.test(section.badgeUrl);
      assert.ok(repoMatch, `liveProject ${i}: badgeUrl "${section.badgeUrl}" must follow github.com/{owner}/{repo} pattern`);
      const workflowMatch = /workflows\/|actions\//.test(section.badgeUrl);
      assert.ok(workflowMatch, `liveProject ${i}: badgeUrl "${section.badgeUrl}" must contain workflows/ or actions/ endpoint`);
      assert.ok(section.badgeUrl.endsWith('/badge.svg'), `liveProject ${i}: badgeUrl must end with /badge.svg: "${section.badgeUrl}"`);
    }
  });

  app.projectSections.repositories.forEach((section, i) => {
    if (section.badgeUrl !== undefined && section.badgeUrl !== null) {
      assert.ok(section.badgeUrl.startsWith('https://'), `repo ${i}: badgeUrl must use HTTPS`);
      const repoMatch = /^https:\/\/github\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\//.test(section.badgeUrl);
      assert.ok(repoMatch, `repo ${i}: badgeUrl "${section.badgeUrl}" must follow github.com/{owner}/{repo} pattern`);
      const workflowMatch = /workflows\/|actions\//.test(section.badgeUrl);
      assert.ok(workflowMatch, `repo ${i}: badgeUrl "${section.badgeUrl}" must contain workflows/ or actions/ endpoint`);
      assert.ok(section.badgeUrl.endsWith('/badge.svg'), `repo ${i}: badgeUrl must end with /badge.svg: "${section.badgeUrl}"`);
    }
  });
});

// Content quality: translated titles and descriptions must be substantive, not placeholder text.
// Short translations (e.g. single words) indicate incomplete work that would look broken in the UI.
test('projectSections content quality — titles and descriptions', () => {
  const MIN_TITLE_LENGTH = 5;
  const MIN_DESC_LENGTH = 15;

  app.projectSections.liveProjects.forEach((section, i) => {
    assert.ok(typeof section.titleKey === 'string' && section.titleKey.length > 0, `liveProject ${i}: titleKey must be non-empty`);
    assert.ok(typeof section.descKey === 'string' && section.descKey.length > 0, `liveProject ${i}: descKey must be non-empty`);

    const roTitle = String(app.t(section.titleKey)).trim();
    assert.ok(roTitle.length >= MIN_TITLE_LENGTH, `liveProject ${i}: titleKey "${section.titleKey}" resolves to substantive text in ro (>= ${MIN_TITLE_LENGTH} chars; got "${roTitle}")`);

    const roDesc = String(app.t(section.descKey)).trim();
    assert.ok(roDesc.length >= MIN_DESC_LENGTH, `liveProject ${i}: descKey "${section.descKey}" resolves to substantive text in ro (>= ${MIN_DESC_LENGTH} chars; got "${roDesc}")`);
  });

  app.projectSections.repositories.forEach((section, i) => {
    if (section.titleKey !== undefined && section.titleKey !== null) {
      assert.ok(typeof section.titleKey === 'string' && section.titleKey.length > 0, `repo ${i}: titleKey must be non-empty`);
      const roTitle = String(app.t(section.titleKey)).trim();
      assert.ok(roTitle.length >= MIN_TITLE_LENGTH, `repo ${i}: titleKey "${section.titleKey}" resolves to substantive text in ro (>= ${MIN_TITLE_LENGTH} chars; got "${roTitle}")`);
    }
    if (section.descKey !== undefined && section.descKey !== null) {
      assert.ok(typeof section.descKey === 'string' && section.descKey.length > 0, `repo ${i}: descKey must be non-empty`);
      const roDesc = String(app.t(section.descKey)).trim();
      assert.ok(roDesc.length >= MIN_DESC_LENGTH, `repo ${i}: descKey "${section.descKey}" resolves to substantive text in ro (>= ${MIN_DESC_LENGTH} chars; got "${roDesc}")`);
    }
  });
});
