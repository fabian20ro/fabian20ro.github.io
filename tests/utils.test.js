const { getBadgeActionsUrl, getEventIcon } = require('../app.js');
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

  // Test case 5: getEventIcon
  assert.strictEqual(getEventIcon('PushEvent'), '📤');
  assert.strictEqual(getEventIcon('UnknownEvent'), '📌');

  console.log('getBadgeActionsUrl tests passed!');
} catch (err) {
  console.error('getBadgeActionsUrl tests failed:');
  console.error(err);
  process.exit(1);
}
