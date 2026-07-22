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
