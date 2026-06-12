const test = require('node:test');
const assert = require('node:assert');
const {
  getDefaultLang,
  getRelativeTime,
  getBadgeActionsUrl,
  isCacheFresh,
  loadGitHubActivity,
  normalizeLang,
  parseRepoName,
  buildRepoUrl,
  t,
  translations,
  setLang,
  THANK_YOU_LANGUAGES,
  projectSections,
  getEventIcon
} = require('../app.js');

test('parseRepoName', () => {
  assert.deepStrictEqual(parseRepoName('user/repo'), { owner: 'user', repo: 'repo' });
  assert.deepStrictEqual(parseRepoName('user/repo-name'), { owner: 'user', repo: 'repo-name' });
  assert.deepStrictEqual(parseRepoName('user/repo_name'), { owner: 'user', repo: 'repo_name' });
  assert.deepStrictEqual(parseRepoName('user/repo.name'), { owner: 'user', repo: 'repo.name' });
  assert.strictEqual(parseRepoName('single-word'), null);
  assert.strictEqual(parseRepoName('/repo'), null);
  assert.strictEqual(parseRepoName('user/'), null);
  assert.strictEqual(parseRepoName('user/repo/extra'), null);
});

test('buildRepoUrl', () => {
  assert.strictEqual(buildRepoUrl('user/repo'), 'https://github.com/user/repo');
  assert.strictEqual(buildRepoUrl('invalid'), 'https://github.com/fabian20ro');
});

test('t() edge cases', () => {
  setLang('en');
  assert.strictEqual(t('nonexistent'), 'nonexistent');
  assert.strictEqual(t('title'), "Fabian's Projects");

  setLang('ro');
  assert.strictEqual(t('title'), 'Proiectele lui Fabian');

  setLang('fr');
  assert.strictEqual(t('title'), 'Les projets de Fabian');

  test('getRelativeTime Romanian', () => {
    setLang('ro');
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 61 * 1000).toISOString();
    const result = getRelativeTime(oneMinuteAgo);
    assert.ok(result.includes('acum 1 minut') || result.includes('1 minut'), `Expected "acum 1 minut", got "${result}"`);
  });
});

test('normalizeLang edge cases', () => {
  assert.strictEqual(normalizeLang('RO'), 'ro');
  assert.strictEqual(normalizeLang('ro-RO'), 'ro');
  assert.strictEqual(normalizeLang('ro_RO'), 'ro');
  assert.strictEqual(normalizeLang('EN'), 'en');
  assert.strictEqual(normalizeLang('en-US'), 'en');
  assert.strictEqual(normalizeLang('fr-FR'), 'fr');
  assert.strictEqual(normalizeLang('fr_FR'), 'fr');
  assert.strictEqual(normalizeLang('es-ES'), 'es');
  assert.strictEqual(normalizeLang('es_ES'), 'es');
  assert.strictEqual(normalizeLang('de-DE'), 'de');
  assert.strictEqual(normalizeLang('it-IT'), 'it');
  assert.strictEqual(normalizeLang('pt-PT'), 'pt');
  assert.strictEqual(normalizeLang('anything'), 'en');
  assert.strictEqual(normalizeLang(undefined), 'en');
  assert.strictEqual(normalizeLang(''), 'en');
});

test('isCacheFresh edge cases', () => {
  const now = Date.now();
  assert.strictEqual(isCacheFresh({ timestamp: now }), true);
  assert.strictEqual(isCacheFresh({ timestamp: now - 1000 }), true);
  assert.strictEqual(isCacheFresh({ timestamp: now - 1000 * 60 * 60 * 24 }), false);
  assert.strictEqual(isCacheFresh({ timestamp: 0 }), false);
  assert.strictEqual(isCacheFresh({ timestamp: NaN }), false);
  assert.strictEqual(isCacheFresh(null), false);
  assert.strictEqual(isCacheFresh({}), false);
});

test('getBadgeActionsUrl edge cases', () => {
  assert.strictEqual(
    getBadgeActionsUrl('https://github.com/user/repo/actions/workflows/deploy/badge.svg'),
    'https://github.com/user/repo/actions'
  );
  assert.strictEqual(
    getBadgeActionsUrl('https://github.com/user/repo/actions/workflows/deploy/badge.png'),
    'https://github.com/user/repo/actions'
  );
  assert.strictEqual(
    getBadgeActionsUrl('https://example.com/foo/bar.svg'),
    'https://example.com/foo/bar.svg'
  );
});

test('getEventIcon', () => {
  assert.strictEqual(getEventIcon('PushEvent'), '📤');
  assert.strictEqual(getEventIcon('CreateEvent'), '✨');
  assert.strictEqual(getEventIcon('UnknownEvent'), '📌');
});

test('translations', () => {
  setLang('ro');
  assert.strictEqual(
    t('intro'),
    'Salut, sunt Fabian. Aici vei găsi o colecție de proiecte open source.'
  );
  assert.strictEqual(t('title'), 'Proiectele lui Fabian');

  setLang('fr');
  assert.strictEqual(
    t('intro'),
    'Salut, je suis Fabian. Voici une collection de mes projets open source.'
  );
  assert.strictEqual(t('title'), 'Les projets de Fabian');
});
