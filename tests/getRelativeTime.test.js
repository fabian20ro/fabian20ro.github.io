const { getRelativeTime } = require('../app.js');
const assert = require('node:assert');

// Mock Date.now and provide a controlled time
const originalDateNow = Date.now;
const mockDate = new Date('2026-06-12T12:00:00Z');
Date.now = () => mockDate.getTime();

try {
  console.log('Testing getRelativeTime...');

  // Test case 1: Standard date (1 hour ago)
  const oneHourAgo = new Date(mockDate.getTime() - 3600000).toISOString();
  const res1 = getRelativeTime(oneHourAgo);
  assert.strictEqual(res1, '1 hour ago');

  // Test case 2: Just now
  const now = new Date(mockDate.getTime()).toISOString();
  const res2 = getRelativeTime(now);
  assert.strictEqual(res2, 'just now');

  // Test case 3: Invalid date
  const resInvalid = getRelativeTime('invalid-date');
  assert.strictEqual(resInvalid, 'just now');

  // Test case 4: Far in the past (1 year ago)
  const oneYearAgo = new Date(mockDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const res4 = getRelativeTime(oneYearAgo);
  assert.strictEqual(res4, '1 year ago');

  // Test case 5: Future date (should be treated as "just now")
  const futureDate = new Date(mockDate.getTime() + 3600000).toISOString();
  const resFuture = getRelativeTime(futureDate);
  assert.strictEqual(resFuture, 'just now');

  // Test case 6: Extreme past year (1970)
  const extremePast = new Date('1970-01-01T00:00:00Z').toISOString();
  const resExtremePast = getRelativeTime(extremePast);
  assert.ok(typeof resExtremePast === 'string');

  // Test case 7: Extreme future year (2050)
  const extremeFuture = new Date('2050-01-01T00:00:00Z').toISOString();
  const resExtremeFuture = getRelativeTime(extremeFuture);
  assert.strictEqual(resExtremeFuture, 'just now');

  // Test case 8: minutes ago (2 minutes)
  const twoMinsAgo = new Date(mockDate.getTime() - 120000).toISOString();
  const resTwoMins = getRelativeTime(twoMinsAgo);
  assert.strictEqual(resTwoMins, '2 minutes ago');

  console.log('getRelativeTime tests passed!');
} catch (err) {
  console.error('getRelativeTime tests failed:');
  console.error(err);
  process.exit(1);
} finally {
  Date.now = originalDateNow;
}
