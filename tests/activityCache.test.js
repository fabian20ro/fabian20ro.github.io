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
    },
    setAttribute(name, value) {
      this[name] = value;
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

test('loadGitHubActivity keeps rendered cached activity visible when refresh fails', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('au')); // Use dummy tag

  global.document = {
    getElementById(id) {
      return id === 'activity-feed' ? feed : null;
    },
    createElement,
    createDocumentFragment() {
      return createElement('fragment');
    },
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  global.localStorage = {
    getItem(key) {
      if (key === ACTIVITY_CACHE_KEY) {
        return JSON.stringify({
          timestamp: now - 11 * 60 * 1000,
          events: [
            {
              type: 'PushEvent',
              repo: { name: 'fabian20ro/demo-repo' },
              created_at: new Date(now - 5 * 60 * 1000).toISOString(),
              payload: { ref: 'refs/heads/main' }
            }
          ]
        });
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
    throw new Error('refresh should fail in this test');
  };
  Date.now = () => now;

  t.after(() => {
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
    global.fetch = originalFetch;
  });

  await loadGitHubActivity();

  assert.strictEqual(fetchCalls, 1, 'stale cache should trigger one refresh attempt');
  assert.strictEqual(feed.children.length, 1, 'feed should still contain rendered cached content');
  assert.strictEqual(feed.children[0].className, '', 'cached content should remain visible');
  assert.strictEqual(
    feed.children[0].children.length,
    1,
    'cached fragment should contain the event item'
  );
  assert.strictEqual(feed.children[0].children[0].className, 'activity-item');
});

test('loadGitHubActivity handles malformed JSON in cache gracefully', async (t) => {
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
        return 'invalid-json-{';
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
    return new Response(JSON.stringify([]), { status: 200 });
  };

  t.after(() => {
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
    global.fetch = originalFetch;
  });

  await loadGitHubActivity();

  assert.strictEqual(fetchCalls, 1, 'should fallback to fetching when cache is malformed');
  assert.strictEqual(feed.children.length, 1, 'feed should be updated with fetched data');
  assert.notStrictEqual(feed.toString(), 'error'); // Just a dummy check
});
