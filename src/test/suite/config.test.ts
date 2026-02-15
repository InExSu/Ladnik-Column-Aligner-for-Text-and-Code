import * as assert from 'assert';
import { config_Validate } from '../../aligner/aligner';

console.log('Testing Config Validation...');

// Test 1: should validate correct configuration
console.log('Running test: should validate correct configuration');
const valid_Config = {
  separators: ['=', '=>'],
  padding: 2,
  alignComments: true,
  ignorePrefix: ['//', '#'],
  languages: ['.js', '.ts']
};

const result = config_Validate(valid_Config);
assert.strictEqual(result.success, true);
if (result.success) {
  assert.deepStrictEqual(result.value.separators, ['=', '=>']);
  assert.strictEqual(result.value.padding, 2);
  assert.strictEqual(result.value.alignComments, true);
}
console.log('✓ Test passed: should validate correct configuration');

// Test 2: should reject invalid separators
console.log('Running test: should reject invalid separators');
const invalid_Config1 = {
  separators: 'not an array',
  padding: 2,
  alignComments: true,
  ignorePrefix: ['//'],
  languages: ['.js']
};

const result1 = config_Validate(invalid_Config1);
assert.strictEqual(result1.success, false);
console.log('✓ Test passed: should reject invalid separators');

// Test 3: should reject negative padding
console.log('Running test: should reject negative padding');
const invalid_Config2 = {
  separators: ['='],
  padding: -1,
  alignComments: true,
  ignorePrefix: ['//'],
  languages: ['.js']
};

const result2 = config_Validate(invalid_Config2);
assert.strictEqual(result2.success, false);
console.log('✓ Test passed: should reject negative padding');

// Test 4: should reject non-boolean alignComments
console.log('Running test: should reject non-boolean alignComments');
const invalid_Config3 = {
  separators: ['='],
  padding: 2,
  alignComments: 'not a boolean',
  ignorePrefix: ['//'],
  languages: ['.js']
};

const result3 = config_Validate(invalid_Config3);
assert.strictEqual(result3.success, false);
console.log('✓ Test passed: should reject non-boolean alignComments');

console.log('All Config tests passed!');