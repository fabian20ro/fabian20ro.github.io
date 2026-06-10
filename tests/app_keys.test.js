const { projectSections, translations } = require('../app.js');
const assert = require('node:assert');

try {
  console.log('Running translation key contract tests...');

  const languages = Object.keys(translations);
  languages.forEach((lang) => {
    console.log(`Checking language: ${lang}`);
    const trans = translations[lang];

    const check_keys = (section_name, items) => {
      items.forEach((item, i) => {
        ['titleKey', 'descKey', 'linkKey'].forEach((key) => {
          if (item[key]) {
            assert.ok(
              trans[item[key]],
              `${section_name}[${i}] missing translation key: ${key} (${item[key]}) in language: ${lang}`
            );
          }
        });
      });
    };

    check_keys('liveProjects', projectSections.liveProjects);
    check_keys('repositories', projectSections.repositories);
  });

  console.log('Translation key contract tests passed!');
} catch (err) {
  console.error('Translation key contract tests failed:');
  console.error(err);
  process.exit(1);
}
