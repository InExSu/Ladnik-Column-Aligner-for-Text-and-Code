import { expect } from 'chai';
import { lines_Align } from '../../aligner/aligner';
import { config_Validate } from '../../aligner/aligner';

describe('Advanced Alignment Tests', () => {
  // Test 1: should align lines with excessive whitespace correctly
  it('should align lines with excessive whitespace correctly', () => {
    const config_Obj = {
      separators: ['='] as any,
      padding: 1 as any,
      alignComments: true,
      ignorePrefix: ['//', '#', ';'],
      languages: []
    };

    const validation_Result = config_Validate(config_Obj);
    expect(validation_Result.success).to.be.true;

    if (validation_Result.success) {
      const config = validation_Result.value;
      const input_Lines = [
        'const user  =     {name:       "John"     ,       age :       25  ,    email:    "john@example.com"};',
        'const config =       {host:      "localhost",       port:       3000,       debug:       true                ,       ssl:       false};'
      ];

      const aligned = lines_Align(config, input_Lines);

      // Проверяем, что результат содержит ожидаемые элементы и выравнивание работает
      expect(aligned.length).to.equal(2);
      expect(aligned[0]).to.satisfy((str: string) => str.startsWith('const user'));
      expect(aligned[1]).to.satisfy((str: string) => str.startsWith('const config'));

      // Проверяем, что знаки = находятся примерно на одной позиции
      const firstEqualsPos = aligned[0].indexOf('=');
      const secondEqualsPos = aligned[1].indexOf('=');
      expect(firstEqualsPos).to.equal(secondEqualsPos);
    }
  });

  // Test 2: should preserve internal spacing within values
  it('should preserve internal spacing within values', () => {
    const config_Obj2 = {
      separators: [':'] as any,
      padding: 1 as any,
      alignComments: true,
      ignorePrefix: ['//', '#', ';'],
      languages: []
    };

    const validation_Result2 = config_Validate(config_Obj2);
    expect(validation_Result2.success).to.be.true;

    if (validation_Result2.success) {
      const config2 = validation_Result2.value;
      const input_Lines2 = [
        'key1    :    value1'   ,
        'key22: value2' ,
        'key3  :  value3'
      ];

      const aligned2 = lines_Align(config2, input_Lines2);

      // Проверяем, что результат содержит ожидаемые элементы и выравнивание работает
      expect(aligned2.length).to.equal(3);
      expect(aligned2[0]).to.include('key1');
      expect(aligned2[1]).to.include('key22');
      expect(aligned2[2]).to.include('key3');

      // Проверяем, что знаки : находятся примерно на одной позиции
      const firstColonPos = aligned2[0].indexOf(':');
      const secondColonPos = aligned2[1].indexOf(':');
      const thirdColonPos = aligned2[2].indexOf(':');
      expect(firstColonPos).to.equal(secondColonPos);
      expect(secondColonPos).to.equal(thirdColonPos);
    }
  });
});
