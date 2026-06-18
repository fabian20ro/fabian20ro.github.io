'use strict';

const app = require('../app.js');
const assert = require('node:assert');
const { test } = require('node:test');

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
    assert.ok(langData.flag, `Index ${index}: Missing flag`);
    assert.ok(langData.thankYou, `Index ${index}: Missing thankYou string`);
    assert.ok(langData.thankYouPhonetic, `Index ${index}: Missing thankYouPhonetic string`);
    assert.ok(langData.welcome, `Index ${index}: Missing welcome string`);
    assert.ok(langData.welcomePhonetic, `Index ${index}: Missing welcomePhonetic string`);
  });
});

test('project sections integrity', () => {
  console.log('Checking project sections...');
  assert.ok(app.projectSections.liveProjects, 'projectSections should have liveProjects');
  assert.ok(Array.isArray(app.projectSections.liveProjects), 'liveProjects should be an array');
  assert.ok(app.projectSections.repositories, 'projectSections should have repositories');
  assert.ok(Array.isArray(app.projectSections.repositories), 'repositories should be an array');

  const languages = Object.keys(app.translations);
  app.projectSections.liveProjects.forEach((project, index) => {
    ['titleKey', 'descKey', 'linkKey'].forEach(key => {
      if (project[key]) {
        languages.forEach((lang) => {
          const trans = app.translations[lang];
          assert.ok(
            project[key] in trans,
            `Missing translation key: "${project[key]}" for project index ${index} in language: ${lang}`
          );
        });
      }
    });
  });
});
