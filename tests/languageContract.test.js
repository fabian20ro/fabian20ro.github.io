const assert = require('node:assert');
const { THANK_YOU_LANGUAGES } = require('../app.js');

try {
  console.log('Running language contract tests...');
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES), 'THANK_YOU_LANGUAGES should be an array');

  THANK_YOU_LANGUAGES.forEach((lang, index) => {
    assert.ok(typeof lang.flag === 'string' && lang.flag.length > 0, `Index ${index}: Missing flag`);
    assert.ok(typeof lang.thankYou === 'string' && lang.thankYou.length > 0, `Index ${index}: Missing thankYou string`);
    assert.ok(typeof lang.thankYouPhonetic === 'string' && lang.thankYouPhonetic.length > 0, `Index ${index}: Missing thankYouPhonetic string`);
    assert.ok(typeof lang.welcome === 'string' && lang.welcome.length > 0, `Index ${index}: Missing welcome string`);
    assert.ok(typeof lang.welcomePhonetic === 'string' && lang.welcomePhonetic.length > 0, `Index ${index}: Missing welcomePhonetic string`);
    
    // Check language name object keys
    Object.keys(lang.name).forEach((l) => {
      assert.ok(l !== '', `Index ${index}: Empty language key`);
    });
  });
  console.log('Language contract tests passed!');
} catch (err) {
  console.error('Language contract tests failed:');
  console.error(err);
  process.exit(1);
}
