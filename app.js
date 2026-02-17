'use strict';

const GITHUB_USERNAME = 'fabian20ro';
const ACTIVITY_LIMIT = 10;
const ACTIVITY_CACHE_KEY = 'github-activity-cache-v1';
const ACTIVITY_CACHE_TTL_MS = 10 * 60 * 1000;

const projectSections = {
  liveProjects: [
    {
      href: 'https://fabian20ro.github.io/emot-id/',
      icon: '😊',
      titleKey: 'emotIdTitle',
      descKey: 'emotIdDesc',
      linkKey: 'visitSite'
    },
    {
      href: 'https://fabian20ro.github.io/alt-stb/',
      icon: '🚇',
      titleKey: 'betterStbTitle',
      descKey: 'betterStbDesc',
      linkKey: 'visitSite'
    },
    {
      href: 'https://fabian20ro.github.io/image-prompt-expander/',
      icon: '🎨',
      titleKey: 'imagePromptTitle',
      descKey: 'imagePromptDesc',
      linkKey: 'visitSite'
    },
    {
      href: 'https://fabian20ro.github.io/propozitii-nostime/',
      icon: '🇷🇴',
      titleKey: 'propozitiiTitle',
      descKey: 'propozitiiDesc',
      linkKey: 'visitSite'
    }
  ],
  repositories: [
    {
      href: 'https://github.com/fabian20ro/word-rarity-classifier',
      icon: '📊',
      titleKey: 'wordRarityTitle',
      descKey: 'wordRarityDesc',
      linkKey: 'viewGithub'
    },
    {
      href: 'https://github.com/fabian20ro/booking-filter-out',
      icon: '🔍',
      titleKey: 'bookingTitle',
      descKey: 'bookingDesc',
      linkKey: 'viewGithub'
    },
    {
      href: 'https://github.com/fabian20ro/sudoku-python',
      icon: '🧩',
      titleKey: 'sudokuTitle',
      descKey: 'sudokuDesc',
      linkKey: 'viewGithub'
    }
  ]
};

const translations = {
  en: {
    title: "Fabian's Projects",
    intro: "Hi, I'm Fabian. Here you'll find a collection of my open source projects.",
    liveProjects: 'Live Projects',
    repositories: 'Repositories',
    recentActivity: 'Recent Activity',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'An emotion identification tool.',
    betterStbTitle: 'Another STB App',
    betterStbDesc: 'An alternative STB utility app with a different workflow and outputs.',
    imagePromptTitle: 'Image Prompt Expander',
    imagePromptDesc:
      'A tool that helps expand and enhance image generation prompts for better AI-generated images.',
    propozitiiTitle: 'Propozitii Absurde',
    propozitiiDesc: 'Sentences made from random words, always absurd, sometimes funny.',
    wordRarityTitle: 'Word Rarity Classifier',
    wordRarityDesc: 'A classifier that scores and categorizes word rarity.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'A Python-based Sudoku solver and generator.',
    bookingTitle: 'Booking Filter Out',
    bookingDesc:
      'A browser extension to filter booking.com results to greyout locations that accept pets.',
    visitSite: 'Visit site →',
    viewGithub: 'View on GitHub →',
    viewAllGithub: 'View all projects on GitHub →',
    toggleLanguage: 'Toggle language',
    toggleTheme: 'Toggle theme',
    activityLoading: 'Loading activity...',
    activityError: 'Could not load activity.',
    activityViewGithub: 'View activity on GitHub',
    pushedTo: 'pushed to',
    created: 'created',
    starred: 'starred',
    forked: 'forked',
    openedIssue: 'opened an issue in',
    openedPR: 'opened a pull request in',
    commentedOn: 'commented on',
    activityIn: 'activity in',
    justNow: 'just now',
    minuteAgo: '1 minute ago',
    minutesAgo: 'minutes ago',
    hourAgo: '1 hour ago',
    hoursAgo: 'hours ago',
    dayAgo: '1 day ago',
    daysAgo: 'days ago',
    item: 'item',
    in: 'in',
    unknownRepo: 'repository'
  },
  ro: {
    title: 'Proiectele lui Fabian',
    intro: 'Salut, sunt Fabian. Aici vei găsi o colecție de proiecte open source.',
    liveProjects: 'Proiecte Live',
    repositories: 'Cod Sursă',
    recentActivity: 'Activitate Recentă',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'Instrument de identificare a emoțiilor.',
    betterStbTitle: 'Alt STB',
    betterStbDesc:
      'Alternativă mai simplă, organizată altfel, cu toate datele pe telefon, cu codul sursă disponibil public. Scopul nu e să înlocuiască aplicația oficială, InfoTB.',
    imagePromptTitle: 'Image Prompt Expander',
    imagePromptDesc:
      'Instrument care ajută la extinderea și îmbunătățirea prompt-urilor pentru imagini generate de AI.',
    propozitiiTitle: 'Propoziții Absurde',
    propozitiiDesc: 'Propoziții din cuvinte aleatoare, mereu absurde, uneori nostime.',
    wordRarityTitle: 'Word Rarity Classifier',
    wordRarityDesc: 'Clasificator care punctează și categorisește raritatea cuvintelor.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Rezolvă și generează puzzle-uri Sudoku, scris în Python.',
    bookingTitle: 'Booking Filter Out',
    bookingDesc:
      'Extensie de browser care estompează locațiile pet-friendly de pe booking.com.',
    visitSite: 'Vizitează →',
    viewGithub: 'Vezi pe GitHub →',
    viewAllGithub: 'Vezi toate proiectele pe GitHub →',
    toggleLanguage: 'Schimbă limba',
    toggleTheme: 'Schimbă tema',
    activityLoading: 'Se încarcă activitatea...',
    activityError: 'Nu s-a putut încărca activitatea.',
    activityViewGithub: 'Vezi activitatea pe GitHub',
    pushedTo: 'a făcut push în',
    created: 'a creat',
    starred: 'a dat stea la',
    forked: 'a făcut fork la',
    openedIssue: 'a deschis un issue în',
    openedPR: 'a deschis un pull request în',
    commentedOn: 'a comentat la',
    activityIn: 'activitate în',
    justNow: 'chiar acum',
    minuteAgo: 'acum 1 minut',
    minutesAgo: 'minute în urmă',
    hourAgo: 'acum 1 oră',
    hoursAgo: 'ore în urmă',
    dayAgo: 'acum 1 zi',
    daysAgo: 'zile în urmă',
    item: 'element',
    in: 'în',
    unknownRepo: 'depozit'
  }
};

let currentLang = 'en';
let activityEvents = [];

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in restricted/private contexts.
  }
}

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

function normalizeLang(lang) {
  return lang === 'ro' ? 'ro' : 'en';
}

function getDefaultLang() {
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  return browserLang.toLowerCase().startsWith('ro') ? 'ro' : 'en';
}

function getPreferredTheme() {
  const savedTheme = storageGet('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function setTheme(theme) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const icon = document.querySelector('.theme-icon');

  document.documentElement.setAttribute('data-theme', resolvedTheme);
  if (icon) {
    icon.textContent = resolvedTheme === 'dark' ? '☀️' : '🌙';
  }

  storageSet('theme', resolvedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function setLang(lang) {
  currentLang = normalizeLang(lang);
  document.documentElement.lang = currentLang;

  const i18nNodes = document.querySelectorAll('[data-i18n]');
  for (const node of i18nNodes) {
    const key = node.getAttribute('data-i18n');
    if (key) {
      node.textContent = t(key);
    }
  }

  const cardLinks = document.querySelectorAll('.card-link[data-link-key]');
  for (const link of cardLinks) {
    const key = link.getAttribute('data-link-key');
    if (key) {
      link.setAttribute('aria-label', t(key));
      link.setAttribute('title', t(key));
    }
  }

  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  if (langToggle) {
    langToggle.textContent = currentLang.toUpperCase();
    langToggle.setAttribute('aria-label', t('toggleLanguage'));
  }

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', t('toggleTheme'));
  }

  storageSet('lang', currentLang);

  if (activityEvents.length > 0) {
    renderActivity(activityEvents);
  }
}

function toggleLang() {
  setLang(currentLang === 'en' ? 'ro' : 'en');
}

function createCard(card, isSelected) {
  const cardNode = document.createElement('a');
  cardNode.className = 'card';
  if (isSelected) {
    cardNode.classList.add('card-selected');
  }
  cardNode.href = card.href;

  const iconNode = document.createElement('span');
  iconNode.className = 'card-icon';
  iconNode.textContent = card.icon;
  iconNode.setAttribute('aria-hidden', 'true');

  const titleNode = document.createElement('span');
  titleNode.className = 'card-title';
  titleNode.setAttribute('data-i18n', card.titleKey);
  titleNode.textContent = t(card.titleKey);

  const descNode = document.createElement('span');
  descNode.className = 'card-desc';
  descNode.setAttribute('data-i18n', card.descKey);
  descNode.textContent = t(card.descKey);

  const linkNode = document.createElement('span');
  linkNode.className = 'card-link';
  linkNode.setAttribute('data-link-key', card.linkKey);
  linkNode.setAttribute('aria-label', t(card.linkKey));
  linkNode.setAttribute('title', t(card.linkKey));
  linkNode.textContent = '→';

  const headerNode = document.createElement('div');
  headerNode.className = 'card-header';

  const titleRowNode = document.createElement('div');
  titleRowNode.className = 'card-title-row';
  titleRowNode.append(iconNode, titleNode);

  headerNode.append(titleRowNode, linkNode);

  cardNode.append(headerNode, descNode);
  return cardNode;
}

function renderProjectCards() {
  const liveProjects = document.getElementById('live-projects');
  const repositories = document.getElementById('repositories');

  if (liveProjects) {
    liveProjects.replaceChildren(
      ...projectSections.liveProjects.map((card, index) => createCard(card, index === 0))
    );
  }

  if (repositories) {
    repositories.replaceChildren(
      ...projectSections.repositories.map((card) => createCard(card, false))
    );
  }
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return t('justNow');
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('justNow');
  if (diffMins === 1) return t('minuteAgo');
  if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
  if (diffHours === 1) return t('hourAgo');
  if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
  if (diffDays === 1) return t('dayAgo');
  return `${diffDays} ${t('daysAgo')}`;
}

function getEventIcon(type) {
  const icons = {
    PushEvent: '📤',
    CreateEvent: '✨',
    WatchEvent: '⭐',
    ForkEvent: '🍴',
    IssuesEvent: '🐛',
    PullRequestEvent: '🔀',
    IssueCommentEvent: '💬',
    PullRequestReviewCommentEvent: '💬'
  };

  return icons[type] || '📌';
}

function parseRepoName(repoName) {
  if (typeof repoName !== 'string') {
    return null;
  }

  const [owner, repo] = repoName.split('/');
  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}

function buildRepoUrl(repoName) {
  const parsed = parseRepoName(repoName);
  if (!parsed) {
    return `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
  }

  return `https://github.com/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
}

function appendText(node, text) {
  node.appendChild(document.createTextNode(text));
}

function appendLink(node, href, label) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  node.appendChild(link);
}

function createActivityText(event) {
  const textNode = document.createElement('div');
  textNode.className = 'activity-text';

  const repoName = event && event.repo && event.repo.name ? event.repo.name : '';
  const repoLabel = repoName || t('unknownRepo');
  const repoUrl = buildRepoUrl(repoName);

  switch (event.type) {
    case 'PushEvent': {
      const ref =
        event.payload && typeof event.payload.ref === 'string'
          ? event.payload.ref
          : 'refs/heads/main';
      const branch = ref.replace('refs/heads/', '') || 'main';
      const branchUrl = `${repoUrl}/tree/${encodeURIComponent(branch)}`;
      appendText(textNode, `${t('pushedTo')} `);
      appendLink(textNode, branchUrl, repoLabel);
      break;
    }
    case 'CreateEvent': {
      const refType = (event.payload && event.payload.ref_type) || 'repository';
      const refValue = (event.payload && event.payload.ref) || '';

      if (refType === 'repository') {
        appendText(textNode, `${t('created')} `);
        appendLink(textNode, repoUrl, repoLabel);
      } else {
        const refUrl = `${repoUrl}/tree/${encodeURIComponent(refValue || 'main')}`;
        appendText(textNode, `${t('created')} ${refType || t('item')} `);
        appendLink(textNode, refUrl, refValue || 'main');
        appendText(textNode, ` ${t('in')} `);
        appendLink(textNode, repoUrl, repoLabel);
      }
      break;
    }
    case 'WatchEvent':
      appendText(textNode, `${t('starred')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
    case 'ForkEvent':
      appendText(textNode, `${t('forked')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
    case 'IssuesEvent': {
      const issueNumber = event.payload && event.payload.issue ? event.payload.issue.number : null;
      const issueUrl = Number.isInteger(issueNumber) ? `${repoUrl}/issues/${issueNumber}` : repoUrl;
      appendText(textNode, `${t('openedIssue')} `);
      appendLink(
        textNode,
        issueUrl,
        Number.isInteger(issueNumber) ? `${repoLabel}#${issueNumber}` : repoLabel
      );
      break;
    }
    case 'PullRequestEvent': {
      const prNumber =
        event.payload && event.payload.pull_request ? event.payload.pull_request.number : null;
      const prUrl = Number.isInteger(prNumber) ? `${repoUrl}/pull/${prNumber}` : repoUrl;
      appendText(textNode, `${t('openedPR')} `);
      appendLink(
        textNode,
        prUrl,
        Number.isInteger(prNumber) ? `${repoLabel}#${prNumber}` : repoLabel
      );
      break;
    }
    case 'IssueCommentEvent':
    case 'PullRequestReviewCommentEvent':
      appendText(textNode, `${t('commentedOn')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
    default:
      appendText(textNode, `${t('activityIn')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
  }

  return textNode;
}

function createActivityItem(event) {
  const item = document.createElement('div');
  item.className = 'activity-item';

  const icon = document.createElement('span');
  icon.className = 'activity-icon';
  icon.textContent = getEventIcon(event.type);
  icon.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'activity-content';

  const time = document.createElement('div');
  time.className = 'activity-time';
  time.textContent = getRelativeTime(event.created_at);

  content.append(createActivityText(event), time);
  item.append(icon, content);
  return item;
}

function showActivityError() {
  const feed = document.getElementById('activity-feed');
  if (!feed) {
    return;
  }

  const error = document.createElement('div');
  error.className = 'activity-error';
  appendText(error, `${t('activityError')} `);

  const link = document.createElement('a');
  link.href = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
  link.textContent = t('activityViewGithub');
  error.appendChild(link);

  feed.replaceChildren(error);
}

function renderActivity(events) {
  const feed = document.getElementById('activity-feed');
  if (!feed) {
    return;
  }

  if (!Array.isArray(events) || events.length === 0) {
    showActivityError();
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const event of events.slice(0, ACTIVITY_LIMIT)) {
    fragment.appendChild(createActivityItem(event));
  }

  feed.replaceChildren(fragment);
}

function readActivityCache() {
  const cacheRaw = storageGet(ACTIVITY_CACHE_KEY);
  if (!cacheRaw) {
    return null;
  }

  try {
    const parsed = JSON.parse(cacheRaw);
    if (!parsed || !Array.isArray(parsed.events) || typeof parsed.timestamp !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeActivityCache(events) {
  const payload = {
    timestamp: Date.now(),
    events: events.slice(0, 30)
  };

  storageSet(ACTIVITY_CACHE_KEY, JSON.stringify(payload));
}

function isCacheFresh(cache) {
  return Date.now() - cache.timestamp < ACTIVITY_CACHE_TTL_MS;
}

async function fetchGitHubActivity() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  const events = await response.json();
  return Array.isArray(events) ? events : [];
}

async function loadGitHubActivity() {
  const cache = readActivityCache();

  if (cache && Array.isArray(cache.events) && cache.events.length > 0) {
    activityEvents = cache.events;
    renderActivity(activityEvents);
  }

  if (cache && isCacheFresh(cache)) {
    return;
  }

  try {
    const events = await fetchGitHubActivity();
    activityEvents = events;
    writeActivityCache(events);
    renderActivity(activityEvents);
  } catch {
    if (activityEvents.length === 0) {
      showActivityError();
    }
  }
}

function init() {
  renderProjectCards();

  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  if (langToggle) {
    langToggle.addEventListener('click', toggleLang);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  setTheme(getPreferredTheme());
  setLang(normalizeLang(storageGet('lang') || getDefaultLang()));
  loadGitHubActivity();
}

init();
