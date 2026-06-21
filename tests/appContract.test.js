const assert = require('node:assert');
const { THANK_YOU_LANGUAGES } = require('../app.js');

try {
  console.log('Running app contract tests...');
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES), 'THANK_YOU_LANGUAGES should be an array');

  THANK_YOU_LANGUAGES.forEach((lang, index) => {
    assert.ok(lang.name && typeof lang.name === 'object', `Index ${index}: Missing or invalid name object`);
    assert.ok(typeof lang.flag === 'string', `Index ${index}: Missing or invalid flag`);
    assert.ok(typeof lang.thankYou === 'string', `Index ${index}: Missing or invalid thankYou`);
    assert.ok(typeof lang.thankYouPhonetic === 'string', `Index ${index}: Missing or invalid thankYouPhonetic`);
    assert.ok(typeof lang.welcome === 'string', `Index ${index}: Missing or invalid welcome`);
    assert.ok(typeof lang.welcomePhonetic === 'string', `Index ${index}: Missing or invalid welcomePhonetic`);

    // Check language name object keys
    Object.keys(lang.name).forEach(langKey => {
      assert.ok(typeof lang.name[langKey] === 'string', `Index ${index}: Value for '${langKey}' must be a string`);
    });

    // Ensure en and ro are present in name object
    assert.ok(lang.name.en, `Index ${index}: Missing English ('en') in name object`);
    assert.ok(lang.name.ro, `Index ${index}: Missing Romanian ('ro') in name object`);
  });
  console.log('App contract tests passed!');
} catch (err) {
  console.error('App contract tests failed:');
  console.error(err);
  process.exit(1);
}
