'use strict';

const app = require('../app.js');
const { getRelativeTime, setLang, translations } = app;
const assert = require('node:assert');

const originalDateNow = Date.now;
const mockDate = new Date('2026-06-12T12:00:00Z');
Date.now = () => mockDate.getTime();

async function runTests() {
  try {
    console.log('Testing getRelativeTime with multiple languages...');

    const testCases = [
      // English
      { lang: 'en', date: new Date(mockDate.getTime() - 3600000).toISOString(), expected: translations.en.hourAgo },
      { lang: 'en', date: new Date(mockDate.getTime()).toISOString(), expected: translations.en.justNow },
      { lang: 'en', date: new Date(mockDate.getTime() - 120000).toISOString(), expected: `2 ${translations.en.minutesAgo}` },
      { lang: 'en', date: new Date(mockDate.getTime() + 3600000).toISOString(), expected: translations.en.justNow }, // Future date
      { lang: 'en', date: 'invalid', expected: translations.en.justNow }, // Invalid date
      { lang: 'en', date: new Date('2050-01-01T12:00:00Z').toISOString(), expected: translations.en.justNow }, // Extreme year (future)
      { lang: 'en', date: new Date('1900-01-01T12:00:00Z').toISOString(), expected: `126 ${translations.en.yearsAgo}` }, // Extreme past year
      
      // Romanian
      { lang: 'ro', date: new Date(mockDate.getTime() - 3600000).toISOString(), expected: translations.ro.hourAgo },
      { lang: 'ro', date: new Date(mockDate.getTime()).toISOString(), expected: translations.ro.justNow },
      { lang: 'ro', date: new Date(mockDate.getTime() - 120000).toISOString(), expected: `2 ${translations.ro.minutesAgo}` },
      
      // Spanish
      { lang: 'es', date: new Date(mockDate.getTime() - 3600000).toISOString(), expected: translations.es.hourAgo },
      { lang: 'es', date: new Date(mockDate.getTime()).toISOString(), expected: translations.es.justNow },
      { lang: 'es', date: new Date(mockDate.getTime() - 120000).toISOString(), expected: `2 ${translations.es.minutesAgo}` },
    ];

    for (const tc of testCases) {
      setLang(tc.lang);
      const res = getRelativeTime(tc.date);
      if (res !== tc.expected) {
        throw new Error(`[${tc.lang}] Expected "${tc.expected}", got "${res}" for date ${tc.date}`);
      }
    }

    console.log('getRelativeTime tests passed!');

    console.log('Testing getDefaultLang and normalizeLang...');
    const defaultLang = app.getDefaultLang();
    assert.strictEqual(typeof defaultLang, 'string');
    assert.strictEqual(app.normalizeLang('EN'), 'en');
    assert.strictEqual(app.normalizeLang('RO'), 'ro');
    console.log('getDefaultLang and normalizeLang tests passed!');

    console.log('Testing t() and setLang...');
    app.setLang('ro');
    assert.strictEqual(app.t('justNow'), 'chiar acum');
    
    app.setLang('en');
    assert.strictEqual(app.t('justNow'), 'just now');
    assert.strictEqual(app.t('hourAgo'), '1 hour ago');
    assert.strictEqual(app.t('minutesAgo'), 'minutes ago');
    assert.strictEqual(app.t('daysAgo'), 'days ago');
    assert.strictEqual(app.t('yearsAgo'), 'years ago');
    console.log('t() and setLang tests passed!');
  } catch (err) {
    console.error('getRelativeTime tests failed:');
    console.error(err.message);
    process.exit(1);
  } finally {
    Date.now = originalDateNow;
  }
}

runTests();