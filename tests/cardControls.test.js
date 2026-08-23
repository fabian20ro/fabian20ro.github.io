const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

function createElement(tagName) {
  const attributes = new Map();
  const listeners = new Map();

  const element = {
    tagName: tagName.toUpperCase(),
    className: '',
    children: [],
    textContent: '',
    append(...children) {
      this.children.push(...children);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event) {
      return listeners.get(type)?.(event);
    }
  };

  element.classList = {
    add(className) {
      const classes = new Set(element.className.split(/\s+/).filter(Boolean));
      classes.add(className);
      element.className = [...classes].join(' ');
    },
    remove(className) {
      element.className = element.className
        .split(/\s+/)
        .filter((value) => value && value !== className)
        .join(' ');
    },
    contains(className) {
      return element.className.split(/\s+/).includes(className);
    }
  };

  return element;
}

test('card header groups a functional project link beside a two-rectangle copy button', () => {
  const originalDocument = global.document;
  global.document = { createElement };

  try {
    const card = app.projectSections.liveProjects[0];
    const header = app.createCardHeader(card);
    const actions = header.children[1];
    const link = actions.children[0];
    const copyButton = actions.children[1];
    const copyIcon = copyButton.children[0];

    assert.equal(header.className, 'card-header');
    assert.equal(actions.className, 'card-actions');
    assert.equal(link.tagName, 'A');
    assert.equal(link.href, card.href);
    assert.equal(link.textContent, '→');
    assert.equal(link.getAttribute('aria-label'), app.t(card.linkKey));
    assert.equal(copyButton.tagName, 'BUTTON');
    assert.equal(copyButton.type, 'button');
    assert.equal(copyButton.getAttribute('aria-label'), app.t(card.copyTitle || 'copy'));
    assert.equal(copyIcon.getAttribute('aria-hidden'), 'true');
    assert.match(copyIcon.children[0].className, /copy-icon-rectangle-back/);
    assert.match(copyIcon.children[1].className, /copy-icon-rectangle-front/);
  } finally {
    global.document = originalDocument;
  }
});

test('arrow and copy controls isolate their events from whole-card navigation', async () => {
  const originalDocument = global.document;
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');
  const originalSetTimeout = global.setTimeout;
  const copiedUrls = [];
  let restoreCopyState;

  global.document = { createElement };
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText(url) {
          copiedUrls.push(url);
        }
      }
    }
  });
  global.setTimeout = (callback) => {
    restoreCopyState = callback;
    return 1;
  };

  try {
    const card = app.projectSections.liveProjects[0];
    const actions = app.createCardHeader(card).children[1];
    const link = actions.children[0];
    const copyButton = actions.children[1];
    let linkClickStopped = false;
    let linkKeydownStopped = false;
    let copyClickStopped = false;
    let copyKeydownStopped = false;

    link.dispatch('click', { stopPropagation: () => (linkClickStopped = true) });
    link.dispatch('keydown', { stopPropagation: () => (linkKeydownStopped = true) });
    await copyButton.dispatch('click', { stopPropagation: () => (copyClickStopped = true) });
    copyButton.dispatch('keydown', { stopPropagation: () => (copyKeydownStopped = true) });

    assert.equal(linkClickStopped, true);
    assert.equal(linkKeydownStopped, true);
    assert.equal(copyClickStopped, true);
    assert.equal(copyKeydownStopped, true);
    assert.deepEqual(copiedUrls, [card.href]);
    assert.equal(copyButton.classList.contains('card-copy-btn-success'), true);
    assert.equal(copyButton.getAttribute('aria-label'), app.t('copySuccess'));

    restoreCopyState();
    assert.equal(copyButton.classList.contains('card-copy-btn-success'), false);
    assert.equal(copyButton.getAttribute('aria-label'), app.t(card.copyTitle || 'copy'));
  } finally {
    global.document = originalDocument;
    global.setTimeout = originalSetTimeout;
    if (originalNavigatorDescriptor) {
      Object.defineProperty(global, 'navigator', originalNavigatorDescriptor);
    } else {
      delete global.navigator;
    }
  }
});

test('clipboard rejection leaves copy button in its default state', async () => {
  const originalDocument = global.document;
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');
  let rejectedWith = null;

  global.document = { createElement };
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText() {
          rejectedWith = new DOMException('Permission denied', 'NotAllowedError');
          throw rejectedWith;
        }
      }
    }
  });

  try {
    const card = app.projectSections.liveProjects[0];
    const originalTitle = app.t(card.copyTitle || 'copy');
    const header = app.createCardHeader(card);
    const copyButton = header.children[1].children[1];

    await copyButton.dispatch('click', { stopPropagation() {} });

    assert.equal(copyButton.classList.contains('card-copy-btn-success'), false, 'success class should not be added on rejection');
    assert.equal(copyButton.getAttribute('aria-label'), originalTitle, 'aria-label should stay at the default title after rejection');
    assert.notEqual(rejectedWith, null, 'writeText must have thrown during dispatch');
  } finally {
    global.document = originalDocument;
    if (originalNavigatorDescriptor) {
      Object.defineProperty(global, 'navigator', originalNavigatorDescriptor);
    } else {
      delete global.navigator;
    }
  }
});

// Strengthen: copy button status node must carry aria-live for accessibility.
test('copy button exposes a polite live region for screen readers', () => {
  const savedDoc = global.document;
  global.document = { createElement };

  try {
    const card = app.projectSections.liveProjects[0];
    const copyButton = app.createCopyButton(card.href, 'Copy');
    // The fake document returns the same element on repeated calls — capture once.
    const statusNode = copyButton.children[1];

    assert.equal(statusNode.getAttribute('role'), 'status', 'status node must have role=status for screen readers');
    assert.equal(statusNode.getAttribute('aria-live'), 'polite', 'status node must announce politely (not assertive)');
  } finally {
    global.document = savedDoc;
  }
});

// Strengthen: copy button success state transitions aria-label and title together.
test('copy button success transitions aria-label, title, and status text atomically', async () => {
  const savedDoc = global.document;
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');
  let restoreCopyState;

  global.document = { createElement };
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText(url) {}
      }
    }
  });
  global.setTimeout = (callback) => {
    restoreCopyState = callback;
    return 1;
  };

  try {
    const card = app.projectSections.liveProjects[0];
    const copyButton = app.createCopyButton(card.href, 'Copy link');
    await copyButton.dispatch('click', { stopPropagation() {} });

    assert.equal(copyButton.getAttribute('aria-label'), app.t('copySuccess'), 'aria-label must update on success');
    assert.equal(copyButton.getAttribute('title'), app.t('copySuccess'), 'title attribute must update on success');
    assert.equal(
      copyButton.children[1].textContent,
      app.t('copySuccess'),
      'status text node must show the translated message'
    );

    restoreCopyState();
    assert.equal(copyButton.getAttribute('aria-label'), 'Copy link', 'aria-label restores to original title');
    assert.equal(copyButton.getAttribute('title'), 'Copy link', 'title attribute restores to original title');
  } finally {
    global.document = savedDoc;
    global.setTimeout = (cb) => cb();
    if (originalNavigatorDescriptor) {
      Object.defineProperty(global, 'navigator', originalNavigatorDescriptor);
    } else {
      delete global.navigator;
    }
  }
});

// Strengthen: cards without an href must not render a copy button.
test('card header omits the copy button for cards without an href', () => {
  const originalDocument = global.document;
  global.document = { createElement };

  try {
    const card = { ...app.projectSections.liveProjects[0], href: '' };
    const header = app.createCardHeader(card);
    const actions = header.children[1];

    assert.equal(actions.className, 'card-actions');
    assert.equal(actions.children.length, 1, 'actions should hold only the project link');
    assert.equal(actions.children[0].tagName, 'A');
    assert.equal(actions.children[0].getAttribute('aria-label'), app.t(card.linkKey));
    assert.equal(
      actions.children.some((child) => child.tagName === 'BUTTON'),
      false,
      'no copy button should exist without an href'
    );
  } finally {
    global.document = originalDocument;
  }
});
