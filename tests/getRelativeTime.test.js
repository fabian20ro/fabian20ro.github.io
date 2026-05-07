const test = require('node:test');
const assert = require('node:assert');
const { getRelativeTime, setLang } = require('../app.js');

test('getRelativeTime - English', (t) => {
  const now = Date.now();
  // Mock Date.now()
  const originalDateNow = Date.now;
  Date.now = () => now;

  setLang('en');

  t.after(() => {
    Date.now = originalDateNow;
  });

  const testCases = [
    { date: new Date(now - 30 * 1000).toISOString(), expected: 'just now', name: 'less than a minute' },
    { date: new Date(now - 60 * 1000).toISOString(), expected: '1 minute ago', name: '1 minute ago' },
    { date: new Date(now - 5 * 60 * 1000).toISOString(), expected: '5 minutes ago', name: '5 minutes ago' },
    { date: new Date(now - 60 * 60 * 1000).toISOString(), expected: '1 hour ago', name: '1 hour ago' },
    { date: new Date(now - 3 * 60 * 60 * 1000).toISOString(), expected: '3 hours ago', name: '3 hours ago' },
    { date: new Date(now - 24 * 60 * 60 * 1000).toISOString(), expected: '1 day ago', name: '1 day ago' },
    { date: new Date(now - 48 * 60 * 60 * 1000).toISOString(), expected: '2 days ago', name: '2 days ago' },
    { date: new Date(now + 5 * 60 * 1000).toISOString(), expected: 'just now', name: 'future date' },
    { date: 'invalid-date', expected: 'just now', name: 'invalid date' }
  ];

  testCases.forEach(({ date, expected, name }) => {
    assert.strictEqual(getRelativeTime(date), expected, `Failed: ${name}`);
  });
});

test('getRelativeTime - Romanian', (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  Date.now = () => now;

  setLang('ro');

  t.after(() => {
    Date.now = originalDateNow;
  });

  const testCases = [
    { date: new Date(now - 30 * 1000).toISOString(), expected: 'chiar acum', name: 'less than a minute (ro)' },
    { date: new Date(now - 60 * 1000).toISOString(), expected: 'acum 1 minut', name: '1 minute ago (ro)' },
    { date: new Date(now - 5 * 60 * 1000).toISOString(), expected: '5 minute în urmă', name: '5 minutes ago (ro)' },
    { date: new Date(now - 60 * 60 * 1000).toISOString(), expected: 'acum 1 oră', name: '1 hour ago (ro)' },
    { date: new Date(now - 3 * 60 * 60 * 1000).toISOString(), expected: '3 ore în urmă', name: '3 hours ago (ro)' },
    { date: new Date(now - 24 * 60 * 60 * 1000).toISOString(), expected: 'acum 1 zi', name: '1 day ago (ro)' },
    { date: new Date(now - 48 * 60 * 60 * 1000).toISOString(), expected: '2 zile în urmă', name: '2 days ago (ro)' },
    { date: new Date(now + 5 * 60 * 1000).toISOString(), expected: 'chiar acum', name: 'future date (ro)' },
    { date: 'invalid-date', expected: 'chiar acum', name: 'invalid date (ro)' }
  ];

  testCases.forEach(({ date, expected, name }) => {
    assert.strictEqual(getRelativeTime(date), expected, `Failed: ${name}`);
  });
});
