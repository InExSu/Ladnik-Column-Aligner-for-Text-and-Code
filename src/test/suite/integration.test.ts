import { expect } from 'chai';
import { lines_Align } from '../../aligner/aligner';
import { config_Validate } from '../../aligner/aligner';

describe('Integration Tests', () => {
  // Test 1: should align simple key-value pairs correctly
  it('should align simple key-value pairs correctly', () => {
    const config_Obj1 = {
      separators: ['='] as any,
      padding: 2 as any,
      alignComments: true,
      ignorePrefix: ['//', '#', ';'],
      languages: []
    };

    const validation_Result1 = config_Validate(config_Obj1);
    expect(validation_Result1.success).to.be.true;

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

      // Проверим, что выравнивание работает (знаки = находятся на одной позиции)
      const pos1 = aligned1[0].indexOf('=');
      const pos2 = aligned1[1].indexOf('=');
      const pos3 = aligned1[2].indexOf('=');
      expect(pos1).to.equal(pos2);
      expect(pos2).to.equal(pos3);

      // Также проверим, что результат соответствует ожидаемому
      expect(aligned1[0]).to.equal(expected1[0]);
      expect(aligned1[1]).to.equal(expected1[1]);
      expect(aligned1[2]).to.equal(expected1[2]);
    }
  });

  // Test 2: should handle multiple separators with priority
  it('should handle multiple separators with priority', () => {
    const config_Obj2 = {
      separators: ['=>', '=', ':'] as any,
      padding: 1 as any,
      alignComments: true,
      ignorePrefix: ['//', '#', ';'],
      languages: []
    };

    const validation_Result2 = config_Validate(config_Obj2);
    expect(validation_Result2.success).to.be.true;

    if (validation_Result2.success) {
      const config2 = validation_Result2.value;
      const lines2 = [
        'key1 = value1',
        'func => result',
        'name: John',
        'another_key => another_result'
      ];

      const aligned2 = lines_Align(config2, lines2);

      // Проверим, что => имеет приоритет над =
      expect(aligned2[1]).to.include('=>');
      // Проверим, что : работает отдельно от =
      expect(aligned2[2]).to.include(':');
    }
  });

  // Test 3: should preserve empty lines and non-matching lines
  it('should preserve empty lines and non-matching lines', () => {
    const config_Obj3 = {
      separators: ['='] as any,
      padding: 2 as any,
      alignComments: true,
      ignorePrefix: ['//', '#', ';'],
      languages: []
    };

    const validation_Result3 = config_Validate(config_Obj3);
    expect(validation_Result3.success).to.be.true;

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

      const aligned3 = lines_Align(config3, lines3);

      // Проверим, что пустые строки сохранились
      expect(aligned3[1]).to.equal('');
      expect(aligned3[4]).to.equal('');

      // Проверим, что строки без разделителей не изменились
      expect(aligned3[2]).to.equal('just text without separator');

      // Проверим, что комментарии не выравниваются (если настроено)
      expect(aligned3[5]).to.equal('// comment = not aligned');
    }
  });
});