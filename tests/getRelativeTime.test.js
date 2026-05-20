const test = require('node:test');
const assert = require('node:assert');
const {
  buildRepoUrl,
  getBadgeActionsUrl,
  getDefaultLang,
  isCacheFresh,
  getRelativeTime,
  normalizeLang,
  parseRepoName,
  setLang
} = require('../app.js');

test('getRelativeTime - English', (t) => {
  const now = Date.now();
  // Mock Date.now()
  const originalDateNow = Date.now;
  Date.now = () => now;

  setLang('en');

  t.after(() => {
    Date.now = originalDateNow;
  });

  const testCases = [
    {
      date: new Date(now - 30 * 1000).toISOString(),
      expected: 'just now',
      name: 'less than a minute'
    },
    { date: new Date(now - 59 * 1000).toISOString(), expected: 'just now', name: '59 seconds ago' },
    {
      date: new Date(now - 60 * 1000).toISOString(),
      expected: '1 minute ago',
      name: '1 minute ago'
    },
    {
      date: new Date(now - 59 * 60 * 1000 - 59 * 1000).toISOString(),
      expected: '59 minutes ago',
      name: '59 minutes 59 seconds ago'
    },
    {
      date: new Date(now - 5 * 60 * 1000).toISOString(),
      expected: '5 minutes ago',
      name: '5 minutes ago'
    },
    {
      date: new Date(now - 60 * 60 * 1000).toISOString(),
      expected: '1 hour ago',
      name: '1 hour ago'
    },
    {
      date: new Date(now - 23 * 60 * 60 * 1000 - 59 * 60 * 1000).toISOString(),
      expected: '23 hours ago',
      name: '23 hours 59 minutes ago'
    },
    {
      date: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      expected: '3 hours ago',
      name: '3 hours ago'
    },
    {
      date: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      expected: '1 day ago',
      name: '1 day ago'
    },
    {
      date: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
      expected: '2 days ago',
      name: '2 days ago'
    },
    {
      date: new Date(now + 5 * 60 * 1000).toISOString(),
      expected: 'just now',
      name: 'future date'
    },
    { date: 'invalid-date', expected: 'just now', name: 'invalid date' }
  ];

  testCases.forEach(({ date, expected, name }) => {
    assert.strictEqual(getRelativeTime(date), expected, `Failed: ${name}`);
  });
});

test('getRelativeTime - Romanian', (t) => {
  const now = Date.now();
  const originalDateNow = Date.now;
  Date.now = () => now;

  setLang('ro');

  t.after(() => {
    Date.now = originalDateNow;
  });

  const testCases = [
    {
      date: new Date(now - 30 * 1000).toISOString(),
      expected: 'chiar acum',
      name: 'less than a minute (ro)'
    },
    {
      date: new Date(now - 59 * 1000).toISOString(),
      expected: 'chiar acum',
      name: '59 seconds ago (ro)'
    },
    {
      date: new Date(now - 60 * 1000).toISOString(),
      expected: 'acum 1 minut',
      name: '1 minute ago (ro)'
    },
    {
      date: new Date(now - 59 * 60 * 1000 - 59 * 1000).toISOString(),
      expected: '59 minute în urmă',
      name: '59 minutes 59 seconds ago (ro)'
    },
    {
      date: new Date(now - 5 * 60 * 1000).toISOString(),
      expected: '5 minute în urmă',
      name: '5 minutes ago (ro)'
    },
    {
      date: new Date(now - 60 * 60 * 1000).toISOString(),
      expected: 'acum 1 oră',
      name: '1 hour ago (ro)'
    },
    {
      date: new Date(now - 23 * 60 * 60 * 1000 - 59 * 60 * 1000).toISOString(),
      expected: '23 ore în urmă',
      name: '23 hours 59 minutes ago (ro)'
    },
    {
      date: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      expected: '3 ore în urmă',
      name: '3 hours ago (ro)'
    },
    {
      date: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      expected: 'acum 1 zi',
      name: '1 day ago (ro)'
    },
    {
      date: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
      expected: '2 zile în urmă',
      name: '2 days ago (ro)'
    },
    {
      date: new Date(now + 5 * 60 * 1000).toISOString(),
      expected: 'chiar acum',
      name: 'future date (ro)'
    },
    { date: 'invalid-date', expected: 'chiar acum', name: 'invalid date (ro)' }
  ];

  testCases.forEach(({ date, expected, name }) => {
    assert.strictEqual(getRelativeTime(date), expected, `Failed: ${name}`);
  });
});

test('getDefaultLang', () => {
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');

  try {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      writable: true,
      value: { language: ' ro-RO ' }
    });
    assert.strictEqual(getDefaultLang(), 'ro');

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      writable: true,
      value: { language: 'en-US' }
    });
    assert.strictEqual(getDefaultLang(), 'en');

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      writable: true,
      value: {}
    });
    assert.strictEqual(getDefaultLang(), 'en');
  } finally {
    if (originalNavigatorDescriptor) {
      Object.defineProperty(global, 'navigator', originalNavigatorDescriptor);
    } else {
      delete global.navigator;
    }
  }
});

test('normalizeLang', () => {
  assert.strictEqual(normalizeLang('ro'), 'ro');
  assert.strictEqual(normalizeLang('RO'), 'ro');
  assert.strictEqual(normalizeLang('ro-RO'), 'ro');
  assert.strictEqual(normalizeLang(' ro-RO '), 'ro');
  assert.strictEqual(normalizeLang('ro_RO'), 'ro');
  assert.strictEqual(normalizeLang(' ro_RO '), 'ro');
  assert.strictEqual(normalizeLang('en'), 'en');
  assert.strictEqual(normalizeLang('road'), 'en');
  assert.strictEqual(normalizeLang(' road '), 'en');
  assert.strictEqual(normalizeLang(null), 'en');
});

test('setLang localizes page chrome and card affordances', () => {
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;

  const statusNode = {
    textContent: '',
    getAttribute(name) {
      return name === 'data-i18n' ? 'deployStatus' : null;
    }
  };

  const cardLinkNode = {
    attributes: {},
    getAttribute(name) {
      return name === 'data-link-key' ? 'visitSite' : null;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  const langToggle = {
    textContent: '',
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  const themeToggle = {
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  global.document = {
    documentElement: { lang: 'en' },
    querySelectorAll(selector) {
      if (selector === '[data-i18n]') {
        return [statusNode];
      }

      if (selector === '.card-link[data-link-key]') {
        return [cardLinkNode];
      }

      return [];
    },
    getElementById(id) {
      if (id === 'lang-toggle') {
        return langToggle;
      }

      if (id === 'theme-toggle') {
        return themeToggle;
      }

      return null;
    }
  };

  global.localStorage = {
    setItem() {},
    getItem() {
      return null;
    }
  };

  global.sessionStorage = {
    setItem() {},
    getItem() {
      return null;
    }
  };

  try {
    setLang('ro');

    assert.strictEqual(global.document.documentElement.lang, 'ro');
    assert.strictEqual(statusNode.textContent, 'Ultimul status: ');
    assert.strictEqual(cardLinkNode.attributes['aria-label'], 'Vizitează →');
    assert.strictEqual(cardLinkNode.attributes.title, 'Vizitează →');
    assert.strictEqual(langToggle.textContent, 'RO');
    assert.strictEqual(langToggle.attributes['aria-label'], 'Schimbă limba');
    assert.strictEqual(themeToggle.attributes['aria-label'], 'Schimbă tema');
  } finally {
    global.document = originalDocument;
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
  }
});

test('parseRepoName and buildRepoUrl', () => {
  assert.deepStrictEqual(parseRepoName('fabian20ro/my.repo_1-2'), {
    owner: 'fabian20ro',
    repo: 'my.repo_1-2'
  });

  assert.strictEqual(
    buildRepoUrl('fabian20ro/my.repo_1-2'),
    'https://github.com/fabian20ro/my.repo_1-2'
  );
  assert.strictEqual(buildRepoUrl('invalid repo name'), 'https://github.com/fabian20ro');
  assert.strictEqual(parseRepoName('invalid repo name'), null);
  assert.strictEqual(parseRepoName('fabian20ro/'), null);
  assert.strictEqual(parseRepoName('/repo'), null);
});

test('getBadgeActionsUrl', () => {
  assert.strictEqual(
    getBadgeActionsUrl(
      'https://github.com/fabian20ro/harness-manager/workflows/Deploy%20Pages/badge.svg'
    ),
    'https://github.com/fabian20ro/harness-manager/actions'
  );

  assert.strictEqual(
    getBadgeActionsUrl('https://example.com/badge.svg'),
    'https://example.com/badge.svg'
  );
  assert.strictEqual(getBadgeActionsUrl(null), '');
  assert.strictEqual(getBadgeActionsUrl(undefined), '');
});

test('isCacheFresh', () => {
  const now = Date.now();
  const originalDateNow = Date.now;
  Date.now = () => now;

  try {
    assert.strictEqual(isCacheFresh({ timestamp: now - 9 * 60 * 1000 }), true);
    assert.strictEqual(isCacheFresh({ timestamp: now }), true);
    assert.strictEqual(isCacheFresh({ timestamp: now - 10 * 60 * 1000 }), false);
    assert.strictEqual(isCacheFresh({ timestamp: now - 11 * 60 * 1000 }), false);
    assert.strictEqual(isCacheFresh({ timestamp: now + 60 * 1000 }), false);
    assert.strictEqual(isCacheFresh({ timestamp: Number.NaN }), false);
    assert.strictEqual(isCacheFresh({ timestamp: Infinity }), false);
    assert.strictEqual(isCacheFresh(null), false);
    assert.strictEqual(isCacheFresh(undefined), false);
    assert.strictEqual(isCacheFresh({}), false);
  } finally {
    Date.now = originalDateNow;
  }
});
