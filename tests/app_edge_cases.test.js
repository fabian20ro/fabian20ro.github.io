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
  assert.strictEqual(t('app_status'), 'Statusul aplicației');

  setLang('fr');
  assert.strictEqual(t('title'), 'Les projets de Fabian');
});

test('normalizeLang edge cases', () => {
  assert.strictEqual(normalizeLang('RO'), 'ro');
  assert.strictEqual(normalizeLang('ro-RO'), 'ro');
  assert.strictEqual(normalizeLang('ro_RO'), 'ro');
  assert.strictEqual(normalizeLang('  ro-RO  '), 'ro');
  assert.strictEqual(normalizeLang('EN-US'), 'en');
  assert.strictEqual(normalizeLang('en-US '), 'en');
  assert.strictEqual(normalizeLang('fr-FR'), 'fr');
  assert.strictEqual(normalizeLang('fr_FR'), 'fr');
  assert.strictEqual(normalizeLang('es-ES'), 'es');
  assert.strictEqual(normalizeLang('es_ES'), 'es');
  assert.strictEqual(normalizeLang('de-DE'), 'de');
  assert.strictEqual(normalizeLang('it-IT'), 'it');
  assert.strictEqual(normalizeLang('pt-PT'), 'pt');
  assert.strictEqual(normalizeLang('anything'), 'en');
  assert.strictEqual(normalizeLang(undefined), 'en');
  assert.strictEqual(normalizeLang(null), 'en');
  assert.strictEqual(normalizeLang(''), 'en');
  assert.strictEqual(normalizeLang(123), 'en');
  assert.strictEqual(normalizeLang('  '), 'en');
});

test('isCacheFresh', () => {
  const now = Date.now();
  assert.strictEqual(isCacheFresh({ timestamp: now - 1000 }), true);
  assert.strictEqual(isCacheFresh({ timestamp: now - 1000 * 60 * 60 }), false);
  assert.strictEqual(isCacheFresh({ timestamp: now + 1000 }), false);
  assert.strictEqual(isCacheFresh({ timestamp: 'not-a-number' }), false);
  assert.strictEqual(isCacheFresh(null), false);
  assert.strictEqual(isCacheFresh({}), false);
});

test('getEventIcon', () => {
  assert.strictEqual(getEventIcon('PushEvent'), '📤');
  assert.strictEqual(getEventIcon('WatchEvent'), '⭐');
  assert.strictEqual(getEventIcon('CreateEvent'), '✨');
  assert.strictEqual(getEventIcon('UnknownEvent'), '📌');
  assert.strictEqual(getEventIcon(''), '📌');
  assert.strictEqual(getEventIcon(null), '📌');
});

test('THANK_YOU_LANGUAGES structure', () => {
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES));
  if (THANK_YOU_LANGUAGES.length > 0) {
    const lang = THANK_YOU_LANGUAGES[0];
    assert.ok(lang.name.en);
    assert.ok(lang.thankYou);
    assert.ok(lang.welcome);
  }
});

test('translations', () => {
  setLang('ro');
  assert.strictEqual(
    t('intro'),
    'Salut, sunt Fabian. Aici vei găsi o colecție de proiecte open source.'
  );
  assert.strictEqual(t('title'), 'Proiectele lui Fabian');
  assert.strictEqual(t('app_status'), 'Statusul aplicației');

  setLang('fr');
  assert.strictEqual(
    t('intro'),
    'Salut, je suis Fabian. Voici une collection de mes projets open source.'
  );
  assert.strictEqual(t('title'), 'Les projets de Fabian');
});

test('isCacheFresh', () => {
  const now = Date.now();
  assert.strictEqual(isCacheFresh({ timestamp: now }), true);
  assert.strictEqual(isCacheFresh({ timestamp: now - 1000 }), true);
  assert.strictEqual(isCacheFresh({ timestamp: now - 60 * 60 * 1000 }), false);
  assert.strictEqual(isCacheFresh({ timestamp: now + 1000 }), false);
  assert.strictEqual(isCacheFresh(null), false);
  assert.strictEqual(isCacheFresh({}), false);
});

test('projectSections keys existence', () => {
  const keys = [];
  projectSections.liveProjects.forEach(p => {
    keys.push(p.titleKey);
    keys.push(p.descKey);
  });
  projectSections.repositories.forEach(r => {
    keys.push(r.titleKey);
    keys.push(r.descKey);
  });
  const uniqueKeys = [...new Set(keys)];
  uniqueKeys.forEach(key => {
    assert.ok(key in translations.en, `Missing key "${key}" in translations.en`);
    assert.ok(key in translations.ro, `Missing key "${key}" in translations.ro`);
  });
});

test('getRelativeTime edge cases', () => {
  setLang('en');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 60000).toISOString()), '1 minute ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 60000 * 1.5).toISOString()), '1 minute ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 60000 * 2).toISOString()), '2 minutes ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 3600000).toISOString()), '1 hour ago');
});