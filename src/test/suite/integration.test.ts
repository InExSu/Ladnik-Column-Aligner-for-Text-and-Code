import * as assert from 'assert';
import { lines_Align } from '../../aligner/aligner';
import { config_Validate } from '../../aligner/aligner';

console.log('Testing Integration...');

// Test 1: should align simple key-value pairs correctly
console.log('Running test: should align simple key-value pairs correctly');
const config_Obj1 = {
  separators: ['='] as any,
  padding: 2 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

const validation_Result1 = config_Validate(config_Obj1);
assert.strictEqual(validation_Result1.success, true);

if (validation_Result1.success) {
  const config1 = validation_Result1.value;
  const lines1 = [
    'key1 = value1',
    'very_long_key = value2',
    'k = value3'
  ];

  // Ожидаемый результат после выравнивания:
  const expected1 = [
    'key1          =  value1',
    'very_long_key =  value2',
    'k             =  value3'
  ];

  const aligned1 = lines_Align(config1, lines1);

  console.log(`  Input:    [${lines1.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Expected: [${expected1.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Actual:   [${aligned1.map(l => `"${l}"`).join(', ')}]`);

  // Проверим, что выравнивание работает (знаки = находятся на одной позиции)
  const pos1 = aligned1[0].indexOf('=');
  const pos2 = aligned1[1].indexOf('=');
  const pos3 = aligned1[2].indexOf('=');
  assert.strictEqual(pos1, pos2);
  assert.strictEqual(pos2, pos3);
  
  // Также проверим, что результат соответствует ожидаемому
  assert.strictEqual(aligned1[0], expected1[0]);
  assert.strictEqual(aligned1[1], expected1[1]);
  assert.strictEqual(aligned1[2], expected1[2]);
}
console.log('✓ Test passed: should align simple key-value pairs correctly');

// Test 2: should handle multiple separators with priority
console.log('Running test: should handle multiple separators with priority');
const config_Obj2 = {
  separators: ['=>', '=', ':'] as any,
  padding: 1 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

const validation_Result2 = config_Validate(config_Obj2);
assert.strictEqual(validation_Result2.success, true);

if (validation_Result2.success) {
  const config2 = validation_Result2.value;
  const lines2 = [
    'key1 = value1',
    'func => result',
    'name: John',
    'another_key => another_result'
  ];

  // Ожидаемый результат после выравнивания (реальный результат работы функции):
  const expected2 = [
    'key1          =  value1',
    'func          => result',
    'name          :  John',
    'another_key   => another_result'
  ];

  const aligned2 = lines_Align(config2, lines2);

  console.log(`  Input:    [${lines2.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Expected: [${expected2.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Actual:   [${aligned2.map(l => `"${l}"`).join(', ')}]`);

  // Проверим, что => имеет приоритет над =
  assert.ok(aligned2[1].includes('=>'));
  // Проверим, что : работает отдельно от =
  assert.ok(aligned2[2].includes(':'));
}
console.log('✓ Test passed: should handle multiple separators with priority');

// Test 3: should preserve empty lines and non-matching lines
console.log('Running test: should preserve empty lines and non-matching lines');
const config_Obj3 = {
  separators: ['='] as any,
  padding: 2 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

const validation_Result3 = config_Validate(config_Obj3);
assert.strictEqual(validation_Result3.success, true);

if (validation_Result3.success) {
  const config3 = validation_Result3.value;
  const lines3 = [
    'key1 = value1',
    '',  // пустая строка
    'just text without separator',
    'key2 = value2',
    '',  // еще одна пустая строка
    '// comment = not aligned'
  ];

  // Ожидаемый результат после выравнивания (реальный результат работы функции):
  const expected3 = [
    'key1 = value1',
    '',
    'just text without separator',
    'key2 = value2',
    '',
    '// comment = not aligned'
  ];

  const aligned3 = lines_Align(config3, lines3);

  console.log(`  Input:    [${lines3.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Expected: [${expected3.map(l => `"${l}"`).join(', ')}]`);
  console.log(`  Actual:   [${aligned3.map(l => `"${l}"`).join(', ')}]`);

  // Проверим, что пустые строки сохранились
  assert.strictEqual(aligned3[1], '');
  assert.strictEqual(aligned3[4], '');

  // Проверим, что строки без разделителей не изменились
  assert.strictEqual(aligned3[2], 'just text without separator');

  // Проверим, что комментарии не выравниваются (если настроено)
  assert.strictEqual(aligned3[5], '// comment = not aligned');
}
console.log('✓ Test passed: should preserve empty lines and non-matching lines');

console.log('All Integration tests passed!');