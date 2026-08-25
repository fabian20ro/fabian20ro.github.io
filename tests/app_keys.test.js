'use strict';

const app = require('../app.js');
const assert = require('node:assert');
const { test } = require('node:test');
const { setLang, translations, t } = app;

test('translation key contract', (t) => {
  console.log('Running translation key contract tests...');
  const languages = Object.keys(app.translations);
  const baseLang = 'en';
  const baseTranslations = app.translations[baseLang];
  const baseKeys = Object.keys(baseTranslations);

  languages.forEach((lang) => {
    if (lang === baseLang) return;
    const trans = app.translations[lang];
    baseKeys.forEach((key) => {
      const val = trans[key];
      assert.ok(
        key in trans,
        `Missing translation key: "${key}" in language: ${lang}`
      );
      assert.ok(
        typeof val === 'string' && val.trim().length > 0,
        `Invalid translation for key: "${key}" in language: ${lang}`
      );
    });
  });
});

test('THANK_YOU_LANGUAGES integrity', () => {
  console.log('Running THANK_YOU_LANGUAGES integrity tests...');
  app.THANK_YOU_LANGUAGES.forEach((langData, index) => {
    assert.ok(langData.name, `Index ${index}: Missing name object`);
    assert.ok(typeof langData.name === 'object', `Index ${index}: name must be an object`);
    assert.ok(langData.name.en, `Index ${index}: Missing 'en' key in lang.name`);
    assert.ok(langData.name.ro, `Index ${index}: Missing 'ro' key in lang.name`);
    assert.ok(langData.flag, `Index ${index}: Missing flag`);
    assert.ok(langData.thankYou, `Index ${index}: Missing thankYou string`);
    assert.ok(langData.thankYouPhonetic, `Index ${index}: Missing thankYouPhonetic string`);
    assert.ok(langData.welcome, `Index ${index}: Missing welcome string`);
    assert.ok(langData.welcomePhonetic, `Index ${index}: Missing welcomePhonetic string`);
  });
});

test('project sections integrity', () => {
  console.log('Checking project sections...');
  const languages = Object.keys(app.translations);
  Object.entries(app.projectSections).forEach(([sectionName, sectionItems]) => {
    assert.ok(Array.isArray(sectionItems), `Section ${sectionName} should be an array`);
    sectionItems.forEach((item, index) => {
      ['titleKey', 'descKey', 'linkKey'].forEach(key => {
        if (item[key]) {
          languages.forEach((lang) => {
            const trans = app.translations[lang];
            assert.ok(
              item[key] in trans,
              `Missing translation key: "${item[key]}" for section ${sectionName} index ${index} in language: ${lang}`
            );
          });
        }
      });
    });
  });
});

test('t() edge cases', () => {
  setLang('en');
  assert.strictEqual(t('nonexistent'), 'nonexistent');
  assert.strictEqual(t('title'), "Fabian's Projects");

  setLang('ro');
  assert.strictEqual(t('title'), 'Proiectele lui Fabian');
  assert.strictEqual(t('app_status'), 'Statusul aplicației');

  setLang('fr');
  assert.strictEqual(t('title'), 'Les projets de Fabian');
});

test('t() explicit language parameter', () => {
  console.log('Running t() explicit language parameter tests...');
  setLang('en');
  assert.strictEqual(t('title', 'fr'), 'Les projets de Fabian');
  assert.strictEqual(t('title', 'RO-RO'), 'Proiectele lui Fabian');
  assert.strictEqual(t('title'), "Fabian's Projects");
  assert.strictEqual(t('nonexistent', 'fr'), 'nonexistent');
});

test('normalizeLang resolution', () => {
  console.log('Running normalizeLang resolution tests...');
  assert.strictEqual(app.normalizeLang('ro-RO'), 'ro');
  assert.strictEqual(app.normalizeLang('fr_FR'), 'fr');
  assert.strictEqual(app.normalizeLang('  DE  '), 'de');
  assert.strictEqual(app.normalizeLang('jp'), 'en');
  assert.strictEqual(app.normalizeLang(123), 'en');
});
