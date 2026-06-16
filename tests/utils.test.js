const { getBadgeActionsUrl, getEventIcon, getRelativeTime } = require('../app.js');
const assert = require('node:assert');

try {
  console.log('Testing getBadgeActionsUrl...');

  // Test case 1: Valid GitHub badge URL
  const url1 = 'https://github.com/fabian20ro/emot-id/workflows/Deploy/badge.svg';
  const res1 = getBadgeActionsUrl(url1);
  assert.strictEqual(res1, 'https://github.com/fabian20ro/emot-id/actions');

  // Test case 2: Invalid URL
  const url2 = 'not-a-github-url';
  const res2 = getBadgeActionsUrl(url2);
  assert.strictEqual(res2, url2);

  // Test case 3: Not a string
  assert.strictEqual(getBadgeActionsUrl(null), '');
  assert.strictEqual(getBadgeActionsUrl(undefined), '');

  // Test case 4: getEventIcon
  assert.strictEqual(getEventIcon('PushEvent'), '📤');
  assert.strictEqual(getEventIcon('UnknownEvent'), '📌');

  // Test case 5: getRelativeTime
  const now = Date.now();
  assert.strictEqual(getRelativeTime(), 'just now');
  assert.strictEqual(getRelativeTime(new Date(now - 1000).toISOString()), 'just now');
  assert.strictEqual(getRelativeTime(new Date(now - 60000).toISOString()), '1 minute ago');
  assert.strictEqual(getRelativeTime(new Date(now - 3600000).toISOString()), '1 hour ago');
  assert.strictEqual(getRelativeTime(new Date(now - 86400000).toISOString()), '1 day ago');

  console.log('getBadgeActionsUrl tests passed!');
  console.log('getEventIcon tests passed!');
  console.log('getRelativeTime tests passed!');
} catch (err) {
  console.error('Tests failed:');
  console.error(err);
  process.exit(1);
}
