const test = require('node:test');
const assert = require('node:assert');
const { loadGitHubActivity } = require('../app.js');

const ACTIVITY_CACHE_KEY = 'github-activity-cache-v1';
// ACTIVITY_CACHE_TTL_MS is defined as 600_000 (10 minutes) in app.js but not exported.
const ACTIVITY_CACHE_TTL_MS = 600_000;

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

test('loadGitHubActivity ignores a cache whose parsed structure has an invalid (string) timestamp', async (t) => {
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

  // Write a cache with valid JSON but an invalid timestamp type (string instead of number).
  // readActivityCache should treat this as no-cache and fall back to fetching.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: '1700000000',
    events: [{ type: 'PushEvent', repo: { name: 'stale-repo' }, created_at: new Date(now).toISOString(), payload: {} }]
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

  assert.strictEqual(fetchCalls, 1, 'string timestamp cache should be ignored and fetch triggered');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.timestamp, now, 'new cache should have a valid numeric timestamp');
  assert.deepStrictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'events should reflect fresh data');
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
});

test('loadGitHubActivity ignores a cache whose events field is not an array', async (t) => {
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

  // Cache with valid JSON and number timestamp, but events is a string (not an array).
  // readActivityCache should treat this as invalid and fall back to fetching.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now - 1000,
    events: 'this-is-not-an-array'
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  const mockEvents = [{ type: 'PullRequestEvent', repo: { name: 'new-repo' }, created_at: new Date(now).toISOString(), payload: {} }];
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

  assert.strictEqual(fetchCalls, 1, 'non-array events cache should be ignored and fetch triggered');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.events.length, 1, 'new cache should contain fetched events as an array');
  assert.strictEqual(updatedCached.events[0].repo.name, 'new-repo', 'events should reflect fresh data');
});

test('loadGitHubActivity treats a future-dated timestamp as stale and refetches', async (t) => {
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

  // Cache with a future timestamp (clock skew or manipulated clock).
  // isCacheFresh should treat this as stale and trigger a fetch.
  const futureTimestamp = now + 60 * 60 * 1000; // 1 hour in the future
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: futureTimestamp,
    events: [{ type: 'PushEvent', repo: { name: 'old-repo' }, created_at: new Date(futureTimestamp).toISOString(), payload: {} }]
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

  assert.strictEqual(fetchCalls, 1, 'future-dated timestamp should trigger a fresh fetch');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.timestamp, now, 'updated cache timestamp should equal current time');
  assert.deepStrictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'events should reflect fresh data');
});

test('loadGitHubActivity expires a cache exactly at TTL boundary and refetches', async (t) => {
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

  // Cache with timestamp exactly at TTL boundary (10 minutes old = 600_000 ms).
  // isCacheFresh treats ageMs >= ACTIVITY_CACHE_TTL_MS as stale.
  const ttlBoundary = now - 600_000;
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: ttlBoundary,
    events: [{ type: 'PushEvent', repo: { name: 'boundary-repo' }, created_at: new Date(ttlBoundary).toISOString(), payload: {} }]
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

  assert.strictEqual(fetchCalls, 1, 'cache at TTL boundary should trigger a fresh fetch');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.timestamp, now, 'updated cache timestamp should equal current time');
  assert.deepStrictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'events should reflect fresh data');
});

test('loadGitHubActivity keeps a cache one millisecond before TTL expiration', async (t) => {
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

  // Cache with timestamp one millisecond before TTL boundary (still valid).
  const justBeforeTTL = now - 600_000 + 1;
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: justBeforeTTL,
    events: [{ type: 'PushEvent', repo: { name: 'valid-repo' }, created_at: new Date(justBeforeTTL).toISOString(), payload: {} }]
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  const mockEvents = [{ type: 'WatchEvent', repo: { name: 'fresh-repo' }, created_at: new Date(now).toISOString(), payload: {} }];
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

  assert.strictEqual(fetchCalls, 0, 'cache just before TTL expiration should not trigger fetch');
});

test('loadGitHubActivity truncates the cached event list to a maximum of 30 entries', async (t) => {
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

  const mockEvents = Array.from({ length: 50 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `repo-${i}` },
    created_at: new Date(now).toISOString(),
    payload: {}
  }));

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
  assert.strictEqual(cached.events.length, 30, 'cached events array must be truncated to at most 30 entries');
});

test('loadGitHubActivity writes empty events to cache and renders error state on successful fetch with zero results', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('div')); // placeholder "loading" element

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

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

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

  assert.strictEqual(fetchCalls, 1, 'should fetch when no cache is present');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written to localStorage even for empty results');
  const cached = JSON.parse(cacheRaw);
  assert.strictEqual(cached.timestamp, now, 'new cache timestamp should equal current time');
  assert.deepStrictEqual(cached.events, [], 'cached events array should match fetched data exactly (empty)');
  // When renderActivity receives an empty list it calls showActivityError() which renders an error element with className "activity-error"
  assert.strictEqual(feed.children.length, 1, 'feed should contain the error state element');
  assert.strictEqual(feed.children[0].className, 'activity-error', 'error state should use activity-error class');
});

test('loadGitHubActivity does not truncate the cache when fetched list is small', async (t) => {
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

  const mockEvents = Array.from({ length: 3 }, (_, i) => ({
    type: 'WatchEvent',
    repo: { name: `watch-${i}` },
    created_at: new Date(now).toISOString(),
    payload: {}
  }));

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
  assert.strictEqual(cached.events.length, 3, 'small fetched list should not be truncated');
});

test('isCacheFresh rejects a cache with NaN timestamp as stale', () => {
  const isFresh = require('../app.js').isCacheFresh;
  assert.strictEqual(isFresh({ timestamp: Number.NaN }), false);
  assert.strictEqual(isFresh({ timestamp: Number.POSITIVE_INFINITY }), false);
  assert.strictEqual(isFresh({ timestamp: Number.NEGATIVE_INFINITY }), false);
  // A valid numeric timestamp should still pass.
  assert.strictEqual(isFresh({ timestamp: Date.now() - 1000 }), true);
});

test('loadGitHubActivity rejects a cache whose events field is missing', async (t) => {
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

  // Cache with valid JSON and number timestamp but no events field.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now - 1000
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  const mockEvents = [{ type: 'WatchEvent', repo: { name: 'new-repo' }, created_at: new Date(now).toISOString(), payload: {} }];
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

  assert.strictEqual(fetchCalls, 1, 'cache without events field should trigger a fresh fetch');
});

test('loadGitHubActivity keeps cached content when refresh returns non-JSON body', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('au')); // placeholder

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
        // Stale cache with valid events to preserve on fetch failure.
        return JSON.stringify({
          timestamp: now - 11 * 60 * 1000,
          events: [
            { type: 'PushEvent', repo: { name: 'fabian20ro/demo' }, created_at: new Date(now - 5 * 60 * 1000).toISOString(), payload: {} }
          ]
        });
      }
      return null;
    },
    setItem() {}
  };

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    // HTTP 200 but body is HTML/text, not JSON — r.json() will throw.
    return new Response('<html>500 Internal Server Error</html>', { status: 200 });
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
  assert.strictEqual(feed.children[0].children[0].className, 'activity-item', 'event item rendered from cache');
});
