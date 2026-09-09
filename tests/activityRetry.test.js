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
