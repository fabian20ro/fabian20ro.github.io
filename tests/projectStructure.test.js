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
  const expectedLiveCount = 8;
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
