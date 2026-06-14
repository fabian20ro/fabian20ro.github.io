const test = require('node:test');
const assert = require('node:assert');
const app = require('../app.js');

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
