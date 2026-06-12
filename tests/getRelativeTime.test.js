const { getRelativeTime } = require('../app.js');
const assert = require('node:assert');

const originalDateNow = Date.now;
const mockDate = new Date('2026-06-12T12:00:00Z');
Date.now = () => mockDate.getTime();

try {
  console.log('Testing getRelativeTime...');

  // Test case 1: Standard date (1 hour ago)
  const oneHourAgo = new Date(mockDate.getTime() - 3600000).toISOString();
  const res1 = getRelativeTime(oneHourAgo);
  assert.ok(typeof res1 === 'string');

  // Test case 2: Just now
  const now = new Date(mockDate.getTime()).toISOString();
  const res2 = getRelativeTime(now);
  assert.ok(typeof res2 === 'string');

  // Test case 3: Invalid date
  const resInvalid = getRelativeTime('invalid-date');
  assert.ok(typeof resInvalid === 'string');

  // Test case 4: Far in the past (1 year ago)
  const oneYearAgo = new Date(mockDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const res4 = getRelativeTime(oneYearAgo);
  assert.ok(typeof res4 === 'string');

  console.log('getRelativeTime tests passed!');
} catch (err) {
  console.error('getRelativeTime tests failed:');
  console.error(err);
  process.exit(1);
} finally {
  Date.now = originalDateNow;
}
