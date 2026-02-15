import { expect } from 'chai';
import { line_Is_Empty, line_Starts_With_Ignore_Prefix, line_Is_Valid_For_Alignment, separators_Sort_By_Length_Desc, separator_Find_Longest_First, line_Parse_Into_Columns, column_Width_Calculate, column_Pad_Right } from '../../aligner/parser';

describe('Parser Functions Tests', () => {
  // Test 1: line_Is_Empty should correctly identify empty lines
  it('should correctly identify empty lines', () => {
    expect(line_Is_Empty('')).to.be.true;
    expect(line_Is_Empty('   ')).to.be.true;
    expect(line_Is_Empty('\t')).to.be.true;
    expect(line_Is_Empty('text')).to.be.false;
    expect(line_Is_Empty('  text  ')).to.be.false;
  });

  // Test 2: line_Starts_With_Ignore_Prefix should detect ignored prefixes
  it('should detect ignored prefixes', () => {
    const prefixes = ['//', '#', ';'];

    expect(line_Starts_With_Ignore_Prefix('// comment', prefixes)).to.be.true;
    expect(line_Starts_With_Ignore_Prefix('# comment', prefixes)).to.be.true;
    expect(line_Starts_With_Ignore_Prefix('; comment', prefixes)).to.be.true;
    expect(line_Starts_With_Ignore_Prefix('text // comment', prefixes)).to.be.false;
    expect(line_Starts_With_Ignore_Prefix('normal text', prefixes)).to.be.false;
  });

  // Test 3: line_Is_Valid_For_Alignment should validate lines correctly
  it('should validate lines correctly', () => {
    const prefixes = ['//', '#', ';'];
    
    expect(line_Is_Valid_For_Alignment('', prefixes)).to.be.false;
    expect(line_Is_Valid_For_Alignment('   ', prefixes)).to.be.false;
    expect(line_Is_Valid_For_Alignment('// comment', prefixes)).to.be.false;
    expect(line_Is_Valid_For_Alignment('normal=text', prefixes)).to.be.true;
    expect(line_Is_Valid_For_Alignment('  spaced = text  ', prefixes)).to.be.true;
  });

  // Test 4: separators_Sort_By_Length_Desc should sort separators by length
  it('should sort separators by length', () => {
    const separators = ['=>', '=', '===', '->'];
    const expected = ['===', '=>', '->', '='];

    const result = separators_Sort_By_Length_Desc(separators as any);
    expect(result).to.deep.equal(expected);
  });

  // Test 5: separator_Find_Longest_First should find longest separator
  it('should find longest separator', () => {
    const separators = ['=>', '=', '===', '->'];
    
    expect(separator_Find_Longest_First('a => b', separators as any)).to.equal('=>');
    expect(separator_Find_Longest_First('a === b', separators as any)).to.equal('===');
    expect(separator_Find_Longest_First('a = b', separators as any)).to.equal('=');
    expect(separator_Find_Longest_First('x -> y', separators as any)).to.equal('->');
    expect(separator_Find_Longest_First('no separator here', separators as any)).to.be.null;
  });

  // Test 6: line_Parse_Into_Columns should parse simple cases
  it('should parse simple cases', () => {
    const separators2 = ['=', '=>'];

    // Простой случай с одним разделителем
    const result1 = line_Parse_Into_Columns('key = value', separators2 as any);
    expect(result1).to.deep.equal({
      columns: ['key ', ' value'],
      separators: ['=']
    });

    // Случай с приоритетом более длинного разделителя
    const result2 = line_Parse_Into_Columns('key => value', separators2 as any);
    expect(result2).to.deep.equal({
      columns: ['key ', ' value'],
      separators: ['=>']
    });

    // Случай без разделителей
    const result3 = line_Parse_Into_Columns('just text', separators2 as any);
    expect(result3).to.deep.equal({
      columns: ['just text'],
      separators: []
    });
  });

  // Test 7: line_Parse_Into_Columns should ignore separators inside strings
  it('should ignore separators inside strings', () => {
    const separators2 = ['=', '=>'];

    // Разделитель внутри одинарных кавычек не должен обрабатываться
    const result4 = line_Parse_Into_Columns("key = 'value with = sign'", separators2 as any);
    expect(result4).to.deep.equal({
      columns: ['key ', " 'value with = sign'"],
      separators: ['=']
    });

    // Разделитель внутри двойных кавычек не должен обрабатываться
    const result5 = line_Parse_Into_Columns('key = "value with = sign"', separators2 as any);
    expect(result5).to.deep.equal({
      columns: ['key ', ' "value with = sign"'],
      separators: ['=']
    });

    // Разделитель внутри обратных кавычек не должен обрабатываться
    const result6 = line_Parse_Into_Columns('key = `value with = sign`', separators2 as any);
    expect(result6).to.deep.equal({
      columns: ['key ', ' `value with = sign`'],
      separators: ['=']
    });
  });

  // Test 8: line_Parse_Into_Columns should ignore separators inside comments
  it('should ignore separators inside comments', () => {
    const separators2 = ['=', '=>'];

    // Однострочный комментарий
    const result7 = line_Parse_Into_Columns('key = value // comment with = sign', separators2 as any);
    expect(result7).to.deep.equal({
      columns: ['key ', ' value // comment with = sign'],
      separators: ['=']
    });

    // Блочный комментарий
    const result8 = line_Parse_Into_Columns('key = value /* comment with = sign */ end', separators2 as any);
    expect(result8).to.deep.equal({
      columns: ['key ', ' value /* comment with = sign */ end'],
      separators: ['=']
    });
  });

  // Test 9: column_Width_Calculate should calculate width correctly
  it('should calculate width correctly', () => {
    expect(column_Width_Calculate('hello')).to.equal(5);
    expect(column_Width_Calculate('')).to.equal(0);
    expect(column_Width_Calculate('  spaced  ')).to.equal(10);
    // Проверка с юникодом
    expect(column_Width_Calculate('héllo')).to.equal(5); // 5 символов
  });

  // Test 10: column_Pad_Right should pad columns correctly
  it('should pad columns correctly', () => {
    expect(column_Pad_Right('hi', 5)).to.equal('hi   ');
    expect(column_Pad_Right('hello', 5)).to.equal('hello');
    expect(column_Pad_Right('test', 10)).to.equal('test      ');
    expect(column_Pad_Right('', 3)).to.equal('   ');
  });
});