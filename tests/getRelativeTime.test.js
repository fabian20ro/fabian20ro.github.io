const { getRelativeTime } = require('../app.js');
const assert = require('node:assert');

// Since getRelativeTime relies on global state (currentLang) and translations,
// we'll check if it at least handles the basic flow without crashing.

try {
  console.log('Testing getRelativeTime...');

  // Test case 1: Standard date
  const date = new Date('2026-06-12T12:00:00Z');
  const res = getRelativeTime(date.toISOString());
  // We don't know the exact output because of t(key), but it shouldn't crash
  assert.ok(typeof res === 'string');

  // Test case 2: Just now
  const now = new Date().toISOString();
  const resNow = getRelativeTime(now);
  assert.ok(typeof resNow === 'string');

  // Test case 3: Invalid date
  const resInvalid = getRelativeTime('invalid-date');
  assert.ok(typeof resInvalid === 'string');

  console.log('getRelativeTime tests passed!');
} catch (err) {
  console.error('getRelativeTime tests failed:');
  console.error(err);
  process.exit(1);
}
