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
