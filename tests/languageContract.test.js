const test = require('node:test');
const assert = require('node:assert');
const { THANK_YOU_LANGUAGES } = require('../app.js');

test('THANK_YOU_LANGUAGES is an array', () => {
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES), 'THANK_YOU_LANGUAGES should be an array');
});

test('every THANK_YOU_LANGUAGES entry has required fields', () => {
  THANK_YOU_LANGUAGES.forEach((lang, index) => {
    assert.ok(typeof lang.flag === 'string' && lang.flag.length > 0, `Index ${index}: Missing flag`);
    assert.ok(typeof lang.thankYou === 'string' && lang.thankYou.length > 0, `Index ${index}: Missing thankYou string`);
    assert.ok(typeof lang.thankYouPhonetic === 'string' && lang.thankYouPhonetic.length > 0, `Index ${index}: Missing thankYouPhonetic string`);
    assert.ok(typeof lang.welcome === 'string' && lang.welcome.length > 0, `Index ${index}: Missing welcome string`);
    assert.ok(typeof lang.welcomePhonetic === 'string' && lang.welcomePhonetic.length > 0, `Index ${index}: Missing welcomePhonetic string`);

    // Check language name object keys are non-empty
    Object.keys(lang.name).forEach((l) => {
      assert.ok(l !== '', `Index ${index}: Empty language key in name`);
    });
  });
});

test('every THANK_YOU_LANGUAGES entry has en and ro name keys with values', () => {
  for (const lang of THANK_YOU_LANGUAGES) {
    assert.ok(lang.name && typeof lang.name === 'object', `name must be an object`);
    assert.ok('en' in lang.name, 'missing en key in name');
    assert.ok(typeof lang.name.en === 'string' && lang.name.en.length > 0, 'en value must be a non-empty string');
    assert.ok('ro' in lang.name, 'missing ro key in name');
    assert.ok(typeof lang.name.ro === 'string' && lang.name.ro.length > 0, 'ro value must be a non-empty string');
  }
});
