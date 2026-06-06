const assert = require('node:assert');
const { THANK_YOU_LANGUAGES } = require('../app.js');

try {
  console.log('Running app contract tests...');
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES), 'THANK_YOU_LANGUAGES should be an array');
  
  THANK_YOU_LANGUAGES.forEach((lang, index) => {
    assert.ok(lang.name, `Index ${index}: Missing name object`);
    assert.ok(typeof lang.name === 'object', `Index ${index}: name must be an object`);
    assert.ok(lang.flag, `Index ${index}: Missing flag`);
    assert.ok(lang.thankYou, `Index ${index}: Missing thankYou string`);
    assert.ok(lang.thankYouPhonetic, `Index ${index}: Missing thankYouPhonetic string`);
    assert.ok(lang.welcome, `Index ${index}: Missing welcome string`);
    assert.ok(lang.welcomePhonetic, `Index ${index}: Missing welcomePhonetic string`);
    
    // Check language name object keys
    Object.keys(lang.name).forEach(l => {
      assert.ok(l !== '', `Index ${index}: Empty language key`);
    });
  });
  console.log('App contract tests passed!');
} catch (err) {
  console.error('App contract tests failed:');
  console.error(err);
  process.exit(1);
}
