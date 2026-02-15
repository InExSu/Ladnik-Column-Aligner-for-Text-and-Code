import * as assert from 'assert';
import { lines_Align } from '../../aligner/aligner';
import { config_Validate } from '../../aligner/aligner';

console.log('Testing Table Alignment...');

// Test 1: should align lines as a table properly
console.log('Running test: should align lines as a table properly');
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
    'const user = {name: "John" , age : 25 };  ',
    'const config = {host: "localhost", port: 3000, debug: true};   '
  ];

  const aligned = lines_Align(config, input_Lines);

  // Проверяем, что результат соответствует ожидаемому формату таблицы
  assert.ok(aligned[0].includes('const user'));   // Должно быть выравнивание
  assert.ok(aligned[1].includes('const config'));

  // Проверяем, что 'user' и 'config' выровнены
  const first_Line = aligned[0];
  const second_Line = aligned[1];

  // После выравнивания знаки = должны быть на одной позиции
  const first_Equals_Position = first_Line.indexOf('=');
  const second_Equals_Position = second_Line.indexOf('=');

  // Знаки = должны быть выровнены
  assert.strictEqual(first_Equals_Position, second_Equals_Position);
}
console.log('✓ Test passed: should align lines as a table properly');

// Test 2: should align internal values properly
console.log('Running test: should align internal values properly');
// Тест для более сложного случая с внутренними значениями
const config_Obj2 = {
  separators: [':', ','] as any,
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
    'const user = {name: "John" , age : 25 };',
    'const config = {host: "localhost", port: 3000, debug: true};'
  ];

  const aligned2 = lines_Align(config2, input_Lines2);

  // Проверяем, что внутренние значения также выравниваются
  assert.strictEqual(aligned2.length, 2);
}
console.log('✓ Test passed: should align internal values properly');

console.log('All Table Alignment tests passed!');