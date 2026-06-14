'use strict';

const app = require('../app.js');
const assert = require('node:assert');

try {
  console.log('Running translation key contract tests...');

  const languages = Object.keys(app.translations);
  const baseLang = 'en';
  const baseTranslations = app.translations[baseLang];
  const baseKeys = Object.keys(baseTranslations);

  languages.forEach((lang) => {
    if (lang === baseLang) return;
    console.log(`Checking language completeness: ${lang}`);
    
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

  console.log('Translation key contract tests passed!');
} catch (err) {
  console.error('Translation key contract tests failed:');
  console.error(err.message);
  process.exit(1);
}
