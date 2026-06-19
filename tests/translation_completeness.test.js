'use strict';

const app = require('../app.js');
const assert = require('node:assert');

try {
  console.log('Running translation completeness tests...');

  const languages = Object.keys(app.translations);
  const baseLang = 'en';
  const baseTranslations = app.translations[baseLang];
  const baseKeys = Object.keys(baseTranslations);

  languages.forEach((lang) => {
    if (lang === baseLang) return;
    console.log(`Checking language completeness: ${lang}`);
      
    const trans = app.translations[lang];
    baseKeys.forEach((key) => {
      assert.ok(
        key in trans,
        `Missing translation key: "${key}" in language: ${lang}`
      );
      if (key === 'propositionsDesc') {
        assert.notStrictEqual(trans[key], trans.propositionsTitle, `"${key}" should not be equal to "propositionsTitle" in language: ${lang}`);
      }
    });
  });

  console.log('Translation completeness tests passed!');
} catch (err) {
  console.error('Translation completeness tests failed:');
  console.error(err.message);
  process.exit(1);
}
