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
