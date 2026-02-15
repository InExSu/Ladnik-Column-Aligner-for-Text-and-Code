import { expect } from 'chai';
import { columns_Widths_Calculate, parsed_Line_Align, lines_Reconstruct_With_Empties, lines_Align } from '../../aligner/aligner';
import { Parse_Result } from '../../aligner/types';

describe('Aligner Functions', () => {
  // Test 1: columns_Widths_Calculate should calculate max widths correctly
  it('should calculate max widths correctly', () => {
    const parsed_Lines: Parse_Result[] = [
      { columns: ['short', 'medium text', 'a'], separators: [':' as any, ':' as any] },
      { columns: ['longer text', 'tiny', 'quite long text'], separators: [':' as any, ':' as any] },
      { columns: ['mid', 'mid', 'mid'], separators: [':' as any, ':' as any] }
    ];

    const widths = columns_Widths_Calculate(parsed_Lines);
    // ['longer text', 'medium text', 'quite long text'] -> [11, 11, 14]
    expect(widths).to.deep.equal([11, 11, 15]);
  });

  // Test 2: parsed_Line_Align should align a single line
  it('should align a single line', () => {
    const parsed: Parse_Result = {
      columns: ['key', ' value'],
      separators: ['=' as any]
    };

    const aligned = parsed_Line_Align(parsed, [10, 10], 2);
    // 'key' (width 3) padded to 10 = 'key       '
    // ' value' (width 6) padded to 10 = ' value    '
    // Combined with separator and padding: 'key       =  value    '
    expect(aligned).to.equal('key       =  value');
  });

  // Test 3: lines_Reconstruct_With_Empties should restore empty lines
  it('should restore empty lines', () => {
    const original_Lines = ['first', '', 'third', '', 'fifth'];
    const aligned_Lines = ['first_aligned', 'third_aligned', 'fifth_aligned'];
    const empty_Line_Indices = [1, 3];

    const reconstructed = lines_Reconstruct_With_Empties(original_Lines, aligned_Lines, empty_Line_Indices);
    expect(reconstructed).to.deep.equal(['first_aligned', '', 'third_aligned', '', 'fifth_aligned']);
  });

  // Test 4: lines_Align should align simple key-value pairs
  it('should align simple key-value pairs', () => {
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

    expect(aligned2[0]).to.equal(expected2[0]);
    expect(aligned2[1]).to.equal(expected2[1]);
    expect(aligned2[2]).to.equal(expected2[2]);
  });
});