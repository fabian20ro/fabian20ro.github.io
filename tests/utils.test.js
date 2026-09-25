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

  // Test case 2b: Non-https URL
  const url2b = 'http://github.com/user/repo';
  const res2b = getBadgeActionsUrl(url2b);
  assert.strictEqual(res2b, url2b);

  // Test case 3: Not a string — the guard is typeof-based, so any non-string type yields ''.
  assert.strictEqual(getBadgeActionsUrl(null), '');
  assert.strictEqual(getBadgeActionsUrl(undefined), '');
  assert.strictEqual(getBadgeActionsUrl(0), '');
  assert.strictEqual(getBadgeActionsUrl({}), '');

  // Test case 4: getEventIcon
  assert.strictEqual(getEventIcon('PushEvent'), '📤');
  assert.strictEqual(getEventIcon('UnknownEvent'), '📌');
  assert.strictEqual(getEventIcon(''), '📌');
  assert.strictEqual(getEventIcon(null), '📌');

  // Test case 5: getRelativeTime
  const now = Date.now();
  assert.strictEqual(getRelativeTime(), 'just now');
  assert.strictEqual(getRelativeTime(new Date(now - 1000).toISOString()), 'just now');
  assert.strictEqual(getRelativeTime(new Date(now - 60000).toISOString()), '1 minute ago');
  assert.strictEqual(getRelativeTime(new Date(now - 3600000).toISOString()), '1 hour ago');
  assert.strictEqual(getRelativeTime(new Date(now - 86400000).toISOString()), '1 day ago');

  // Test case 5b: plural unit branches — minutes, hours, days, months, years.
  assert.strictEqual(getRelativeTime(new Date(now - 5 * 60000).toISOString()), '5 minutes ago');
  assert.strictEqual(getRelativeTime(new Date(now - 3 * 3600000).toISOString()), '3 hours ago');
  assert.strictEqual(getRelativeTime(new Date(now - 5 * 86400000).toISOString()), '5 days ago');
  assert.strictEqual(getRelativeTime(new Date(now - 45 * 86400000).toISOString()), '1 month ago');
  assert.strictEqual(getRelativeTime(new Date(now - 90 * 86400000).toISOString()), '3 months ago');
  assert.strictEqual(
    getRelativeTime(new Date(now - 360 * 86400000).toISOString()),
    '12 months ago'
  );
  assert.strictEqual(
    getRelativeTime(new Date(now - 730 * 86400000).toISOString()),
    '2 years ago'
  );

  // Test case 5c: singular 1-year branch — a 365-day-old date returns the singular
  // '1 year ago' (t('yearAgo')). Distinguishes it from the '12 months ago' fallback
  // (360-364 days) and the plural 'N years ago' (730+ days).
  assert.strictEqual(
    getRelativeTime(new Date(now - 365 * 86400000).toISOString()),
    '1 year ago'
  );

  // Test case 6: all projectSections badgeUrl patterns — lock in coverage for every live project and repo.
  const patternA = 'https://github.com/fabian20ro/emot-id/workflows/Deploy%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternA), 'https://github.com/fabian20ro/emot-id/actions');

  const patternB = 'https://github.com/fabian20ro/alt-infotb/workflows/Deploy/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternB), 'https://github.com/fabian20ro/alt-infotb/actions');

  const patternC =
    'https://github.com/fabian20ro/propozitii-absurde/workflows/Deploy%20Frontend%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternC), 'https://github.com/fabian20ro/propozitii-absurde/actions');

  const patternD = 'https://github.com/fabian20ro/random-passwords/workflows/Deploy%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternD), 'https://github.com/fabian20ro/random-passwords/actions');

  const patternGoldilocks =
    'https://github.com/fabian20ro/goldilocks-engine/workflows/Deploy%20GitHub%20Pages/badge.svg';
  assert.strictEqual(
    getBadgeActionsUrl(patternGoldilocks),
    'https://github.com/fabian20ro/goldilocks-engine/actions'
  );

  const patternE = 'https://github.com/fabian20ro/listen-to-articles/workflows/Deploy%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternE), 'https://github.com/fabian20ro/listen-to-articles/actions');

  const patternF = 'https://github.com/fabian20ro/book-finder/workflows/Deploy%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternF), 'https://github.com/fabian20ro/book-finder/actions');

  const patternG = 'https://github.com/fabian20ro/browser-zodiac/workflows/Deploy%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternG), 'https://github.com/fabian20ro/browser-zodiac/actions');

  const patternBooking =
    'https://github.com/fabian20ro/booking-exclusion-filter/workflows/Deploy%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(
    getBadgeActionsUrl(patternBooking),
    'https://github.com/fabian20ro/booking-exclusion-filter/actions'
  );

  const patternH = 'https://github.com/fabian20ro/generator-rebus/workflows/Deploy%20Frontend%20to%20GitHub%20Pages/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternH), 'https://github.com/fabian20ro/generator-rebus/actions');

  const patternI =
    'https://github.com/fabian20ro/prompt-to-image-variations/actions/workflows/pages/pages-build-deployment/badge.svg';
  // Modern workflow badge retains its Actions destination.
  assert.strictEqual(
    getBadgeActionsUrl(patternI),
    'https://github.com/fabian20ro/prompt-to-image-variations/actions'
  );

  // Test case 7: idempotence — all GitHub variants resolve to one Actions suffix.
  const repoBase = 'https://github.com/fabian20ro/emot-id';
  assert.strictEqual(getBadgeActionsUrl(repoBase), repoBase + '/actions');
  assert.strictEqual(
    getBadgeActionsUrl('https://github.com/fabian20ro/emot-id/actions'),
    repoBase + '/actions'
  );

  // Test case 8: non-fabian20ro user/org — ensures the regex is not org-hardcoded.
  const patternJ = 'https://github.com/octocat/my-repo/workflows/CI/badge.svg';
  assert.strictEqual(
    getBadgeActionsUrl(patternJ),
    'https://github.com/octocat/my-repo/actions'
  );

  // Test case 9: trailing-slash repo base — the current regex still extracts a match and
  // appends /actions (known limitation of /^…\/[^/]+\/[^/]+$/ without anchoring).
  const patternK = 'https://github.com/fabian20ro/emot-id/';
  assert.strictEqual(
    getBadgeActionsUrl(patternK),
    'https://github.com/fabian20ro/emot-id/actions'
  );

  // Test case 10: non-GitHub URL shaped like a GitHub workflow — must not be rewritten.
  const patternL = 'https://gitlab.com/user/repo/workflows/CI/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternL), patternL);

  // Test case 11: /actions already in mid-path with deeper nesting — idempotence still applies.
  const patternM = 'https://github.com/fabian20ro/emot-id/actions/steps/build/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternM), 'https://github.com/fabian20ro/emot-id/actions');

  // Test case 12: GitHub URL without workflow prefix — current regex matches org/repo regardless, so it still appends /actions (known limitation).
  const patternN = 'https://github.com/fabian20ro/emot-id/blob/main/README.md';
  assert.strictEqual(
    getBadgeActionsUrl(patternN),
    'https://github.com/fabian20ro/emot-id/actions'
  );

  // Test case 13: idempotence — trailing-slash workflow badge (realistic).
  const patternO =
    'https://github.com/fabian20ro/emot-id/workflows/Deploy/badge.svg/';
  assert.strictEqual(
    getBadgeActionsUrl(patternO),
    'https://github.com/fabian20ro/emot-id/actions'
  );

  // Test case 14: idempotence — URL already nested under /actions/* with deeper segments.
  const patternP =
    'https://github.com/fabian20ro/emot-id/actions/workflows/ci.yml/badge.svg';
  assert.strictEqual(
    getBadgeActionsUrl(patternP),
    'https://github.com/fabian20ro/emot-id/actions'
  );

  // Test case 15: a GitHub-shaped URL that isn't https — must be rejected by regex and returned unchanged.
  const patternQ =
    'ftp://github.com/user/repo/workflows/CI/badge.svg';
  assert.strictEqual(getBadgeActionsUrl(patternQ), patternQ);

  // Test case 16: getRelativeTime defensive input handling — non-string input → '',
  // blank/invalid/future dates → 'just now'.
  assert.strictEqual(getRelativeTime(12345), '');
  assert.strictEqual(getRelativeTime({}), '');
  assert.strictEqual(getRelativeTime('   '), 'just now');
  assert.strictEqual(getRelativeTime('not-a-date'), 'just now');
  assert.strictEqual(getRelativeTime(new Date(now + 60000).toISOString()), 'just now');

  console.log('getBadgeActionsUrl tests passed!');
  console.log('getEventIcon tests passed!');
  console.log('getRelativeTime tests passed!');
} catch (err) {
  console.error('Tests failed:');
  console.error(err);
  process.exit(1);
}
