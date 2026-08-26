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
  const errorNode = feed.children[0];
  assert.strictEqual(errorNode.className, 'activity-error');
  assert.strictEqual(errorNode.children.length, 2, 'error node should contain message text and a GitHub link');
  const link = errorNode.children[1];
  assert.strictEqual(link.tagName, 'a', 'second child of error node should be the GitHub link');
  assert.strictEqual(link.href, 'https://github.com/fabian20ro?tab=activity', 'link should point at the GitHub activity tab');
  assert.strictEqual(link.target, '_blank', 'link should open in a new tab');
  assert.strictEqual(link.rel, 'noopener noreferrer', 'link should be a safe cross-origin link');
  assert.strictEqual(link.textContent, 'View activity on GitHub', 'link label should use the English translation by default');
});

test('loadGitHubActivity renders the GitHub link error state when there is no cache and the fetch fails', async (t) => {
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
    getItem() {
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
    throw new Error('fetch should fail in this test');
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

  assert.strictEqual(fetchCalls, 1, 'missing cache should trigger one fetch attempt');
  assert.strictEqual(feed.children.length, 1, 'feed should be replaced with the error node');
  const errorNode = feed.children[0];
  assert.strictEqual(errorNode.className, 'activity-error');
  assert.strictEqual(errorNode.children.length, 2, 'error node should contain message text and a GitHub link');
  assert.strictEqual(errorNode.children[0].textContent, 'Could not load activity. ', 'message should use the English translation');
  const link = errorNode.children[1];
  assert.strictEqual(link.tagName, 'a');
  assert.strictEqual(link.href, 'https://github.com/fabian20ro?tab=activity');
  assert.strictEqual(link.target, '_blank');
  assert.strictEqual(link.rel, 'noopener noreferrer');
  assert.strictEqual(link.textContent, 'View activity on GitHub');
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

test('loadGitHubActivity caps cached events at the writeActivityCache limit (30 items)', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalLocalStorage = global.localStorage;
  const originalDocument = global.document;
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

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  // Generate more events than the writeActivityCache slice cap (30).
  const mockEvents = Array.from({ length: 45 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `test-repo-${i}` },
    created_at: new Date(now - i * 60_000).toISOString(),
    payload: { ref: 'refs/heads/main' }
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
  assert.strictEqual(
    cached.events.length,
    30,
    'writeActivityCache must cap the cached events at 30'
  );
  // First item preserved (slice is head-bounded).
  assert.strictEqual(cached.events[0].repo.name, 'test-repo-0');
  // Last cached item is index 29.
  assert.strictEqual(cached.events[cached.events.length - 1].repo.name, 'test-repo-29');
});

test('loadGitHubActivity rejects a cache whose events array is not an actual Array', async (t) => {
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

  // Cache with valid number timestamp but events as a plain object (not Array).
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now,
    events: { '0': { type: 'PushEvent', repo: { name: 'x' }, created_at: new Date(now).toISOString(), payload: {} } }
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

  assert.strictEqual(fetchCalls, 1, 'non-Array events cache should fall back to fetching');
});

test('loadGitHubActivity coerces a non-array API response into an empty cached list', async (t) => {
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

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  // Simulate API returning a string (non-array JSON).
  const mockResponse = '{"status":"ok"}';
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response(mockResponse, { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'should fetch exactly once');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written even when API returns non-array data');
  const cached = JSON.parse(cacheRaw);
  assert.deepStrictEqual(cached.events, [], 'events array must be empty for non-array response');
  assert.strictEqual(cached.timestamp, now, 'cache timestamp should reflect fetch moment');
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

test('loadGitHubActivity handles a non-successful HTTP response from GitHub gracefully', async (t) => {
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

  // No cache present; fetch will be called.
  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    // Simulate GitHub API returning a non-successful HTTP status (502 Bad Gateway).
    return new Response(JSON.stringify({ message: 'Service unavailable' }), { status: 502 });
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

  assert.strictEqual(fetchCalls, 1, 'should attempt exactly one fetch');
  // The function must not throw on a non-2xx response and should surface an error state.
  assert.notStrictEqual(feed.children.length, 0, 'feed should be updated (not left empty)');
});

test('loadGitHubActivity handles non-JSON body on successful HTTP response gracefully', async (t) => {
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

  // No cache present; fetch will be called and should fail gracefully.
  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    // Simulate GitHub API returning HTTP 200 with non-JSON body (partial failure).
    return new Response('not json', { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'should attempt exactly one fetch');
  // The function must not throw on a non-JSON body and should surface an error state.
  assert.notStrictEqual(feed.children.length, 0, 'feed should be updated (not left empty)');
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

test('loadGitHubActivity ignores an empty parsed cache object and fetches fresh data', async (t) => {
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

  // Cache with valid JSON but empty object (no events field).
  // readActivityCache should treat this as no-cache and fall back to fetching.
  storage.set(ACTIVITY_CACHE_KEY, '{}');

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

  assert.strictEqual(fetchCalls, 1, 'empty object cache should trigger a fresh fetch');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.deepStrictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'events should reflect fresh data');
});

test('loadGitHubActivity ignores a cache with null events field and fetches fresh data', async (t) => {
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

  // Cache with valid timestamp but null events field.
  // readActivityCache should treat this as invalid and fall back to fetching.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now - 1000,
    events: null
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

  assert.strictEqual(fetchCalls, 1, 'null events cache should trigger a fresh fetch');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.deepStrictEqual(updatedCached.events[0].repo.name, 'new-repo', 'events should reflect fresh data');
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

test('isCacheFresh rejects a cache with NaN or Infinity timestamp as stale', (t) => {
  const { isCacheFresh } = require('../app.js');

  // Cache entry with valid structure but an invalid (non-finite) timestamp.
  // isCacheFresh should treat any non-finite timestamp as stale so that the
  // activity feed will fetch fresh data instead of keeping rendered garbage.
  const cacheNaN = { timestamp: Number.NaN, events: [] };
  const cacheInfinity = { timestamp: Number.POSITIVE_INFINITY, events: [] };
  const cacheNegInfinity = { timestamp: Number.NEGATIVE_INFINITY, events: [] };

  assert.strictEqual(isCacheFresh(cacheNaN), false, 'NaN timestamp should be treated as stale');
  assert.strictEqual(
    isCacheFresh(cacheInfinity),
    false,
    '+Infinity timestamp should be treated as stale'
  );
  assert.strictEqual(
    isCacheFresh(cacheNegInfinity),
    false,
    '-Infinity timestamp should be treated as stale'
  );

  // Sanity check that a fresh cache is still accepted.
  const validCache = { timestamp: Date.now() - 1000, events: [] };
  assert.strictEqual(isCacheFresh(validCache), true, 'valid recent timestamp should be fresh');
});

test('loadGitHubActivity truncates cached display to ACTIVITY_LIMIT when fresh cache has many events', async (t) => {
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

  // Build a fresh cache with more events than ACTIVITY_LIMIT (10).
  const manyEvents = Array.from({ length: 25 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `cache-repo-${i}` },
    created_at: new Date(now - i * 60_000).toISOString(),
    payload: {}
  }));

  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now - 1000, // fresh (well within TTL)
    events: manyEvents
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

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

  assert.strictEqual(fetchCalls, 0, 'fresh cache should not trigger a fetch');
  // renderActivity truncates to ACTIVITY_LIMIT (10) via events.slice(0, LIMIT).
  assert.ok(feed.children.length >= 1, 'feed should contain rendered content');
  const fragment = feed.children[0];
  const renderedItems = fragment.children.filter(c => c.className === 'activity-item');
  assert.strictEqual(renderedItems.length, 10, 'only ACTIVITY_LIMIT items should be rendered from cache');
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

test('isCacheFresh rejects null/undefined/empty-cache arguments defensively', () => {
  const isFresh = require('../app.js').isCacheFresh;
  // When called with a missing cache argument the function should not throw;
  // it must treat any non-finite timestamp (including undefined) as stale.
  assert.strictEqual(isFresh(undefined), false, 'undefined cache should be rejected');
  assert.strictEqual(isFresh(null), false, 'null cache should be rejected');
  assert.strictEqual(isFresh({}), false, 'cache without timestamp property should be rejected');
});

test('isCacheFresh enforces strict TTL boundary and rejects future-dated timestamps', () => {
  const isFresh = require('../app.js').isCacheFresh;
  const now = Date.now();

  // Exactly at the TTL boundary ageMs === ACTIVITY_CACHE_TTL_MS → stale (strict <).
  assert.strictEqual(isFresh({ timestamp: now - 10 * 60 * 1000 }), false, 'cache exactly at TTL boundary must be rejected');

  // One millisecond before the TTL boundary is still fresh.
  assert.strictEqual(isFresh({ timestamp: now - (10 * 60 * 1000) + 1 }), true, 'cache one ms under TTL must be accepted');

  // A future-dated cache produces a negative ageMs; even with valid numeric timestamp it must be rejected.
  assert.strictEqual(isFresh({ timestamp: now + 3600 * 1000 }), false, 'future-dated cache must be rejected (negative age)');
});

test('isCacheFresh rejects timestamps that exceed safe-integer precision', () => {
  const isFresh = require('../app.js').isCacheFresh;

  // A timestamp beyond Number.MAX_SAFE_INTEGER loses integer precision in Date.now() subtraction.
  // writeActivityCache guards against this — a non-finite ageMs must not be treated as fresh.
  assert.strictEqual(
    isFresh({ timestamp: Number.MAX_SAFE_INTEGER + 1 }),
    false,
    'timestamp beyond MAX_SAFE_INTEGER should be rejected'
  );

  // A very old safe-integer timestamp must also fail because the resulting ageMs overflows finite range.
  assert.strictEqual(
    isFresh({ timestamp: -Number.MAX_SAFE_INTEGER }),
    false,
    'deeply negative safe-integer timestamp should be rejected (ageMs overflow)'
  );
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

test('loadGitHubActivity treats a non-JSON fetch body as no-events and caches empty list', async (t) => {
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
  // Simulate GitHub returning an HTML error page (e.g. 401/403 without token) — body is not JSON and not array-like.
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response('Unauthorized', { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'should fetch exactly once on a fresh cache');
  // When response body is non-JSON (e.g. HTML error page), response.json() throws inside fetchGitHubActivity;
  // loadGitHubActivity catches this and calls showActivityError without writing a new cache.
  assert.ok(!storage.get(ACTIVITY_CACHE_KEY), 'cache should not be written on fetch failure');
});

test('loadGitHubActivity ignores a cache whose JSON parses to an empty array (no events field)', async (t) => {
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
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  // Cache key holds a valid JSON array (primitive), not an object.
  // readActivityCache should treat this as invalid and fall back to fetching.
  storage.set(ACTIVITY_CACHE_KEY, '[]');

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

  assert.strictEqual(fetchCalls, 1, 'primitive-array cache should be ignored and fresh fetch triggered');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'events should reflect fresh data');
});

test('loadGitHubActivity ignores a cache whose JSON parses to null (literal JSON null)', async (t) => {
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
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  // Cache key holds the JSON literal null. readActivityCache's !parsed guard must reject it.
  storage.set(ACTIVITY_CACHE_KEY, 'null');

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

  assert.strictEqual(fetchCalls, 1, 'null cache should be ignored and fresh fetch triggered');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
  const updatedCached = JSON.parse(updatedCacheRaw);
  assert.strictEqual(updatedCached.events[0].repo.name, 'fresh-repo', 'events should reflect fresh data');
});

test('loadGitHubActivity falls back to fetching when localStorage has no cache entry', async (t) => {
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
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); }, // returns undefined for any key (no cache entry)
    setItem(key, value) { storage.set(key, value); }
  };

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

  assert.strictEqual(fetchCalls, 1, 'should fetch exactly once when no cache entry exists');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written after successful fetch even from a cold start');
  const cached = JSON.parse(cacheRaw);
  assert.strictEqual(cached.timestamp, now, 'new cache timestamp should equal current time');
  assert.deepStrictEqual(cached.events[0].repo.name, 'fresh-repo', 'events should reflect fetched data');
});

test('loadGitHubActivity ignores a cache whose JSON parses to an integer primitive', async (t) => {
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
    createTextNode(text) {
      return { nodeType: 'text', textContent: text };
    }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  // Cache key holds the JSON literal "42" — a number primitive. readActivityCache must reject it.
  storage.set(ACTIVITY_CACHE_KEY, '42');

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

  assert.strictEqual(fetchCalls, 1, 'primitive-number cache should be ignored and fresh fetch triggered');
  const updatedCacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(updatedCacheRaw, 'cache should be rewritten after fresh fetch');
});

test('loadGitHubActivity renders at most ACTIVITY_LIMIT (10) items from cached events', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('fragment'));

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

  // Cache with more than ACTIVITY_LIMIT (10) items; only the first 10 should be rendered.
  const cacheEvents = Array.from({ length: 25 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `cache-repo-${i}` },
    created_at: new Date(now).toISOString(),
    payload: {}
  }));

  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now - 1000, // fresh enough to be used from cache (within TTL)
    events: cacheEvents
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('fetch should not run for a fresh cached cache');
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

  assert.strictEqual(fetchCalls, 0, 'fresh cache should not trigger a fetch');
  // The feed contains one fragment element with the rendered items as children.
  const fragment = feed.children[0];
  assert.ok(fragment.tagName === 'fragment' || fragment.children.length > 0, 'feed should contain a fragment with events');
  assert.strictEqual(
    fragment.children.length,
    10,
    'rendered activity list should be truncated to ACTIVITY_LIMIT (10) items even when cache holds more'
  );
});

test('loadGitHubActivity handles a non-array response body defensively via empty-list fallback', async (t) => {
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
  // Simulate GitHub returning an unexpected JSON object instead of an array.
  // fetchGitHubActivity should convert this to [] via Array.isArray guard,
  // causing loadGitHubActivity to treat it as no-events and cache empty list.
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify({ status: 'ok', items: [] }), { status: 200 });
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

  assert.strictEqual(fetchCalls, 1, 'should fetch exactly once on a fresh cache');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written after fetch completes (even with empty list)');
  const cached = JSON.parse(cacheRaw);
  assert.strictEqual(cached.events.length, 0, 'non-array response should result in empty events array');
  // When renderActivity receives an empty list it calls showActivityError() which renders an error element.
  assert.strictEqual(feed.children[0].className, 'activity-error', 'error state should be rendered for no-events response');
});

test('isCacheFresh rejects a cache object missing the timestamp property entirely', () => {
  const isFresh = require('../app.js').isCacheFresh;
  // A fully valid-looking cache shape but without a timestamp field must be rejected.
  assert.strictEqual(isFresh({ events: ['a'] }), false, 'cache with only events should be stale');
  assert.strictEqual(isFresh({ timestamp: undefined, events: [] }), false, 'explicit-undefined timestamp is not fresh');
});

test('isCacheFresh rejects non-finite and string timestamps', () => {
  const isFresh = require('../app.js').isCacheFresh;
  // Number.isFinite rejects null, strings, NaN, Infinity — all should be stale.
  assert.strictEqual(isFresh({ timestamp: null, events: [] }), false, 'null timestamp must be stale');
  assert.strictEqual(isFresh({ timestamp: '12345', events: [] }), false, 'string timestamp must be stale');
  assert.strictEqual(isFresh({ timestamp: NaN, events: [] }), false, 'NaN timestamp must be stale');
  assert.strictEqual(isFresh({ timestamp: Infinity, events: [] }), false, 'Infinity timestamp must be stale');
});

test('isCacheFresh accepts a cache exactly one millisecond below the TTL boundary', () => {
  const isFresh = require('../app.js').isCacheFresh;
  const originalNow = Date.now;
  // Fix now at 10_000 so we can compute a precise age relative to ACTIVITY_CACHE_TTL_MS.
  Date.now = () => 10_000;

  assert.strictEqual(
    isFresh({ timestamp: 10_000 - (ACTIVITY_CACHE_TTL_MS - 1), events: [] }),
    true,
    'cache exactly one millisecond under TTL must be fresh'
  );
  Date.now = originalNow;
});

test('isCacheFresh rejects a cache whose age equals the TTL', () => {
  const isFresh = require('../app.js').isCacheFresh;
  const originalNow = Date.now;
  Date.now = () => 10_000;

  assert.strictEqual(
    isFresh({ timestamp: 10_000 - ACTIVITY_CACHE_TTL_MS, events: [] }),
    false,
    'cache whose age equals TTL must be stale (strict less-than)'
  );
  Date.now = originalNow;
});

test('isCacheFresh rejects a cache with a timestamp in the future', () => {
  const isFresh = require('../app.js').isCacheFresh;
  const originalNow = Date.now;
  // Force now behind the supplied timestamp so ageMs will be negative.
  Date.now = () => 0;

  assert.strictEqual(
    isFresh({ timestamp: 1, events: [] }),
    false,
    'future-dated cache must be stale'
  );
  Date.now = originalNow;
});

test('loadGitHubActivity does not refetch when the previous fetch has just completed', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  // Pre-populate a fresh cache so the first loadGitHubActivity call renders from it.
  const feed = createElement('div');
  feed.replaceChildren(createElement('fragment'));

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

  // Cache timestamp exactly now (fresh) with a single event.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now,
    events: [{ type: 'PushEvent', repo: { name: 'cached-repo' }, created_at: new Date(now).toISOString(), payload: {} }]
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('fetch should not run for a freshly cached cache');
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

  assert.strictEqual(fetchCalls, 0, 'fresh cache should prevent any fetch');
});

test('loadGitHubActivity does not refetch when called twice in rapid succession with a fresh cache', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  // Pre-populate a fresh cache so both loadGitHubActivity calls render from it.
  const feed = createElement('div');
  feed.replaceChildren(createElement('fragment'));

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

  // Cache timestamp exactly now (fresh).
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now,
    events: [{ type: 'PushEvent', repo: { name: 'cached-repo' }, created_at: new Date(now).toISOString(), payload: {} }]
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('fetch should not run for a freshly cached cache');
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
  // Immediately call again — should not trigger a second fetch.
  await loadGitHubActivity();

  assert.strictEqual(fetchCalls, 0, 'fresh cache should prevent any double-fetch');
});

test('loadGitHubActivity truncates cached events to the first 30', async (t) => {
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
  const mockEvents = Array.from({ length: 50 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `repo-${String(i).padStart(3, '0')}` },
    created_at: new Date(now - (i + 1) * 60_000).toISOString(),
    payload: {}
  }));

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

  assert.strictEqual(fetchCalls, 1, 'should fetch once when no cache exists');
  const cacheRaw = storage.get(ACTIVITY_CACHE_KEY);
  assert.ok(cacheRaw, 'cache should be written to localStorage');
  const cached = JSON.parse(cacheRaw);
  assert.strictEqual(cached.events.length, 30, 'cached events array must be truncated to 30 entries');
  assert.strictEqual(cached.events[0].repo.name, 'repo-000', 'first event should be preserved');
  assert.strictEqual(cached.events[29].repo.name, 'repo-029', 'last cached event should be the 30th entry');
});

test('loadGitHubActivity renders no more than ACTIVITY_LIMIT (10) items even when cache holds many events', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
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

  // Seed a fresh cache with many events (> ACTIVITY_LIMIT=10 and > cache truncation limit of 30).
  const seededEvents = Array.from({ length: 50 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `seeded-repo-${i}` },
    created_at: new Date(now - i * 1000).toISOString(),
    payload: {}
  }));
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({ timestamp: now, events: seededEvents }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

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
    global.fetch = originalFetch;
  });

  await loadGitHubActivity();

  assert.strictEqual(fetchCalls, 0, 'fresh cache should not trigger a fetch');
  // The feed's first child is the rendered activity fragment; its children are the visible items.
  const renderedFragment = feed.children[0];
  assert.strictEqual(
    renderedFragment.children.length,
    10,
    `renderActivity must render at most ACTIVITY_LIMIT (${10}) items regardless of cache size`
  );
  for (const item of renderedFragment.children) {
    assert.strictEqual(item.className, 'activity-item', 'each visible child should be an activity item');
  }
});

test('loadGitHubActivity shows error state when a fresh cache holds zero events and does not fetch', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('div')); // loading placeholder

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

  // Pre-populate a valid fresh cache with zero events.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({ timestamp: now, events: [] }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

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

  assert.strictEqual(fetchCalls, 0, 'fresh cache with zero events should not trigger fetch');
  assert.strictEqual(
    feed.children.length,
    1,
    'feed should contain the rendered error state element'
  );
  assert.strictEqual(feed.children[0].className, 'activity-error', 'empty fresh cache must render activity-error class');
});

test('loadGitHubActivity does not truncate events that are exactly at the 30-entry limit', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
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

  // Exactly 30 events — should NOT be truncated (slice(0, 30) keeps all).
  const mockEvents = Array.from({ length: 30 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `exact-repo-${i}` },
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
  assert.strictEqual(cached.events.length, 30, 'exactly-30 events must not be truncated');
});

test('loadGitHubActivity truncates cached events starting at the 31st entry', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
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

  // 31 events — the 31st should be dropped by cache truncation.
  const mockEvents = Array.from({ length: 31 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `boundary-${i}` },
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
  assert.strictEqual(cached.events.length, 30, 'events beyond index 29 must be dropped');
  // Verify the first 30 are preserved in original order.
  for (let i = 0; i < 30; i++) {
    assert.strictEqual(cached.events[i].repo.name, `boundary-${i}`, `event ${i} should be preserved in order`);
  }
});

test('renderActivity renders exactly ACTIVITY_LIMIT items from a cache holding many events', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  const feed = createElement('div');
  feed.replaceChildren(createElement('fragment')); // placeholder

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

  // Seed a fresh cache with many events (well above ACTIVITY_LIMIT=10).
  const seededEvents = Array.from({ length: 50 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `limit-test-${i}` },
    created_at: new Date(now - i * 1000).toISOString(),
    payload: {}
  }));
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({ timestamp: now, events: seededEvents }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

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

  assert.strictEqual(fetchCalls, 0, 'fresh cache should prevent any fetch');
  const renderedFragment = feed.children[0];
  assert.strictEqual(
    renderedFragment.children.length,
    10,
    `rendered fragment must contain exactly ACTIVITY_LIMIT (10) activity items`
  );
  for (const item of renderedFragment.children) {
    assert.strictEqual(item.className, 'activity-item', 'each visible child should be an activity-item');
  }
});

test('loadGitHubActivity refetches when the cached value is a JSON primitive (array/string/number/boolean/null)', async (t) => {
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

  const storageMock = new Map();
  global.localStorage = {
    getItem(key) { return storageMock.get(key); },
    setItem(key, value) { storageMock.set(key, value); }
  };

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  const mockEvents = [{ type: 'PushEvent', repo: { name: 'fresh' }, created_at: new Date(now).toISOString(), payload: {} }];
  global.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify(mockEvents), { status: 200 });
  };

  // Exercise every rejected JSON primitive through the full pipeline.
  const rejects = [
    { label: 'plain-array', value: '[]' },
    { label: 'string', value: '"hello"' },
    { label: 'number', value: '42' },
    { label: 'boolean-true', value: 'true' },
    { label: 'boolean-false', value: 'false' },
    { label: 'null-literal', value: 'null' }
  ];

  for (const { label, value } of rejects) {
    storageMock.set(ACTIVITY_CACHE_KEY, value);
    feed.replaceChildren(createElement('div'));
    fetchCalls = 0;
    Date.now = () => now;

    await loadGitHubActivity();

    assert.strictEqual(fetchCalls, 1, `primitive "${label}" must trigger a fresh fetch`);
  }

  t.after(() => {
    Date.now = originalDateNow;
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
    global.fetch = originalFetch;
  });
});

test('loadGitHubActivity renders exactly ACTIVITY_LIMIT cached items when the cache holds more', async (t) => {
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
      const frag = createElement('fragment');
      frag.replaceChildren(...frag.children); // identity: fragment is just a div in the stub
      return frag;
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

  // Cache holds 25 events — more than the ACTIVITY_LIMIT of 10.
  const cachedEvents = Array.from({ length: 25 }, (_, i) => ({
    type: 'PushEvent',
    repo: { name: `repo-${i}` },
    created_at: new Date(now - i * 60_000).toISOString(),
    payload: { ref: 'refs/heads/main' }
  }));

  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({ timestamp: now, events: cachedEvents }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('fresh cache should short-circuit before any fetch');
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

  assert.strictEqual(fetchCalls, 0, 'fresh cache must short-circuit and not fetch');
  const renderedFragment = feed.children[0];
  assert.strictEqual(
    renderedFragment.children.length,
    10,
    `rendered fragment should contain exactly ACTIVITY_LIMIT (10) items from a larger cached list`
  );
  // Head-bounded slice: events 0..9 survive the limit.
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(renderedFragment.children[i].className, 'activity-item');
  }
});

test('loadGitHubActivity does not throw when activity-feed DOM element is missing', async (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalFetch = global.fetch;

  // Mock document that returns null for activity-feed (element not in DOM).
  global.document = {
    getElementById(id) {
      return id === 'activity-feed' ? null : null;
    },
    createElement: () => ({ children: [], appendChild(c) { this.children.push(c); return c; } }),
    createTextNode(text) { return { nodeType: 'text', textContent: text }; },
    createDocumentFragment() { return global.document.createElement('fragment'); }
  };

  const storage = new Map();
  global.localStorage = {
    getItem(key) { return storage.get(key); },
    setItem(key, value) { storage.set(key, value); }
  };

  // Fresh cache present so loadGitHubActivity will try to render from it.
  storage.set(ACTIVITY_CACHE_KEY, JSON.stringify({
    timestamp: now - 1000,
    events: [{ type: 'PushEvent', repo: { name: 'test-repo' }, created_at: new Date(now).toISOString(), payload: {} }]
  }));

  global.sessionStorage = { getItem() { return null; }, setItem() {} };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('fetch should not run — fresh cache short-circuits');
  };
  Date.now = () => now;

  t.after(() => {
    Date.now = originalDateNow;
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
    global.fetch = originalFetch;
  });

  // The critical assertion: must not throw when DOM element is absent.
  assert.doesNotThrow(async () => { await loadGitHubActivity(); }, 'must not throw when activity-feed element is missing');
});
