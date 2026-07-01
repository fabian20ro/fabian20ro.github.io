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

test('loadGitHubActivity updates the cache with an empty list if the fetch returns an empty list', async (t) => {
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

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  global.sessionStorage = {
    getItem() { return null; },
    setItem() {}
  };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify([]), { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'should fetch if no cache is present');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written to localStorage');
  const cached = JSON.parse(cacheRaw);
  assert.deepStrictEqual(cached.events, [], 'cache should contain an empty events array');
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

test('loadGitHubActivity falls back to fetching when the cached timestamp is missing', async (t) => {
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

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  // Write a cache with timestamp missing (JSON.stringify drops undefined keys)
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    events: [{ type: 'PushEvent', repo: { name: 'x' }, created_at: new Date().toISOString(), payload: {} }]
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  const mockEvents = [{ type: 'PushEvent', repo: { name: 'test-repo' }, created_at: new Date(now).toISOString(), payload: {} }];
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify(mockEvents), { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'missing timestamp should fall back to fetching');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written after successful fetch');
  const cached = JSON.parse(cacheRaw);
  assert.strictEqual(cached.timestamp, now, 'new cache should have a valid timestamp');
});

test('loadGitHubActivity writes updated activity to cache on successful fetch', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalLocalStorage = global.localStorage;
  const originalDocument = global.document;
  const originalFetch = global.fetch;

  const feed = createElement('div');

  global.document = {
    getElementById(id) {
      return id === 'activity-feed' ? feed : null;
    },
    createElement,
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  const mockEvents = [
    {
      type: 'PushEvent',
      repo: { name: 'test-repo' },
      created_at: new Date(now).toISOString(),
      payload: { ref: 'refs/heads/main' }
    }
  ];

  global.fetch = async () => {
    return new Response(JSON.stringify(mockEvents), { status: 200 });
  };
  Date.now = () => now;

  t.after(() => {
    Date.now = originalDateNow;
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.fetch = originalFetch;
  });

  await loadGitHubActivity();

  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written to localStorage');
  const cached = JSON.parse(cacheRaw);
  assert.strictEqual(cached.timestamp, now, 'cache timestamp should match now');
  assert.strictEqual(cached.events.length, 1, 'cache should contain fetched events');
  assert.strictEqual(cached.events[0].repo.name, 'test-repo');
});

test('loadGitHubActivity expires the cache when timestamp exceeds TTL', async (t) => {
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
    createDocumentFragment() {
      return createElement('fragment');
    },
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  // Write a cache with timestamp older than the 10-minute TTL (ACTIVITY_CACHE_TTL_MS = 600_000 ms)
  const staleTimestamp = now - 11 * 60 * 1000;
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: staleTimestamp,
    events: [{ type: 'PushEvent', repo: { name: 'old-repo' }, created_at: new Date(staleTimestamp).toISOString(), payload: {} }]
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  const mockEvents = [{ type: 'WatchEvent', repo: { name: 'fresh-repo' }, created_at: new Date(now).toISOString(), payload: {} }];
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify(mockEvents), { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'expired cache should trigger a fresh fetch');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'new cache entry should be written');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.timestamp, now, 'updated cache timestamp should equal current time');
  assert.strictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'cache events should reflect fresh fetch data');
});
