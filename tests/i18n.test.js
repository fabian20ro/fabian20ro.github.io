const test = require('node:test');
const assert = require('node:assert');
const { translations } = require('../app.js');

test('i18n translation completeness', () => {
  const enKeys = Object.keys(translations.en);
  
  for (const key of enKeys) {
    // Check Romanian
    if (!translations.ro || !translations.ro[key]) {
      assert.fail(`Missing key "${key}" in Romanian translations`);
    }
    // Check French
    if (!translations.fr || !translations.fr[key]) {
      assert.fail(`Missing key "${key}" in French translations`);
    }
  }
});

test('i18n translation values are not just the key', () => {
  const enKeys = Object.keys(translations.en);
  for (const key of enKeys) {
    // Check Romanian
    if (translations.ro && translations.ro[key] === key) {
      assert.fail(`Key "${key}" in Romanian is just the key itself`);
    }
    // Check French
    if (translations.fr && translations.fr[key] === key) {
      assert.fail(`Key "${key}" in French is just the key itself`);
    }
  }
});
