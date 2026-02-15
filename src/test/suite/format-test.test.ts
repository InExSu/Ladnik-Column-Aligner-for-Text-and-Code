import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { lines_Align } from '../../aligner/aligner';
import { config_Validate } from '../../aligner/aligner';

describe('File Formatting Test', () => {
  it('should properly format content from file input', () => {
    // Читаем содержимое файла test.txt
    const inputFile = path.join(__dirname, '..', '..', '..', 'src', 'test', 'suite', 'test.txt');
    const outputFile = path.join(__dirname, '..', '..', '..', 'src', 'test', 'suite', 'test_Ladnik.txt');

    // Удаляем выходной файл, если он существует
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }

    const content = fs.readFileSync(inputFile, 'utf-8');
    
    // Разбиваем на строки
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Создаем конфигурацию для выравнивания
    const config_Obj = {
      separators: [':'] as any,
      padding: 1 as any,
      alignComments: true,
      ignorePrefix: ['//', '#', ';'],
      languages: [],
      minimalSpacing: false // Включаем минимальное добавление пробелов
    };

    const validation_Result = config_Validate(config_Obj);

    if (validation_Result.success) {
      const config = validation_Result.value;

      // Применяем выравнивание
      const aligned_Lines = lines_Align(config, lines);

      // Сохраняем результат в новый файл
      const output_Content = aligned_Lines.join('\n');
      fs.writeFileSync(outputFile, output_Content);

      // Проверяем, что выходной файл был создан
      expect(fs.existsSync(outputFile)).to.be.true;

      // Проверяем, что количество строк совпадает
      expect(aligned_Lines.length).to.equal(lines.length);

      // Проверяем, что хотя бы одна строка была изменена (поскольку это тест форматирования)
      expect(aligned_Lines.some((line, index) => line !== lines[index])).to.be.true;
    } else {
      throw new Error('Configuration validation failed: ' + validation_Result.error);
    }
  });
});