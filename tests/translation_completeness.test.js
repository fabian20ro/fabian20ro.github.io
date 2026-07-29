'use strict';

const app = require('../app.js');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe('translation completeness', () => {
  const baseLang = 'en';
  const baseTranslations = app.translations[baseLang];
  const baseKeys = Object.keys(baseTranslations);

  it('has a complete translations object exported by app.js', () => {
    assert.ok(typeof app.translations === 'object' && app.translations !== null);
    assert.ok(baseLang in app.translations, 'Base language "en" must exist');
    assert.ok(baseKeys.length > 0, 'Base translations must contain keys');
  });

  it('every non-base language contains every base translation key', () => {
    const languages = Object.keys(app.translations).filter((lang) => lang !== baseLang);
    assert.ok(languages.length > 0, 'At least one non-base language must exist');

    for (const lang of languages) {
      const trans = app.translations[lang];
      for (const key of baseKeys) {
        assert.ok(
          key in trans,
          `Missing translation key: "${key}" in language: ${lang}`
        );
      }
    }
  });

  it('propositionsDesc is distinct from propositionsTitle in every non-base language', () => {
    const languages = Object.keys(app.translations).filter((lang) => lang !== baseLang);
    for (const lang of languages) {
      const trans = app.translations[lang];
      assert.notStrictEqual(
        trans.propositionsDesc,
        trans.propositionsTitle,
        `"propositionsDesc" should not be equal to "propositionsTitle" in language: ${lang}`
      );
    }
  });

  it('supported languages constant matches translation keys', () => {
    const SUPPORTED_LANGUAGES = ['en', 'ro', 'fr', 'es', 'de', 'it', 'pt'];
    assert.deepStrictEqual(
      Object.keys(app.translations).sort(),
      SUPPORTED_LANGUAGES.sort()
    );
  });

  it('each language has no duplicate translation keys', () => {
    // Duplicate keys in JS object literals silently overwrite — JSON round-trip collapses them.
    // Comparing original entry count with deserialized count catches silent data loss.
    for (const lang of Object.keys(app.translations)) {
      const trans = app.translations[lang];
      const serialized = JSON.stringify(trans);
      const deserialized = JSON.parse(serialized);
      assert.strictEqual(
        Object.keys(deserialized).length,
        Object.keys(trans).length,
        `Language "${lang}" has duplicate keys — JSON round-trip lost entries`
      );
    }
  });

  it('every translation value is a non-empty string', () => {
    for (const lang of Object.keys(app.translations)) {
      const trans = app.translations[lang];
      for (const key of Object.keys(trans)) {
        assert.strictEqual(
          typeof trans[key],
          'string',
          `Key "${key}" in language "${lang}" is not a string (got ${typeof trans[key]})`
        );
        assert.notStrictEqual(
          trans[key].trim(),
          '',
          `Key "${key}" in language "${lang}" has empty/whitespace-only value`
        );
      }
    }
  });
});
