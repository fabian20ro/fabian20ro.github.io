const test = require('node:test');
const assert = require('node:assert');
const { loadGitHubActivity } = require('../app.js');

const ACTIVITY_CACHE_KEY = 'github-activity-cache-v1';

function createElement(tagName) {
  return {
    tagName,
    className: '',
    textContent: '',
    href: '',
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    append(...nodes) {
      for (const node of nodes) {
        this.appendChild(node);
      }
    },
    replaceChildren(...nodes) {
      this.children = [...nodes];
    }
  };
}

test('loadGitHubActivity renders the empty-cache state instead of leaving loading text stuck', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('div'));

  global.document = {
    getElementById(id) {
      return id === 'activity-feed' ? feed : null;
    },
    createElement,
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  global.localStorage = {
    getItem(key) {
      if (key === ACTIVITY_CACHE_KEY) {
        return JSON.stringify({ timestamp: now, events: [] });
      }
      return null;
    },
    setItem() {}
  };

  global.sessionStorage = {
    getItem() {
      return null;
    },
    setItem() {}
  };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('fetch should not run for a fresh cache');
  };
  Date.now = () => now;

  t.after(() => {
    Date.now = originalDateNow;
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
    global.fetch = originalFetch;
  });

  await loadGitHubActivity();

  assert.strictEqual(fetchCalls, 0, 'fresh cache should not fetch again');
  assert.strictEqual(feed.children.length, 1, 'feed should replace the loading placeholder');
  assert.strictEqual(feed.children[0].className, 'activity-error');
});
