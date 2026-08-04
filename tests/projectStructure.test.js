const { projectSections } = require('../app.js');

try {
  console.log('Running project structure tests...');

  // Test liveProjects
  assert(
    Array.isArray(projectSections.liveProjects),
    'projectSections.liveProjects should be an array'
  );
  projectSections.liveProjects.forEach((card, i) => {
    assert(card.href, `LiveProject[${i}] missing href`);
    assert(card.icon, `LiveProject[${i}] missing icon`);
    assert(card.titleKey, `LiveProject[${i}] missing titleKey`);
    assert(card.descKey, `LiveProject[${i}] missing descKey`);
    assert(card.linkKey, `LiveProject[${i}] missing linkKey`);
  });

  // Test repositories
  assert(
    Array.isArray(projectSections.repositories),
    'projectSections.repositories should be an array'
  );
  projectSections.repositories.forEach((repo, i) => {
    assert(repo.href, `Repo[${i}] missing href`);
    assert(repo.icon, `Repo[${i}] missing icon`);
    assert(repo.titleKey, `Repo[${i}] missing titleKey`);
    assert(repo.descKey, `Repo[${i}] missing descKey}`);
    assert(repo.linkKey, `Repo[${i}] missing linkKey`);
  });

  // Test structural invariants
  const expectedLiveCount = 9;
  const expectedRepoCount = 6;
  assert(
    projectSections.liveProjects.length === expectedLiveCount,
    'Expected ' + expectedLiveCount + ' live projects'
  );
  assert(
    projectSections.repositories.length === expectedRepoCount,
    'Expected ' + expectedRepoCount + ' repositories'
  );

  // hrefs unique within each section and no cross-list overlap
  const allHrefs = [
    ...projectSections.liveProjects.map(c => c.href),
    ...projectSections.repositories.map(r => r.href)
  ];
  assert(
    new Set(allHrefs).size === allHrefs.length,
    'Duplicate hrefs found across project sections'
  );
  const liveHrefs = new Set(projectSections.liveProjects.map(c => c.href));
  const repoHrefs = new Set(projectSections.repositories.map(r => r.href));
  for (const h of liveHrefs) {
    assert(!repoHrefs.has(h), 'Href ' + h + ' appears in both sections');
  }

  // titleKeys unique within each section
  const liveTitles = projectSections.liveProjects.map(c => c.titleKey);
  const repoTitles = projectSections.repositories.map(r => r.titleKey);
  assert(
    new Set(liveTitles).size === liveTitles.length,
    'Duplicate titleKeys in liveProjects'
  );
  assert(
    new Set(repoTitles).size === repoTitles.length,
    'Duplicate titleKeys in repositories'
  );

  // badgeUrl present on all live projects; repos may have it or not (varies by project)
  projectSections.liveProjects.forEach((card, i) => {
    assert(card.badgeUrl, `LiveProject[${i}] missing badgeUrl`);
  });

  // badgeUrl format: must be a valid https URL on github.com (actions or raw)
  const GITHUB_BARE = /^https:\/\/github\.com\/[^/]+\/[^/]+(\/|$)/;
  for (const section of ['liveProjects', 'repositories']) {
    projectSections[section].forEach((item, i) => {
      if (!item.badgeUrl || item.badgeUrl.length === 0) return;
      assert(
        GITHUB_BARE.test(item.badgeUrl),
        `${section}[${i}] badgeUrl " ${item.badgeUrl}" must be a github.com URL`
      );
    });
  }

  // badgeUrl uniqueness within each section — two projects must not share a badge.
  for (const section of ['liveProjects', 'repositories']) {
    const badges = projectSections[section]
      .filter(item => item.badgeUrl && item.badgeUrl.length > 0)
      .map(item => item.badgeUrl);
    assert(
      new Set(badges).size === badges.length,
      `Duplicate badgeUrls found in ${section}`
    );
  }

  // descKey uniqueness within each section (parallel to titleKey check)
  const liveDescs = projectSections.liveProjects.map(c => c.descKey);
  const repoDescs = projectSections.repositories.map(r => r.descKey);
  assert(
    new Set(liveDescs).size === liveDescs.length,
    'Duplicate descKeys in liveProjects'
  );
  assert(
    new Set(repoDescs).size === repoDescs.length,
    'Duplicate descKeys in repositories'
  );

  // hrefs must be valid URLs (http/https scheme)
  const allItems = [
    ...projectSections.liveProjects.map(c => ({ section: 'live', item: c })),
    ...projectSections.repositories.map(r => ({ section: 'repo', item: r }))
  ];
  for (const { section, item } of allItems) {
    assert(
      /^https?:\/\/.+/.test(item.href),
      `${section}[${item.titleKey}] href must be a valid http(s) URL: ${item.href}`
    );
  }

  // icons must be non-empty strings (emoji or text)
  for (const { section, item } of allItems) {
    assert(
      typeof item.icon === 'string' && item.icon.length > 0,
      `${section}[${item.titleKey}] icon must be a non-empty string`
    );
  }

  // linkKey consistency per section type: live uses visitSite, repos use viewGithub
  projectSections.liveProjects.forEach((card, i) => {
    assert(
      card.linkKey === 'visitSite',
      `LiveProject[${i}] must use linkKey='visitSite' (got '${card.linkKey}')`
    );
  });
  projectSections.repositories.forEach((repo, i) => {
    assert(
      repo.linkKey === 'viewGithub',
      `Repo[${i}] must use linkKey='viewGithub' (got '${repo.linkKey}')`
    );
  });

  // All linkKeys must resolve to non-empty translation strings — prevents raw-key display.
  const { t } = require('../app.js');
  for (const section of ['liveProjects', 'repositories']) {
    projectSections[section].forEach((item, i) => {
      assert(
        typeof item.linkKey === 'string' && item.linkKey.length > 0,
        `${section}[${i}] linkKey must be a non-empty string`
      );
      const roVal = t(item.linkKey);
      assert(
        typeof roVal === 'string' && roVal.length > 0 && roVal !== item.linkKey,
        `${section}[${i}] linkKey "${item.linkKey}" must resolve to a non-empty translation in ro`
      );
    });
  }

  // titleKey content quality: translated titles must be substantive.
  const MIN_TITLE_LENGTH = 5;
  for (const section of ['liveProjects', 'repositories']) {
    projectSections[section].forEach((item, i) => {
      assert(
        typeof item.titleKey === 'string' && item.titleKey.length > 0,
        `${section}[${i}] titleKey must be a non-empty translation key`
      );
      const roVal = t(item.titleKey);
      assert(
        typeof roVal === 'string' && roVal.length >= MIN_TITLE_LENGTH,
        `${section}[${i}] titleKey "${item.titleKey}" resolves to substantive text in ro (>= ${MIN_TITLE_LENGTH} chars)`
      );
    });
  }

  // descKey content quality: translated descriptions must be substantive.
  const MIN_DESC_LENGTH = 15;
  for (const section of ['liveProjects', 'repositories']) {
    projectSections[section].forEach((item, i) => {
      assert(
        typeof item.descKey === 'string' && item.descKey.length > 0,
        `${section}[${i}] descKey must be a non-empty translation key`
      );
      const roVal = t(item.descKey);
      assert(
        typeof roVal === 'string' && roVal.length >= MIN_DESC_LENGTH,
        `${section}[${i}] descKey "${item.descKey}" resolves to substantive text in ro (>= ${MIN_DESC_LENGTH} chars)`
      );
    });
  }

  // All titleKeys/descKeys must exist as actual keys in every language's translations object — prevents stale references.
  const { translations } = require('../app.js');
  for (const lang of Object.keys(translations)) {
    for (const section of ['liveProjects', 'repositories']) {
      projectSections[section].forEach((item, i) => {
        assert(
          item.titleKey in translations[lang],
          `${section}[${i}] titleKey "${item.titleKey}" must be a key in the ${lang} translations object`
        );
        assert(
          item.descKey in translations[lang],
          `${section}[${i}] descKey "${item.descKey}" must be a key in the ${lang} translations object`
        );
      });
    }
  }

  // liveSiteUrl validity: when present, must be a valid http(s) URL; null/missing is allowed
  for (const repo of projectSections.repositories) {
    if (repo.liveSiteUrl != null) {
      assert(
        /^https?:\/\/.+/.test(repo.liveSiteUrl),
        `Repo[${repo.titleKey}] liveSiteUrl must be a valid http(s) URL: ${repo.liveSiteUrl}`
      );
    }
  }

  console.log('Project structure tests passed!');
} catch (err) {
  console.error('Project structure tests failed:');
  console.error(err);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
