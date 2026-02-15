import * as assert from 'assert';
import { line_Is_Empty, line_Starts_With_Ignore_Prefix, line_Is_Valid_For_Alignment, separators_Sort_By_Length_Desc, separator_Find_Longest_First, line_Parse_Into_Columns, column_Width_Calculate, column_Pad_Right } from '../../aligner/parser';

console.log('Testing Parser Functions...');

// Test 1: line_Is_Empty should correctly identify empty lines
console.log('Running test: line_Is_Empty should correctly identify empty lines');
assert.strictEqual(line_Is_Empty(''), true);
assert.strictEqual(line_Is_Empty('   '), true);
assert.strictEqual(line_Is_Empty('\t'), true);
assert.strictEqual(line_Is_Empty('text'), false);
assert.strictEqual(line_Is_Empty('  text  '), false);
console.log('✓ Test passed: line_Is_Empty should correctly identify empty lines');

// Test 2: line_Starts_With_Ignore_Prefix should detect ignored prefixes
console.log('Running test: line_Starts_With_Ignore_Prefix should detect ignored prefixes');
const prefixes = ['//', '#', ';'];

assert.strictEqual(line_Starts_With_Ignore_Prefix('// comment', prefixes), true);
assert.strictEqual(line_Starts_With_Ignore_Prefix('# comment', prefixes), true);
assert.strictEqual(line_Starts_With_Ignore_Prefix('; comment', prefixes), true);
assert.strictEqual(line_Starts_With_Ignore_Prefix('text // comment', prefixes), false);
assert.strictEqual(line_Starts_With_Ignore_Prefix('normal text', prefixes), false);
console.log('✓ Test passed: line_Starts_With_Ignore_Prefix should detect ignored prefixes');

// Test 3: line_Is_Valid_For_Alignment should validate lines correctly
console.log('Running test: line_Is_Valid_For_Alignment should validate lines correctly');
assert.strictEqual(line_Is_Valid_For_Alignment('', prefixes), false);
assert.strictEqual(line_Is_Valid_For_Alignment('   ', prefixes), false);
assert.strictEqual(line_Is_Valid_For_Alignment('// comment', prefixes), false);
assert.strictEqual(line_Is_Valid_For_Alignment('normal=text', prefixes), true);
assert.strictEqual(line_Is_Valid_For_Alignment('  spaced = text  ', prefixes), true);
console.log('✓ Test passed: line_Is_Valid_For_Alignment should validate lines correctly');

// Test 4: separators_Sort_By_Length_Desc should sort separators by length
console.log('Running test: separators_Sort_By_Length_Desc should sort separators by length');
const separators = ['=>', '=', '===', '->'];
const expected = ['===', '=>', '->', '='];

const result = separators_Sort_By_Length_Desc(separators as any);
assert.deepStrictEqual(result, expected);
console.log('✓ Test passed: separators_Sort_By_Length_Desc should sort separators by length');

// Test 5: separator_Find_Longest_First should find longest separator
console.log('Running test: separator_Find_Longest_First should find longest separator');
assert.strictEqual(separator_Find_Longest_First('a => b', separators as any), '=>');
assert.strictEqual(separator_Find_Longest_First('a === b', separators as any), '===');
assert.strictEqual(separator_Find_Longest_First('a = b', separators as any), '=');
assert.strictEqual(separator_Find_Longest_First('x -> y', separators as any), '->');
assert.strictEqual(separator_Find_Longest_First('no separator here', separators as any), null);
console.log('✓ Test passed: separator_Find_Longest_First should find longest separator');

// Test 6: line_Parse_Into_Columns should parse simple cases
console.log('Running test: line_Parse_Into_Columns should parse simple cases');
const separators2 = ['=', '=>'];

// Простой случай с одним разделителем
const result1 = line_Parse_Into_Columns('key = value', separators2 as any);
assert.deepStrictEqual(result1, {
  columns: ['key ', ' value'],
  separators: ['=']
});

// Случай с приоритетом более длинного разделителя
const result2 = line_Parse_Into_Columns('key => value', separators2 as any);
assert.deepStrictEqual(result2, {
  columns: ['key ', ' value'],
  separators: ['=>']
});

// Случай без разделителей
const result3 = line_Parse_Into_Columns('just text', separators2 as any);
assert.deepStrictEqual(result3, {
  columns: ['just text'],
  separators: []
});
console.log('✓ Test passed: line_Parse_Into_Columns should parse simple cases');

// Test 7: line_Parse_Into_Columns should ignore separators inside strings
console.log('Running test: line_Parse_Into_Columns should ignore separators inside strings');
// Разделитель внутри одинарных кавычек не должен обрабатываться
const result4 = line_Parse_Into_Columns("key = 'value with = sign'", separators2 as any);
assert.deepStrictEqual(result4, {
  columns: ['key ', " 'value with = sign'"],
  separators: ['=']
});

// Разделитель внутри двойных кавычек не должен обрабатываться
const result5 = line_Parse_Into_Columns('key = "value with = sign"', separators2 as any);
assert.deepStrictEqual(result5, {
  columns: ['key ', ' "value with = sign"'],
  separators: ['=']
});

// Разделитель внутри обратных кавычек не должен обрабатываться
const result6 = line_Parse_Into_Columns('key = `value with = sign`', separators2 as any);
assert.deepStrictEqual(result6, {
  columns: ['key ', ' `value with = sign`'],
  separators: ['=']
});
console.log('✓ Test passed: line_Parse_Into_Columns should ignore separators inside strings');

// Test 8: line_Parse_Into_Columns should ignore separators inside comments
console.log('Running test: line_Parse_Into_Columns should ignore separators inside comments');
// Однострочный комментарий
const result7 = line_Parse_Into_Columns('key = value // comment with = sign', separators2 as any);
assert.deepStrictEqual(result7, {
  columns: ['key ', ' value // comment with = sign'],
  separators: ['=']
});

// Блочный комментарий
const result8 = line_Parse_Into_Columns('key = value /* comment with = sign */ end', separators2 as any);
assert.deepStrictEqual(result8, {
  columns: ['key ', ' value /* comment with = sign */ end'],
  separators: ['=']
});
console.log('✓ Test passed: line_Parse_Into_Columns should ignore separators inside comments');

// Test 9: column_Width_Calculate should calculate width correctly
console.log('Running test: column_Width_Calculate should calculate width correctly');
assert.strictEqual(column_Width_Calculate('hello'), 5);
assert.strictEqual(column_Width_Calculate(''), 0);
assert.strictEqual(column_Width_Calculate('  spaced  '), 10);
// Проверка с юникодом
assert.strictEqual(column_Width_Calculate('héllo'), 5); // 5 символов
console.log('✓ Test passed: column_Width_Calculate should calculate width correctly');

// Test 10: column_Pad_Right should pad columns correctly
console.log('Running test: column_Pad_Right should pad columns correctly');
assert.strictEqual(column_Pad_Right('hi', 5), 'hi   ');
assert.strictEqual(column_Pad_Right('hello', 5), 'hello');
assert.strictEqual(column_Pad_Right('test', 10), 'test      ');
assert.strictEqual(column_Pad_Right('', 3), '   ');
console.log('✓ Test passed: column_Pad_Right should pad columns correctly');

console.log('All Parser tests passed!');