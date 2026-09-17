const test = require('node:test');
const assert = require('node:assert/strict');

function setup(t) {
  const original = Object.fromEntries(
    ['document', 'localStorage', 'sessionStorage', 'fetch'].map((key) => [key, global[key]])
  );
  const appPath = require.resolve('../app.js');
  delete require.cache[appPath];
  const app = require(appPath);
  function element(tagName) {
    return {
      tagName,
      children: [],
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      append(...children) {
        this.children.push(...children);
      },
      replaceChildren(...children) {
        this.children = children;
      },
      setAttribute(key, value) {
        this[key] = value;
      },
      getAttribute(key) {
        return this[key];
      }
    };
  }
  const feed = element('div');
  global.document = {
    documentElement: {},
    getElementById: (id) => (id === 'activity-feed' ? feed : null),
    createElement: element,
    createDocumentFragment: () => element('fragment'),
    createTextNode: (textContent) => ({ textContent }),
    querySelectorAll: (selector) =>
      selector === '[data-i18n]'
        ? (feed.children[0]?.children || []).filter((child) => child['data-i18n'])
        : []
  };
  global.localStorage = { getItem: () => null, setItem() {} };
  global.sessionStorage = { getItem: () => null, setItem() {} };
  t.after(() => {
    Object.assign(global, original);
    delete require.cache[appPath];
  });
  return { app, feed };
}

test('retry copy is present across every existing UI translation block', () => {
  const { translations } = require('../app.js');
  assert.equal(translations.en.activityRetry, 'Try again');
  assert.equal(translations.ro.activityRetry, 'Încearcă din nou');
  for (const [lang, strings] of Object.entries(translations)) {
    assert.equal(typeof strings.activityRetry, 'string', `${lang} must define activityRetry`);
    assert.ok(strings.activityRetry.trim(), `${lang} must not have an empty retry label`);
  }
});

test('retry uses a second fetch, prevents duplicate activation, and replaces the error on success', async (t) => {
  const { app, feed } = setup(t);
  let calls = 0;
  let finishFetch;
  global.fetch = async () => {
    calls++;
    if (calls === 1) throw new Error('offline');
    return new Promise((resolve) => {
      finishFetch = resolve;
    });
  };
  await app.loadGitHubActivity();
  const retry = feed.children[0].children[2];
  assert.ok(retry, 'failed request renders retry');
  const pending = retry.onclick();
  assert.equal(calls, 2);
  assert.equal(retry.disabled, true);
  await retry.onclick();
  assert.equal(calls, 2, 'pending retry does not fetch again');
  finishFetch({
    ok: true,
    json: async () => [
      {
        type: 'PushEvent',
        repo: { name: 'fabian20ro/retry-success' },
        created_at: new Date().toISOString(),
        payload: { ref: 'refs/heads/main' }
      }
    ]
  });
  await pending;
  assert.equal(feed.children[0].tagName, 'fragment');
  assert.equal(feed.children[0].children[0].className, 'activity-item');
});

test('failed retry remains recoverable and new retry label follows EN/RO language switching', async (t) => {
  const { app, feed } = setup(t);
  let calls = 0;
  global.fetch = async () => {
    calls++;
    throw new Error('offline');
  };
  await app.loadGitHubActivity();
  app.setLang('ro');
  let retry = feed.children[0].children[2];
  assert.ok(retry, 'failed request renders retry');
  assert.equal(retry.textContent, 'Încearcă din nou');
  await retry.onclick();
  assert.equal(calls, 2);
  retry = feed.children[0].children[2];
  assert.notEqual(retry.disabled, true, 'failed retry leaves a usable replacement control');
  assert.equal(retry.textContent, 'Încearcă din nou');
  app.setLang('en');
  assert.equal(retry.textContent, 'Try again');
  await retry.onclick();
  assert.equal(calls, 3);
});

test('failed retry keeps the GitHub fallback link at the fixed error-slot position', async (t) => {
  const { app, feed } = setup(t);
  let calls = 0;
  global.fetch = async () => {
    calls++;
    throw new Error('offline');
  };
  await app.loadGitHubActivity();

  const verifyFallback = (message) => {
    const error = feed.children[0];
    assert.equal(error.className, 'activity-error', message);
    assert.equal(error.children.length, 3, 'failed retry re-renders message, link, and retry');
    const link = error.children[1];
    assert.equal(link.tagName, 'a');
    assert.equal(link.href, 'https://github.com/fabian20ro?tab=activity');
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
  };

  verifyFallback('initial failed load exposes the GitHub fallback link');

  await feed.children[0].children[2].onclick();
  assert.equal(calls, 2, 'retry issued a second fetch that also failed');
  verifyFallback('failed retry re-render preserves the GitHub fallback link');

  app.setLang('ro');
  verifyFallback('language switch after a failed retry preserves the GitHub fallback link');
});

test('retry that succeeds with an empty list shows successful empty state without a retry control', async (t) => {
  const { app, feed } = setup(t);
  let calls = 0;
  global.fetch = async () => {
    calls++;
    if (calls === 1) throw new Error('offline');
    return { ok: true, json: async () => [] };
  };
  await app.loadGitHubActivity();
  assert.equal(calls, 1);
  const retry = feed.children[0].children[2];
  assert.ok(retry, 'failed request renders retry');
  const settled = retry.onclick();
  assert.equal(calls, 2);
  assert.equal(retry.disabled, true);
  await settled;
  const error = feed.children[0].children[0];
  assert.equal(error.children[0].textContent, 'No recent public activity. ', 'successful empty is not a loading failure');
  assert.equal(error.children.length, 2, 'empty success removes the retry control');
  assert.equal(error.children[1].tagName, 'a', 'error block keeps the GitHub fallback link');
  assert.equal(error.children[1].href, 'https://github.com/fabian20ro?tab=activity');
});

test('429 rate-limit window disables retry, survives forced loads, and resets on success', async (t) => {
  const { app, feed } = setup(t);
  const realNow = Date.now;
  let offset = 0;
  Date.now = () => realNow() + offset;
  t.after(() => {
    Date.now = realNow;
  });
  let calls = 0;
  let finishFetch;
  global.fetch = async () => {
    calls++;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: { get: (key) => (key === 'retry-after' ? '300' : null) }
      };
    }
    if (calls === 2) {
      return new Promise((resolve) => {
        finishFetch = resolve;
      });
    }
    throw new Error('offline again');
  };
  await app.loadGitHubActivity();
  const retry = feed.children[0].children[2];
  assert.ok(retry, 'failed request renders retry');
  assert.equal(retry.disabled, true, 'server retry window disables the control');
  await retry.onclick();
  assert.equal(calls, 1, 'disabled retry starts no request');
  await app.loadGitHubActivity({ force: true });
  assert.equal(calls, 1, 'force bypasses backoff, not the server retry window');
  offset = 310_000;
  const settled = app.loadGitHubActivity();
  assert.equal(calls, 2, 'request resumes once the server window elapses');
  finishFetch({
    ok: true,
    json: async () => [
      {
        type: 'PushEvent',
        repo: { name: 'fabian20ro/rate-limit-recovery' },
        created_at: new Date().toISOString(),
        payload: { ref: 'refs/heads/main' }
      }
    ]
  });
  await settled;
  assert.equal(feed.children[0].tagName, 'fragment');
  assert.equal(feed.children[0].children[0].className, 'activity-item');
  assert.equal(
    feed.children[0].children.some((child) => child.className === 'activity-retry'),
    false,
    'successful retry removes the rate-limit control'
  );
  await app.loadGitHubActivity({ force: true });
  assert.equal(calls, 3, 'forced reload after success hits the network');
  const freshRetry = feed.children[0].children[1].children[2];
  assert.ok(freshRetry, 'new failure renders a retry control');
  assert.equal(
    freshRetry.disabled,
    false,
    'success cleared the server retry window, so the new control is immediately usable'
  );
});
