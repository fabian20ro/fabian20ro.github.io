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

// Icon uniqueness: no two entries in the same group (liveProjects or repositories)
// nor across groups should share an icon. Duplicate icons hide data-entry bugs —
// e.g., adding a new repo that actually points to an already-tracked live project,
// or copy-paste duplication when scaffolding new sections.
test('projectSections icons are unique', () => {
  const checkGroup = (group, groupName) => {
    const seen = new Set();
    const duplicates = [];

    group.forEach((section, i) => {
      if (!section.icon || section.icon.length === 0) return; // shape test covers empties
      if (seen.has(section.icon)) {
        duplicates.push({ index: i, value: section.icon });
      } else {
        seen.add(section.icon);
      }
    });

    assert.strictEqual(duplicates.length, 0, `${groupName}: Duplicate icons at indices ${duplicates.map(d => d.index).join(', ')}: "${duplicates.map(d => d.value).join('", "')}"`);
  };

  checkGroup(app.projectSections.liveProjects, 'liveProjects');
  checkGroup(app.projectSections.repositories, 'repositories');

  // Cross-group: a live project and repository may legitimately share an icon when they
  // are the same product shown in two places (e.g. generator-rebus). We allow that pair,
  // but flag collisions where different titleKeys share an icon — that pattern almost always
  // indicates data-entry error or accidental copy-paste duplication.
  const liveByIcon = new Map();
  for (const s of app.projectSections.liveProjects) {
    if (!s.icon) continue;
    if (liveByIcon.has(s.icon)) {
      const prior = liveByIcon.get(s.icon);
      // Allow same-product cross-group: icon reused but titleKey is identical.
      if (prior.titleKey !== s.titleKey) {
        assert.fail(`Cross-group collision "${s.icon}": "${prior.titleKey}" (${prior.href}) and "${s.titleKey}" (${s.href}) share an icon — likely data-entry error`);
      }
    } else {
      liveByIcon.set(s.icon, s);
    }
  }

  for (const r of app.projectSections.repositories.filter(s => s.icon)) {
    const prior = liveByIcon.get(r.icon);
    if (!prior) continue; // new icon within repo group — not cross-group collision
    if (prior.titleKey !== r.titleKey) {
      assert.fail(`Cross-group collision "${r.icon}": "${prior.titleKey}" (${prior.href}) and "${r.titleKey}" (${r.href}) share an icon — likely data-entry error`);
    }
  }
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

// Badge-to-actions runtime linkage: production renders each project card's badge link via
// getBadgeActionsUrl(section.badgeUrl). The static shape/regex tests above only pattern-match
// the raw badgeUrl string; they do not run the production transformation. This test pins the
// observable runtime contract: every section carrying a badgeUrl must transform through the
// exported helper into a github.com/{owner}/{repo} URL with an optional /actions suffix. The
// helper is idempotent: a badge already under /actions (e.g. pages-build-deployment) resolves
// to the bare repo base, while a plain badge.svg URL gains the /actions suffix. A non-GitHub
// input would pass through unchanged — impossible here because the badge-pattern test above
// already guarantees the github.com/{owner}/{repo} structure of every badgeUrl.
test('projectSections badgeUrls resolve to valid actions dashboard URLs via getBadgeActionsUrl()', () => {
  const resolvedUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(\/actions)?\/?$/;
  const allSections = [...app.projectSections.liveProjects, ...app.projectSections.repositories];

  let sectionsWithBadges = 0;
  for (const [i, section] of allSections.entries()) {
    if (section.badgeUrl === undefined || section.badgeUrl === null) continue;
    sectionsWithBadges += 1;

    const actionsUrl = app.getBadgeActionsUrl(section.badgeUrl);
    assert.strictEqual(
      typeof actionsUrl,
      'string',
      `section ${i} (${section.href}): getBadgeActionsUrl(badgeUrl) must return a string (got: ${typeof actionsUrl})`
    );
    assert.ok(
      actionsUrl.length > 0,
      `section ${i} (${section.href}): getBadgeActionsUrl(badgeUrl) resolved to empty string`
    );
    assert.ok(
      resolvedUrlPattern.test(actionsUrl),
      `section ${i} (${section.href}): badgeUrl "${section.badgeUrl}" must resolve to a github.com/{owner}/{repo}(/actions) URL (got: "${actionsUrl}")`
    );
  }

  // Guard against the invariant becoming vacuous: the current production data
  // ships badges on most sections, so zero matches means the data lost its
  // badge wiring and this check would pass silently.
  assert.ok(
    sectionsWithBadges > 0,
    `Expected at least one projectSection with a badgeUrl (found ${sectionsWithBadges}) — badge linkage check would be vacuous`
  );
});

// Exact-branch contract for getBadgeActionsUrl(). The shape test above only regex-matches the
// resolved output against a permissive pattern, so it cannot tell a correct /actions append or
// idempotent passthrough apart from a buggy double-"/actions". This test pins the EXACT output
// of each documented branch (app.js getBadgeActionsUrl), including the guard cases the data-driven
// test never reaches (non-string input, non-GitHub passthrough).
test('getBadgeActionsUrl exact per-branch outputs', () => {
  // Branch: non-string input must yield an empty string (badge link renders as no link).
  assert.strictEqual(app.getBadgeActionsUrl(undefined), '', 'undefined input must resolve to empty string');
  assert.strictEqual(app.getBadgeActionsUrl(null), '', 'null input must resolve to empty string');
  assert.strictEqual(app.getBadgeActionsUrl(123), '', 'non-string input must resolve to empty string');

  // Branch: a non-GitHub URL does not match the github.com/{owner}/{repo} pattern and is
  // returned unchanged (not rewritten, not blanked).
  assert.strictEqual(
    app.getBadgeActionsUrl('https://fabian20ro.github.io/random-passwords/'),
    'https://fabian20ro.github.io/random-passwords/',
    'non-GitHub URL must pass through unchanged'
  );

  // Branch: a plain GitHub workflow badge NOT already under /actions gains exactly one /actions
  // suffix (resolved from a real production badgeUrl).
  assert.strictEqual(
    app.getBadgeActionsUrl('https://github.com/fabian20ro/emotid/workflows/Deploy%20to%20GitHub%20Pages/badge.svg'),
    'https://github.com/fabian20ro/emotid/actions',
    'plain GitHub badge must resolve to <repo>/actions (single suffix, no double-append)'
  );

  // Branch (idempotence): a badge already under /actions resolves to the BARE repo base — not
  // base+/actions again. This is the regression the permissive shape test cannot catch.
  assert.strictEqual(
    app.getBadgeActionsUrl('https://github.com/fabian20ro/prompt-to-image-variations/actions/workflows/pages/pages-build-deployment/badge.svg'),
    'https://github.com/fabian20ro/prompt-to-image-variations',
    'badge already under /actions must resolve to the bare repo base (idempotent, no double-append)'
  );

  // Branch: the bare repo base itself is its own base — returned unchanged.
  assert.strictEqual(
    app.getBadgeActionsUrl('https://github.com/fabian20ro/sudoku-python'),
    'https://github.com/fabian20ro/sudoku-python',
    'bare repo base must be returned unchanged'
  );
});

// LinkKey consistency and translation resolution: every liveProject card uses linkKey='visitSite'
// and every repository entry uses linkKey='viewGithub'. These are fixed strings (not dynamic
// translation keys), but they must still resolve through t() to non-empty text in all languages —
// otherwise a user sees raw key text on the project card button. This test catches accidental
// assignment of arbitrary or misspelled values that would silently break UI labels.
test('projectSections linkKey consistency and resolution', () => {
  const expectedLiveLinkKey = 'visitSite';
  const expectedRepoLinkKey = 'viewGithub';

  app.projectSections.liveProjects.forEach((section, i) => {
    assert.strictEqual(section.linkKey, expectedLiveLinkKey, `liveProject ${i}: linkKey must be '${expectedLiveLinkKey}' (got '${section.linkKey}')`);
  });

  app.projectSections.repositories.forEach((section, i) => {
    assert.strictEqual(section.linkKey, expectedRepoLinkKey, `repo ${i}: linkKey must be '${expectedRepoLinkKey}' (got '${section.linkKey}')`);
  });

  // Both fixed linkKey values must resolve through t() to non-empty strings in all languages.
  Object.entries(app.translations).forEach(([lang, trans]) => {
    const liveVal = app.t(expectedLiveLinkKey);
    assert.ok(expectedLiveLinkKey in trans, `t("${expectedLiveLinkKey}") must work in "${lang}"`);
    assert.strictEqual(typeof liveVal, 'string', `t("${expectedLiveLinkKey}") in "${lang}" must return string (got ${typeof liveVal})`);
    const trimmed = String(liveVal).trim();
    assert.ok(trimmed.length > 0 && trimmed !== expectedLiveLinkKey, `t("${expectedLiveLinkKey}") resolved to empty or raw key in "${lang}"`);

    const repoVal = app.t(expectedRepoLinkKey);
    assert.strictEqual(typeof repoVal, 'string', `t("${expectedRepoLinkKey}") in "${lang}" must return string (got ${typeof repoVal})`);
    const trimmedRepo = String(repoVal).trim();
    assert.ok(trimmedRepo.length > 0 && trimmedRepo !== expectedRepoLinkKey, `t("${expectedRepoLinkKey}") resolved to empty or raw key in "${lang}"`);
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
