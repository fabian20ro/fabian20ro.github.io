const test = require('node:test');
const assert = require('node:assert');
const { translations, t, normalizeLang } = require('../app.js');

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

test('t() returns Romanian translation when $lang ro', () => {
  assert.equal(t('title', 'ro'), 'Proiectele lui Fabian');
  assert.equal(t('liveProjects', 'ro'), 'Proiecte Live');
  assert.equal(t('passwordGenTitle', 'ro'), 'Generator de Parole');
});

test('t() falls back to English for unknown keys', () => {
  const fallback = t('nonexistentKey12345', 'ro');
  assert.equal(fallback, 'nonexistentKey12345');
});

test('normalizeLang accepts locale subtags and returns base code', () => {
  assert.equal(normalizeLang('ro-RO'), 'ro');
  assert.equal(normalizeLang('ro_RO'), 'ro');
  assert.equal(normalizeLang('fr-ca'), 'fr');
  assert.equal(normalizeLang('en-US'), 'en');
  assert.equal(normalizeLang('de-DE'), 'de');
});

test('normalizeLang rejects non-string input', () => {
  assert.equal(normalizeLang(undefined), 'en');
  assert.equal(normalizeLang(null), 'en');
  assert.equal(normalizeLang(42), 'en');
  assert.equal(normalizeLang({}), 'en');
});

test('normalizeLang rejects unsupported locales and defaults to en', () => {
  assert.equal(normalizeLang('xyz-ABC'), 'en');
  assert.equal(normalizeLang('ja'), 'en');
  assert.equal(normalizeLang('   '), 'en');
});
