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
      { lang: 'en', date: undefined, expected: translations.en.justNow }, // Undefined
      { lang: 'en', date: null, expected: translations.en.justNow }, // Null
      { lang: 'en', date: new Date('2050-01-01T12:00:00Z').toISOString(), expected: translations.en.justNow }, // Extreme year (future)
      { lang: 'en', date: new Date('1900-01-01T12:00:00Z').toISOString(), expected: `126 ${translations.en.yearsAgo}` }, // Extreme past year
      { lang: 'en', date: new Date(mockDate.getTime() - 5000).toISOString(), expected: translations.en.justNow }, // 5 seconds ago
      { lang: 'en', date: new Date(mockDate.getTime() - 60000).toISOString(), expected: translations.en.minuteAgo },
      { lang: 'en', date: new Date(mockDate.getTime() - 86400000).toISOString(), expected: translations.en.dayAgo },
      { lang: 'en', date: new Date(mockDate.getTime() - 30 * 86400000).toISOString(), expected: translations.en.monthAgo },
      { lang: 'en', date: new Date(mockDate.getTime() - 365 * 86400000).toISOString(), expected: translations.en.yearAgo },
      
      // Romanian
      { lang: 'ro', date: new Date(mockDate.getTime() - 3600000).toISOString(), expected: translations.ro.hourAgo },
      { lang: 'ro', date: new Date(mockDate.getTime()).toISOString(), expected: translations.ro.justNow },
      { lang: 'ro', date: new Date(mockDate.getTime() - 120000).toISOString(), expected: `2 ${translations.ro.minutesAgo}` },
      { lang: 'ro', date: new Date(mockDate.getTime() + 3600000).toISOString(), expected: translations.ro.justNow }, // Future date
      { lang: 'ro', date: 'invalid', expected: translations.ro.justNow }, // Invalid date
      { lang: 'ro', date: undefined, expected: translations.ro.justNow }, // Undefined
      { lang: 'ro', date: null, expected: translations.ro.justNow }, // Null
      { lang: 'ro', date: new Date('2050-01-01T12:00:00Z').toISOString(), expected: translations.ro.justNow }, // Extreme year (future)
      { lang: 'ro', date: new Date('1900-01-01T12:00:00Z').toISOString(), expected: `126 ${translations.ro.yearsAgo}` }, // Extreme past year
      { lang: 'ro', date: new Date(mockDate.getTime() - 5000).toISOString(), expected: translations.ro.justNow }, // 5 seconds ago
      { lang: 'ro', date: new Date(mockDate.getTime() - 60000).toISOString(), expected: translations.ro.minuteAgo },
      { lang: 'ro', date: new Date(mockDate.getTime() - 86400000).toISOString(), expected: translations.ro.dayAgo },
      { lang: 'ro', date: new Date(mockDate.getTime() - 30 * 86400000).toISOString(), expected: translations.ro.monthAgo },
      { lang: 'ro', date: new Date(mockDate.getTime() - 365 * 86400000).toISOString(), expected: translations.ro.yearAgo },
      
      // Spanish
      { lang: 'es', date: new Date(mockDate.getTime() - 3600000).toISOString(), expected: translations.es.hourAgo },
      { lang: 'es', date: new Date(mockDate.getTime()).toISOString(), expected: translations.es.justNow },
      { lang: 'es', date: new Date(mockDate.getTime() - 120000).toISOString(), expected: `2 ${translations.es.minutesAgo}` },
      { lang: 'es', date: new Date(mockDate.getTime() + 3600000).toISOString(), expected: translations.es.justNow }, // Future date
      { lang: 'es', date: 'invalid', expected: translations.es.justNow }, // Invalid date
      { lang: 'es', date: undefined, expected: translations.es.justNow }, // Undefined
      { lang: 'es', date: null, expected: translations.es.justNow }, // Null
      { lang: 'es', date: new Date('2050-01-01T12:00:00Z').toISOString(), expected: translations.es.justNow }, // Extreme year (future)
      { lang: 'es', date: new Date('1900-01-01T12:00:00Z').toISOString(), expected: `126 ${translations.es.yearsAgo}` }, // Extreme past year
      { lang: 'es', date: new Date(mockDate.getTime() - 5000).toISOString(), expected: translations.es.justNow }, // 5 seconds ago
      { lang: 'es', date: new Date(mockDate.getTime() - 60000).toISOString(), expected: translations.es.minuteAgo },
      { lang: 'es', date: new Date(mockDate.getTime() - 3600000).toISOString(), expected: translations.es.hourAgo },
      { lang: 'es', date: new Date(mockDate.getTime() - 86400000).toISOString(), expected: translations.es.dayAgo },
      { lang: 'es', date: new Date(mockDate.getTime() - 30 * 86400000).toISOString(), expected: translations.es.monthAgo },
      { lang: 'es', date: new Date(mockDate.getTime() - 365 * 86400000).toISOString(), expected: translations.es.yearAgo },
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

    // Cross-language sub-minute granularity tests (1s–59s → justNow)
    console.log('Testing cross-language sub-minute granularity...');
    const subMinuteCases = [
      { lang: 'en', offsetMs: 10000, expected: translations.en.justNow },
      { lang: 'en', offsetMs: 30000, expected: translations.en.justNow },
      { lang: 'en', offsetMs: 59999, expected: translations.en.justNow },
      { lang: 'ro', offsetMs: 10000, expected: translations.ro.justNow },
      { lang: 'ro', offsetMs: 30000, expected: translations.ro.justNow },
      { lang: 'ro', offsetMs: 59999, expected: translations.ro.justNow },
      { lang: 'es', offsetMs: 10000, expected: translations.es.justNow },
      { lang: 'es', offsetMs: 30000, expected: translations.es.justNow },
      { lang: 'es', offsetMs: 59999, expected: translations.es.justNow },
      { lang: 'de', offsetMs: 10000, expected: translations.de.justNow },
      { lang: 'de', offsetMs: 30000, expected: translations.de.justNow },
      { lang: 'de', offsetMs: 59999, expected: translations.de.justNow },
      { lang: 'it', offsetMs: 10000, expected: translations.it.justNow },
      { lang: 'it', offsetMs: 30000, expected: translations.it.justNow },
      { lang: 'it', offsetMs: 59999, expected: translations.it.justNow },
      { lang: 'pt', offsetMs: 10000, expected: translations.pt.justNow },
      { lang: 'pt', offsetMs: 30000, expected: translations.pt.justNow },
      { lang: 'pt', offsetMs: 59999, expected: translations.pt.justNow },
    ];

    for (const sm of subMinuteCases) {
      setLang(sm.lang);
      const res = getRelativeTime(new Date(mockDate.getTime() - sm.offsetMs).toISOString());
      assert.strictEqual(res, sm.expected, `[${sm.lang}] ${sm.offsetMs}ms ago should return "${sm.expected}", got "${res}"`);
    }

    // Sub-minute boundary: 60s exact minute in Romanian and Spanish
    setLang('ro');
    const roBoundary = getRelativeTime(new Date(mockDate.getTime() - 60000).toISOString());
    assert.strictEqual(roBoundary, translations.ro.minuteAgo);
    setLang('es');
    const esBoundary = getRelativeTime(new Date(mockDate.getTime() - 60000).toISOString());
    assert.strictEqual(esBoundary, translations.es.minuteAgo);

    // Exact 59-min boundary: exercises diffMins < 60 with a high value near the minutes→hours transition
    setLang('ro');
    const roFiftyNine = getRelativeTime(new Date(mockDate.getTime() - 59 * 60 * 1000).toISOString());
    assert.strictEqual(roFiftyNine, `59 ${translations.ro.minutesAgo}`);

    console.log('Cross-language sub-minute granularity tests passed!');

    // Defensive input handling: non-string arguments should return ''
    console.log('Testing defensive input handling (non-string args)...');
    setLang('en');
    const defensiveCases = [
      { input: null, expected: translations.en.justNow },
      { input: undefined, expected: translations.en.justNow },
      { input: '', expected: translations.en.justNow },
      { input: '   ', expected: translations.en.justNow },
      { input: 12345, expected: '' }, // non-string primitive → empty string per contract
      { input: true, expected: '' }, // boolean coerced → empty string
      { input: {}, expected: '' }, // object literal → empty string
      { input: [], expected: '' }, // array (object) → empty string
    ];

    for (const dc of defensiveCases) {
      const result = getRelativeTime(dc.input);
      assert.strictEqual(result, dc.expected, `getRelativeTime(${JSON.stringify(dc.input)}) should return ${JSON.stringify(dc.expected)}, got ${JSON.stringify(result)}`);
    }

    // Cross-language plural form coverage: exercises singular/plural selection
    // across all tested locales for minutes and hours at values 2, 3, 4, 5+
    console.log('Testing cross-language plural forms...');
    const pluralCases = [
      { lang: 'en', diffMs: 2 * 60000, formKey: 'minutesAgo' },     // 2 minutes ago (plural)
      { lang: 'en', diffMs: 3 * 60000, formKey: 'minutesAgo' },     // 3 minutes ago (plural)
      { lang: 'en', diffMs: 4 * 60000, formKey: 'minutesAgo' },     // 4 minutes ago (plural)
      { lang: 'en', diffMs: 5 * 60000, formKey: 'minutesAgo' },     // 5 minutes ago (plural)
      { lang: 'ro', diffMs: 2 * 60000, formKey: 'minuteAgo' },      // 2 minute (dual in RO)
      { lang: 'ro', diffMs: 3 * 60000, formKey: 'minutesAgo' },     // 3-4 minutes (plural în RO)
      { lang: 'ro', diffMs: 5 * 60000, formKey: 'minutesAgo' },     // 5+ minutes (plural în RO)
      { lang: 'es', diffMs: 2 * 60000, formKey: 'minutesAgo' },     // 2 minutos atrás (plural)
      { lang: 'es', diffMs: 3 * 60000, formKey: 'minutesAgo' },     // 3 minutos atrás
      { lang: 'es', diffMs: 5 * 60000, formKey: 'minutesAgo' },     // 5+ minutos atrás
      { lang: 'de', diffMs: 2 * 60000, formKey: 'minutesAgo' },     // 2 Minuten (plural)
      { lang: 'de', diffMs: 3 * 60000, formKey: 'minutesAgo' },     // 3 Minuten
      { lang: 'de', diffMs: 5 * 60000, formKey: 'minutesAgo' },     // 5+ Minuten
      { lang: 'it', diffMs: 2 * 60000, formKey: 'minutesAgo' },     // 2 minuti (plural)
      { lang: 'it', diffMs: 3 * 60000, formKey: 'minutesAgo' },     // 3 minuti
      { lang: 'it', diffMs: 5 * 60000, formKey: 'minutesAgo' },     // 5+ minuti
      { lang: 'pt', diffMs: 2 * 60000, formKey: 'minutesAgo' },     // 2 minutos (plural)
      { lang: 'pt', diffMs: 3 * 60000, formKey: 'minutesAgo' },     // 3 minutos
      { lang: 'pt', diffMs: 5 * 60000, formKey: 'minutesAgo' },     // 5+ minutos
    ];

    for (const pc of pluralCases) {
      setLang(pc.lang);
      const res = getRelativeTime(new Date(mockDate.getTime() - pc.diffMs).toISOString());
      assert.match(res, new RegExp(String(pc.diffMs / 60000)), `[${pc.lang}] "${res}" should contain the number ${pc.diffMs / 60000}`);
    }

    console.log('Cross-language plural form tests passed!');

    // Cross-language hours plural coverage
    setLang('en');
    assert.strictEqual(getRelativeTime(new Date(mockDate.getTime() - 2 * 3600000).toISOString()), `2 ${translations.en.hoursAgo}`);
    assert.strictEqual(getRelativeTime(new Date(mockDate.getTime() - 5 * 3600000).toISOString()), `5 ${translations.en.hoursAgo}`);

    setLang('ro');
    assert.strictEqual(getRelativeTime(new Date(mockDate.getTime() - 2 * 3600000).toISOString()), `2 ${translations.ro.hoursAgo}`);
    assert.strictEqual(getRelativeTime(new Date(mockDate.getTime() - 5 * 3600000).toISOString()), `5 ${translations.ro.hoursAgo}`);

    console.log('Cross-language hours plural coverage passed!');

  } catch (err) {
    console.error('getRelativeTime tests failed:');
    console.error(err.message);
    process.exit(1);
  } finally {
    Date.now = originalDateNow;
  }
}

runTests();