import * as assert from 'assert';
import { columns_Widths_Calculate, parsed_Line_Align, lines_Reconstruct_With_Empties, lines_Align } from '../../aligner/aligner';
import { Parse_Result } from '../../aligner/types';

console.log('Testing Aligner Functions...');

// Test 1: columns_Widths_Calculate should calculate max widths correctly
console.log('Running test: columns_Widths_Calculate should calculate max widths correctly');
const parsed_Lines: Parse_Result[] = [
  { columns: ['short', 'medium text', 'a'], separators: [':' as any, ':' as any] },
  { columns: ['longer text', 'tiny', 'quite long text'], separators: [':' as any, ':' as any] },
  { columns: ['mid', 'mid', 'mid'], separators: [':' as any, ':' as any] }
];

const widths = columns_Widths_Calculate(parsed_Lines);
// ['longer text', 'medium text', 'quite long text'] -> [11, 11, 14]
assert.deepStrictEqual(widths, [11, 11, 15]);
console.log('✓ Test passed: columns_Widths_Calculate');

// Test 2: parsed_Line_Align should align a single line
console.log('Running test: parsed_Line_Align should align a single line');
const parsed: Parse_Result = {
  columns: ['key', ' value'],
  separators: ['=' as any]
};

const aligned = parsed_Line_Align(parsed, [10, 10], 2);
// 'key' (width 3) padded to 10 = 'key       '
// ' value' (width 6) padded to 10 = ' value    '
// Combined with separator and padding: 'key       =  value    '
assert.strictEqual(aligned, 'key       =  value');
console.log('✓ Test passed: parsed_Line_Align');

// Test 3: lines_Reconstruct_With_Empties should restore empty lines
console.log('Running test: lines_Reconstruct_With_Empties should restore empty lines');
const original_Lines = ['first', '', 'third', '', 'fifth'];
const aligned_Lines = ['first_aligned', 'third_aligned', 'fifth_aligned'];
const empty_Line_Indices = [1, 3];

const reconstructed = lines_Reconstruct_With_Empties(original_Lines, aligned_Lines, empty_Line_Indices);
assert.deepStrictEqual(reconstructed, ['first_aligned', '', 'third_aligned', '', 'fifth_aligned']);
console.log('✓ Test passed: lines_Reconstruct_With_Empties');

// Test 4: lines_Align should align simple key-value pairs
console.log('Running test: lines_Align should align simple key-value pairs');
const config2 = {
  separators: ['='] as any,
  padding: 2 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

const lines2 = [
  'key1 = value1',
  'very_long_key = value2',
  'k = value3'
];

// Ожидаемый результат после выравнивания:
const expected2 = [
  'key1          =  value1',
  'very_long_key =  value2',
  'k             =  value3'
];

const aligned2 = lines_Align(config2, lines2);

console.log(`  Input:    [${lines2.map(l => `"${l}"`).join(', ')}]`);
console.log(`  Expected: [${expected2.map(l => `"${l}"`).join(', ')}]`);
console.log(`  Actual:   [${aligned2.map(l => `"${l}"`).join(', ')}]`);

assert.strictEqual(aligned2[0], expected2[0]);
assert.strictEqual(aligned2[1], expected2[1]);
assert.strictEqual(aligned2[2], expected2[2]);
console.log('✓ Test passed: lines_Align');

console.log('All Aligner tests passed!');