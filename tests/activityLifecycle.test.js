const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function fixture({ cache, fail = false } = {}) {
  let now = 1_800_000_000_000;
  let calls = 0;
  const events = [
    { type: 'PushEvent', repo: { name: 'owner/fresh' }, created_at: new Date(now).toISOString() }
  ];
  function element(tagName) {
    return {
      tagName,
      children: [],
      textContent: '',
      setAttribute(k, v) {
        this[k] = v;
      },
      getAttribute(k) {
        return this[k];
      },
      appendChild(n) {
        this.children.push(n);
      },
      append(...ns) {
        this.children.push(...ns);
      },
      replaceChildren(...ns) {
        this.children = ns;
      }
    };
  }
  const feed = element('div');
  const listeners = {};
  const intervals = [];
  const timeouts = new Map();
  const storage = new Map(cache ? [['github-activity-cache-v1', JSON.stringify(cache)]] : []);
  const document = {
    visibilityState: 'visible',
    documentElement: {},
    getElementById: (id) => (id === 'activity-feed' ? feed : null),
    querySelectorAll: (selector) => {
      const all = (n) => [n, ...(n.children || []).flatMap(all)];
      return all(feed).filter((n) =>
        selector.startsWith('[')
          ? Object.hasOwn(n, selector.slice(1, -1))
          : n.className === selector.slice(1)
      );
    },
    createElement: element,
    createDocumentFragment: () => element('fragment'),
    createTextNode: (textContent) => ({ textContent }),
    addEventListener: (k, v) => {
      listeners[k] = v;
    }
  };
  const context = vm.createContext({
    document,
    console,
    AbortController,
    Date: class extends Date {
      static now() {
        return now;
      }
    },
    localStorage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    setTimeout: (fn, ms) => {
      const id = {};
      timeouts.set(id, { fn, ms });
      return id;
    },
    clearTimeout: (id) => timeouts.delete(id),
    fetch: async () => {
      calls++;
      if (fail) throw new Error('offline');
      return { ok: true, json: async () => events };
    }
  });
  // No module or window: exercise classic-script exports without starting unrelated UI.
  vm.runInContext(fs.readFileSync(require.resolve('../app.js'), 'utf8'), context);
  context.window = {
    addEventListener: (k, v) => {
      listeners[k] = v;
    },
    setInterval: (fn) => intervals.push(fn)
  };
  vm.runInContext('setupActivityRefresh()', context);
  const run = (code) => vm.runInContext(code, context);
  const nodes = (n) => [n, ...(n.children || []).flatMap(nodes)];
  return {
    context,
    document,
    listeners,
    intervals,
    timeouts,
    events,
    run,
    storage,
    advance: (ms) => {
      now += ms;
    },
    calls: () => calls,
    fail: (v) => {
      fail = v;
    },
    all: () => nodes(feed),
    text: () =>
      nodes(feed)
        .map((n) => n.textContent)
        .join(' ')
  };
}

test('freshness and locale survive repeated resumes; visible repaint is not a fetch', async () => {
  const f = fixture();
  await f.run('loadGitHubActivity()');
  assert.match(f.text(), /Last updated: just now/);
  assert.equal(
    f.document.querySelectorAll('[data-activity-updated]')[0].getAttribute('role'),
    'status',
    'live region role on initial render'
  );
  assert.equal(
    f.document.querySelectorAll('[data-activity-updated]')[0].getAttribute('aria-live'),
    'polite',
    'live region politeness on initial render'
  );
  f.run("setLang('ro')");
  assert.match(f.text(), /Ultima actualizare:/);
  f.advance(599_999);
  await f.listeners.visibilitychange();
  assert.equal(f.calls(), 1);
  f.advance(1);
  await f.listeners.visibilitychange();
  assert.equal(f.calls(), 2);
  f.advance(600_000);
  await f.listeners.pageshow();
  assert.equal(f.calls(), 3, 'second resume works within same tab');
  f.advance(60_000);
  const stableItem = f.all().find((n) => n.className === 'activity-item');
  await f.intervals[0]();
  assert.equal(f.calls(), 3);
  assert.ok(f.all().includes(stableItem), 'repaint preserves focused item identity');
  const updated = f.document.querySelectorAll('[data-activity-updated]')[0];
  assert.equal(
    updated.textContent,
    'Ultima actualizare: acum 1 minut',
    'minute tick repaints the updated line with the exact localized bucket'
  );
  assert.equal(
    updated.getAttribute('role'),
    'status',
    'live region role survives the repaint that reuses the element'
  );
  assert.equal(
    updated.getAttribute('aria-live'),
    'polite',
    'live region politeness survives the repaint that reuses the element'
  );
  f.document.visibilityState = 'hidden';
  f.advance(600_000);
  await f.intervals[0]();
  assert.equal(f.calls(), 3, 'hidden tab does not poll');
});

test('concurrent resume and interval share request; failed stale refresh preserves last success', async () => {
  const f = fixture();
  await f.run('loadGitHubActivity()');
  f.advance(600_000);
  let finish;
  let requests = 0;
  f.context.fetch = () => {
    requests++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const a = f.listeners.pageshow();
  const b = f.listeners.visibilitychange();
  const c = f.intervals[0]();
  assert.equal(requests, 1);
  finish({ ok: false, status: 429, headers: { get: () => '120' } });
  await Promise.all([a, b, c]);
  assert.match(f.text(), /owner\/fresh/);
  assert.match(f.text(), /Last updated: 10 minutes ago/);
  assert.match(f.text(), /could not refresh/i);
  assert.equal(
    f.document.querySelectorAll('[data-activity-updated]')[0].textContent,
    'Last updated: 10 minutes ago',
    'failed stale refresh does not repaint the updated line'
  );
  f.run("setLang('ro')");
  assert.doesNotMatch(f.text(), /could not|Try again|View activity/);
  f.advance(60_000);
  await f.intervals[0]();
  assert.equal(
    f.document.querySelectorAll('[data-activity-updated]')[0].textContent,
    'Ultima actualizare: 11 minute în urmă',
    'minute tick repaints the preserved updated line with the exact localized bucket'
  );
  const retry = f.all().find((n) => n.className === 'activity-retry');
  assert.equal(retry.disabled, true, 'respect server retry window');
});

test('manual retry inside the server retry window never starts a request, even forced', async () => {
  const f = fixture();
  await f.run('loadGitHubActivity()');
  f.advance(600_000);
  let requests = 0;
  f.context.fetch = async () => {
    requests++;
    return { ok: false, status: 429, headers: { get: () => '120' } };
  };
  await f.listeners.visibilitychange();
  assert.equal(requests, 1, 'stale refresh after TTL hits the network');
  const retry = f.all().find((n) => n.className === 'activity-retry');
  assert.equal(retry.disabled, true, 'server retry window disables the control');
  await retry.onclick();
  await retry.onclick();
  assert.equal(requests, 1, 'disabled retry handler never starts a request');
  await f.run('loadGitHubActivity({ force: true })');
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(requests, 1, 'force bypasses backoff, not the server retry window');
  assert.match(f.text(), /could not refresh/i);
});

test('request timeout aborts, preserves recovery control; failed empty state fully changes language', async () => {
  const f = fixture();
  let signal;
  f.context.fetch = (_url, options) =>
    new Promise((_resolve, reject) => {
      signal = options.signal;
      signal.addEventListener('abort', () => reject(new Error('aborted')));
    });
  const pending = f.run('loadGitHubActivity()');
  const abortTimer = [...f.timeouts.values()].find((t) => t.ms === 15_000);
  assert.ok(abortTimer, 'request schedules a 15-second abort timeout');
  abortTimer.fn();
  await pending;
  assert.equal(signal.aborted, true);
  f.run("setLang('ro')");
  assert.match(f.text(), /Nu s-a putut/);
  assert.doesNotMatch(f.text(), /Could not|View activity|Try again/);
});

test('successful empty result is not reported as an API error; malformed payload is', async () => {
  const f = fixture();
  f.events.length = 0;
  await f.run('loadGitHubActivity()');
  assert.match(f.text(), /No recent public activity/);
  assert.doesNotMatch(f.text(), /Could not load/);
  f.advance(600_000);
  f.context.fetch = async () => ({ ok: true, json: async () => ({ bad: true }) });
  await f.run('loadGitHubActivity()');
  assert.match(f.text(), /could not refresh/i);
});

test('real project badge metadata navigates to Actions, not repository root', () => {
  const f = fixture();
  const urls = f.run(
    'Object.values(projectSections).flat().filter(p => p.badgeUrl).map(p => getBadgeActionsUrl(p.badgeUrl))'
  );
  assert.ok(urls.length > 2);
  for (const url of urls) assert.match(url, /\/actions$/);
  // Exact transformation: GitHub repo URL → same URL + '/actions'
  assert.equal(
    f.run("getBadgeActionsUrl('https://github.com/user/repo')"),
    'https://github.com/user/repo/actions',
    'GitHub repo URL gets /actions appended'
  );
  // Non-GitHub URL passes through unchanged
  assert.equal(
    f.run("getBadgeActionsUrl('https://gitlab.com/user/repo')"),
    'https://gitlab.com/user/repo',
    'non-GitHub URL is returned unchanged'
  );
  // Non-string input returns empty string
  assert.equal(f.run('getBadgeActionsUrl(null)'), '', 'non-string input returns empty string');
  assert.doesNotMatch(f.run("t('viewAllGithub')"), /&rarr;/);
});

test('automatic failure backoff does not spam resumes; manual retry recovers in-place', async () => {
  const f = fixture({ fail: true });
  await f.listeners.pageshow();
  await f.intervals[0]();
  assert.equal(f.calls(), 0, 'lifecycle does not defeat initial lazy load');
  await f.run('loadGitHubActivity()');
  await f.listeners.pageshow();
  await f.listeners.visibilitychange();
  assert.equal(f.calls(), 1);
  f.fail(false);
  const retry = f.all().find((n) => n.className === 'activity-retry');
  await retry.onclick();
  assert.equal(f.calls(), 2);
  assert.match(f.text(), /Last updated: just now/);
  assert.doesNotMatch(f.text(), /Could not load/);
});

test('corrupted restored timestamp or null event never breaks rendering or replaces valid API data', async () => {
  for (const cache of [
    { timestamp: -1e100, events: [] },
    { timestamp: 1_800_000_000_000, events: [null] },
    { timestamp: 1_800_000_060_000, events: [] }
  ]) {
    const f = fixture({ cache });
    await f.run('loadGitHubActivity()');
    assert.equal(f.calls(), 1);
    assert.match(f.text(), /owner\/fresh/);
    assert.match(f.text(), /Last updated: just now/);
  }
  const nonArrayEvents = fixture({ cache: { timestamp: 1_800_000_000_000, events: 'owner/fresh' } });
  await nonArrayEvents.run('loadGitHubActivity()');
  assert.equal(nonArrayEvents.calls(), 1, 'non-array events are rejected, not restored');
  assert.match(nonArrayEvents.text(), /owner\/fresh/);
  assert.match(nonArrayEvents.text(), /Last updated: just now/);
  const scalarEvent = fixture({
    cache: { timestamp: 1_800_000_000_000, events: ['owner/fresh'] }
  });
  await scalarEvent.run('loadGitHubActivity()');
  assert.equal(scalarEvent.calls(), 1, 'non-object event entries are rejected, not restored');
  assert.match(scalarEvent.text(), /owner\/fresh/);
  assert.match(scalarEvent.text(), /Last updated: just now/);
  const truncated = fixture();
  truncated.storage.set(
    'github-activity-cache-v1',
    '{"timestamp":1800000000000,"events":[{"repo":'
  );
  await truncated.run('loadGitHubActivity()');
  assert.equal(truncated.calls(), 1, 'truncated cache JSON is rejected, not restored');
  assert.match(truncated.text(), /owner\/fresh/);
  assert.match(truncated.text(), /Last updated: just now/);
});

function datedEvents() {
  // Newest event deliberately beyond the ten-item display limit.
  return Array.from({ length: 12 }, (_, i) => ({
    id: String(i),
    type: 'PushEvent',
    repo: { name: `owner/event-${i}` },
    created_at: new Date(1_800_000_000_000 - (12 - i) * 60_000).toISOString()
  }));
}

function renderedDates(f) {
  return f
    .all()
    .filter((n) => Object.hasOwn(n, 'data-activity-time'))
    .map((n) => n['data-activity-time']);
}

test('live activity sorts newest first before limiting; locale repaint and cache retain order', async () => {
  const f = fixture();
  f.events.splice(0, f.events.length, ...datedEvents());
  const original = JSON.stringify(f.events);
  const expected = f.events
    .slice()
    .reverse()
    .slice(0, 10)
    .map((e) => e.created_at);
  await f.run('loadGitHubActivity()');
  assert.deepEqual(renderedDates(f), expected);
  assert.equal(JSON.stringify(f.events), original, 'API array must not be mutated');
  f.run("setLang('ro')");
  assert.deepEqual(renderedDates(f), expected);
  const saved = JSON.parse(f.storage.get('github-activity-cache-v1'));
  assert.deepEqual(
    saved.events.map((e) => e.id),
    f.events
      .slice()
      .reverse()
      .map((e) => e.id)
  );
});

test('existing unsorted fresh cache renders newest first without network or rewriting storage', async () => {
  const cache = { timestamp: 1_800_000_000_000, events: datedEvents() };
  const f = fixture({ cache });
  await f.run('loadGitHubActivity()');
  assert.equal(f.calls(), 0);
  assert.deepEqual(
    renderedDates(f),
    cache.events
      .slice()
      .reverse()
      .slice(0, 10)
      .map((e) => e.created_at)
  );
  assert.equal(f.storage.get('github-activity-cache-v1'), JSON.stringify(cache));
});

test('undated activity sorts last and tied timestamps preserve source order', async () => {
  const f = fixture();
  const events = datedEvents().slice(0, 4);
  events[0].created_at = 'invalid';
  events[1].created_at = events[3].created_at;
  delete events[2].created_at;
  f.events.splice(0, f.events.length, ...events);
  await f.run('loadGitHubActivity()');
  const descendants = node => [node, ...(node.children || []).flatMap(descendants)];
  const links = f.all()
    .filter(n => n.className === 'activity-item')
    .flatMap(descendants)
    .filter((n) => n.tagName === 'a')
    .map((n) => n.href);
  assert.deepEqual(
    links,
    [1, 3, 0, 2].map((i) => `https://github.com/owner/event-${i}/tree/main`)
  );
});

test('successful activity includes a localized GitHub link after updated time without disturbing event order', async () => {
  const f = fixture();
  await f.run('loadGitHubActivity()');
  const url = 'https://github.com/fabian20ro?tab=activity';
  for (const lang of ['en', 'ro']) {
    f.run(`currentLang = '${lang}'; renderActivity()`);
    const all = f.all();
    const links = all.filter(n => n.tagName === 'a' && n.href === url);
    assert.equal(links.length, 1);
    assert.equal(links[0].target, '_blank');
    assert.equal(links[0].rel, 'noopener noreferrer');
    assert.equal(links[0].textContent, f.run("t('activityViewGithub')"));
    assert.ok(all.indexOf(links[0]) > all.findIndex(n => n.className === 'activity-updated'));
  }
  f.events.splice(0);
  await f.run('loadGitHubActivity({force: true})');
  const all = f.all();
  const notice = all.find(n => n.className === 'activity-error');
  assert.ok(notice);
  assert.equal(all.filter(n => n.tagName === 'a' && n.href === url).length, 1);
  assert.ok(notice.children.some(n => n.href === url));
});
