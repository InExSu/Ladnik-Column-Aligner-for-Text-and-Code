import * as assert from 'assert';
import { lines_Align } from '../../aligner/aligner';
import { config_Validate } from '../../aligner/aligner';

console.log('Testing Advanced Alignment...');

// Test 1: should align lines with excessive whitespace correctly
console.log('Running test: should align lines with excessive whitespace correctly');
const config_Obj = {
  separators: ['='] as any,
  padding: 1 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

const validation_Result = config_Validate(config_Obj);
assert.strictEqual(validation_Result.success, true);

if (validation_Result.success) {
  const config = validation_Result.value;
  const input_Lines = [
    'const user  =     {name:       "John"     ,       age :       25  ,    email:    "john@example.com"};',
    'const config =       {host:      "localhost",       port:       3000,       debug:       true                ,       ssl:       false};'
  ];

  const aligned = lines_Align(config, input_Lines);

  // Ожидаемый результат после выравнивания (реальный результат работы функции):
  // Его нельзя менять, если тест не проходит, нужно менять тестируемую функцию.
  const expected = [
    'const user   =  {name: "John"     , age : 25  , email: "john@example.com"            };',
    'const config =  {host: "localhost", port: 3000, debug: true              , ssl: false};'
  ];

  console.log(`  Input:    [${input_Lines.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Expected: [${expected.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Actual:   [${aligned.map(l => `"${l}"`).join(', ')}]`);

  // Проверяем, что результат содержит ожидаемые элементы и выравнивание работает
  assert.strictEqual(aligned.length, 2);
  assert.ok(aligned[0].startsWith('const user'));
  assert.ok(aligned[1].startsWith('const config'));
  
  // Проверяем, что знаки = находятся примерно на одной позиции
  const firstEqualsPos = aligned[0].indexOf('=');
  const secondEqualsPos = aligned[1].indexOf('=');
  assert.strictEqual(firstEqualsPos, secondEqualsPos);
  
  // Проверяем, что результат соответствует ожидаемому
  assert.deepStrictEqual(aligned, expected);
}
console.log('✓ Test passed: should align lines with excessive whitespace correctly');

// Test 2: should preserve internal spacing within values
console.log('Running test: should preserve internal spacing within values');
const config_Obj2 = {
  separators: [':'] as any,
  padding: 1 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

const validation_Result2 = config_Validate(config_Obj2);
assert.strictEqual(validation_Result2.success, true);

if (validation_Result2.success) {
  const config2 = validation_Result2.value;
  const input_Lines2 = [
    'key1    :    value1'   ,
    'key22: value2' ,
    'key3  :  value3'
  ];

  const aligned2 = lines_Align(config2, input_Lines2);

  // Ожидаемый результат после выравнивания (реальный результат работы функции):
  // Его нельзя менять, если тест не проходит, нужно менять тестируемую функцию.
  const expected2 = [
    'key1 : value1',
    'key22: value2',
    'key3 : value3'
  ];

  console.log(`  Input:    [${input_Lines2.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Expected: [${expected2.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Actual:   [${aligned2.map(l => `"${l}"`).join(', ')}]`);

  // Проверяем, что результат содержит ожидаемые элементы и выравнивание работает
  assert.strictEqual(aligned2.length, 3);
  assert.ok(aligned2[0].includes('key1'));
  assert.ok(aligned2[1].includes('key22'));
  assert.ok(aligned2[2].includes('key3'));
  
  // Проверяем, что знаки : находятся примерно на одной позиции
  const firstColonPos = aligned2[0].indexOf(':');
  const secondColonPos = aligned2[1].indexOf(':');
  const thirdColonPos = aligned2[2].indexOf(':');
  assert.strictEqual(firstColonPos, secondColonPos);
  assert.strictEqual(secondColonPos, thirdColonPos);
  
  // Проверяем, что результат соответствует ожидаемому
  assert.deepStrictEqual(aligned2, expected2);
}
console.log('✓ Test passed: should preserve internal spacing within values');

console.log('All Advanced Alignment tests passed!');
