import { Config_Aligner, Parse_Result, Result } from './types';
import { line_Is_Empty, line_Is_Valid_For_Alignment, column_Width_Calculate, column_Pad_Right } from './parser';

/**
 * Вычисление максимальных ширин для каждой колонки
 */
export function columns_Widths_Calculate(parsed_Lines: Parse_Result[]): number[] {
  if (parsed_Lines.length === 0) {
    return [];
  }

  // Найдем максимальное количество колонок среди всех строк
  const max_Columns_Count = Math.max(...parsed_Lines.map(parsed => parsed.columns.length));

  // Создадим массив для хранения максимальной ширины каждой колонки
  const max_Widths: number[] = new Array(max_Columns_Count).fill(0);

  // Для каждой колонки найдем максимальную ширину среди всех строк
  for (let col_Index = 0; col_Index < max_Columns_Count; col_Index++) {
    for (const parsed of parsed_Lines) {
      if (col_Index < parsed.columns.length) {
        const width = column_Width_Calculate(parsed.columns[col_Index]);
        if (width > max_Widths[col_Index]) {
          max_Widths[col_Index] = width;
        }
      }
    }
  }

  return max_Widths;
}


/**
 * Выравнивание одной строки по заданным ширинам колонок
 */
export function parsed_Line_Align(parsed: Parse_Result, max_Widths: number[], padding: number): string {
  if (parsed.columns.length === 0) {
    return '';
  }

  const aligned_Parts: string[] = []; // Use parts to represent segments being joined

  for (let i = 0; i < parsed.columns.length; i++) {
    const isLastColumn = (i === parsed.columns.length - 1);

    let processed_Column: string;
    if (i < max_Widths.length) {
      if (isLastColumn) {
        processed_Column = parsed.columns[i].trimEnd(); // Trim last column
      } else {
        processed_Column = column_Pad_Right(parsed.columns[i], max_Widths[i]);
      }
      aligned_Parts.push(processed_Column);

      // Add separator and padding only if it's not the very last column
      if (i < parsed.separators.length && !isLastColumn) { // Ensure separator is not added after the very last column
        const separator = parsed.separators[i];
        aligned_Parts.push(separator + ' '.repeat(Math.max(0, padding - 1)));
      }
    } else {
      // If column is beyond max_Widths (not aligned), just add it.
      // And trim if it's the last column.
      if (isLastColumn) {
        processed_Column = parsed.columns[i].trimEnd();
      } else {
        processed_Column = parsed.columns[i];
      }
      aligned_Parts.push(processed_Column);

      // Add separator if applicable (though this branch is usually for the last column if it exists)
      if (i < parsed.separators.length && !isLastColumn) { // Ensure separator is not added after the very last column
        aligned_Parts.push(parsed.separators[i]);
      }
    }
  }

  return aligned_Parts.join('');
}

/**
 * Восстановление исходной структуры с пустыми строками
 */
export function lines_Reconstruct_With_Empties(
  original_Lines: string[],
  aligned_Lines: string[],
  empty_Line_Indices: number[]
): string[] {
  const result: string[] = [...original_Lines];
  let aligned_Index = 0;

  for (let i = 0; i < result.length; i++) {
    if (!empty_Line_Indices.includes(i)) {
      if (aligned_Index < aligned_Lines.length) {
        result[i] = aligned_Lines[aligned_Index];
        aligned_Index++;
      }
    }
  }

  return result;
}

/**
 * Основная функция выравнивания строк
 */
export function lines_Align(config: Config_Aligner, lines: string[]): string[] {
  // Используем улучшенную версию с нормализацией пробелов
  return lines_Align_Improved(config, lines);
}

/**
 * Парсинг строки на колонки и разделители с сохранением информации о пробелах
 */
function line_Parse_Into_Columns_With_Whitespace_Preservation(line: string, separators: string[]): Parse_Result {
  if (line_Is_Empty(line)) {
    return { columns: [line], separators: [] };
  }

  // Сортировка разделителей по длине в порядке убывания (приоритет длинным)
  const sorted_Separators = separators.sort((a, b) => b.length - a.length);
  
  // Найдем все вхождения разделителей в строке
  const matches: Array<{ separator: string; index: number }> = [];
  
  // Состояния парсера
  let in_Single_Quote = false;
  let in_Double_Quote = false;
  let in_Backtick_Quote = false;
  let in_Block_Comment = false;
  let in_Line_Comment = false;
  let escaped = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next_Char = i < line.length - 1 ? line[i + 1] : '';
    
    // Обработка экранирования
    if (char === '\\' && !escaped) {
      escaped = true;
      continue;
    }
    
    // Проверка на начало/конец однострочного комментария
    if (!in_Single_Quote && !in_Double_Quote && !in_Backtick_Quote && !in_Block_Comment && !escaped) {
      if (char === '/' && next_Char === '/') {
        in_Line_Comment = true;
        i++; // пропускаем следующий символ
        continue;
      }
      
      // Проверка на начало/конец блочного комментария
      if (char === '/' && next_Char === '*') {
        in_Block_Comment = true;
        i++; // пропускаем следующий символ
        continue;
      }
      
      if (char === '*' && next_Char === '/') {
        in_Block_Comment = false;
        i++; // пропускаем следующий символ
        continue;
      }
    }
    
    // Если мы в комментарии, пропускаем проверку разделителей
    if (in_Line_Comment || in_Block_Comment) {
      escaped = false;
      continue;
    }
    
    // Проверка на начало/конец строк
    if (!escaped) {
      if (char === "'" && !in_Double_Quote && !in_Backtick_Quote) {
        in_Single_Quote = !in_Single_Quote;
      } else if (char === '"' && !in_Single_Quote && !in_Backtick_Quote) {
        in_Double_Quote = !in_Double_Quote;
      } else if (char === '`' && !in_Single_Quote && !in_Double_Quote) {
        in_Backtick_Quote = !in_Backtick_Quote;
      }
    }
    
    // Проверяем разделители только вне строк
    if (!in_Single_Quote && !in_Double_Quote && !in_Backtick_Quote && !escaped) {
      for (const sep of sorted_Separators) {
        if (line.substr(i, sep.length) === sep) {
          // Проверим, не является ли это совпадение частью другого разделителя
          let is_Part_Of_Longer_Separator = false;
          
          for (const other_Sep of sorted_Separators) {
            if (other_Sep.length <= sep.length) continue;
            
            // Проверим, не является ли найденный разделитель частью более длинного
            const other_Match_Index = line.indexOf(other_Sep, Math.max(0, i - other_Sep.length + 1));
            if (other_Match_Index !== -1 && other_Match_Index <= i && other_Match_Index + other_Sep.length > i) {
              is_Part_Of_Longer_Separator = true;
              break;
            }
          }
          
          if (!is_Part_Of_Longer_Separator) {
            matches.push({ separator: sep, index: i });
            i += sep.length - 1; // пропускаем символы разделителя
            break; // выходим из внутреннего цикла
          }
        }
      }
    }
    
    escaped = false;
  }
  
  // Отсортируем совпадения по индексу в строке
  matches.sort((a, b) => a.index - b.index);
  
  // Разобьем строку на колонки и разделители
  const columns: string[] = [];
  const found_Separators: string[] = [];
  
  let lastIndex = 0;
  
  for (const match of matches) {
    // Добавим часть строки до разделителя как колонку
    const segment = line.substring(lastIndex, match.index);
    columns.push(segment);
    
    // Добавим сам разделитель
    found_Separators.push(match.separator);
    
    // Обновим последний индекс
    lastIndex = match.index + match.separator.length;
  }
  
  // Добавим оставшуюся часть строки как последнюю колонку
  if (lastIndex < line.length) {
    columns.push(line.substring(lastIndex));
  }
  
  return { columns, separators: found_Separators as any };
}


/**
 * Улучшенная функция выравнивания строк с учетом позиций разделителей
 */
export function lines_Align_Improved(config: Config_Aligner, lines: string[]): string[] {
  // Если включена опция минимального расстояния, используем специальную реализацию
  if (config.minimalSpacing) {
    return lines_Align_Minimal_Spacing(config, lines);
  }
  
  // 1. Сохраняем индексы пустых строк для восстановления структуры
  const empty_Line_Indices = lines
    .map((line, index) => (line_Is_Empty(line) ? index : -1))
    .filter(index => index !== -1);

  // 2. Фильтруем валидные строки (не пустые, не игнорируемые)
  const valid_Lines = lines.filter(line =>
    line_Is_Valid_For_Alignment(line, config.ignorePrefix)
  );

  // 3. Парсим каждую строку на колонки и разделители
  const parsed_Lines = valid_Lines.map(line =>
    line_Parse_Into_Columns_With_Whitespace_Preservation(line, config.separators as any)
  );

  // 4. Находим максимальную ширину для каждой колонки
  const max_Widths = columns_Widths_Calculate(parsed_Lines);

  // 5. Выравниваем каждую строку по максимальным ширинам
  const aligned_Lines = parsed_Lines.map(parsed =>
    parsed_Line_Align(parsed, max_Widths, config.padding)
  );

  // 6. Восстанавливаем исходную структуру (вставляем пустые строки)
  return lines_Reconstruct_With_Empties(lines, aligned_Lines, empty_Line_Indices);
}


/**
 * Нормализует пробелы в колонке, учитывая внутреннюю структуру
 */
function normalize_Column_Spacing(text: string): string { // eslint-disable-line no-unused-vars
  // Replace sequences of whitespace with single space, but preserve structure
  // This is a simplified normalization - may need adjustment based on test expectations
  return text.replace(/\s+/g, ' ').trim();
}


  

/**
 * Упрощенная функция выравнивания строк с минимальным добавлением пробелов
 * Эта функция не выравнивает колонки по максимальной ширине, а просто нормализует пробелы
 */
export function lines_Align_Minimal_Spacing(config: Config_Aligner, lines: string[]): string[] {
  // 1. Сохраняем индексы пустых строк для восстановления структуры
  const empty_Line_Indices = lines
    .map((line, index) => (line_Is_Empty(line) ? index : -1))
    .filter(index => index !== -1);

  // 2. Фильтруем валидные строки (не пустые, не игнорируемые)
  const valid_Lines = lines.filter(line =>
    line_Is_Valid_For_Alignment(line, config.ignorePrefix)
  );

  // 3. Парсим каждую строку на колонки и разделители
  const parsed_Lines = valid_Lines.map(line =>
    line_Parse_Into_Columns_With_Whitespace_Preservation(line, config.separators as any)
  );

  // 4. Нормализуем пробелы и формируем результат без выравнивания по максимальной ширине
  const aligned_Lines = parsed_Lines.map(parsed => {
    const aligned_Parts: string[] = [];

    for (let i = 0; i < parsed.columns.length; i++) {
      const isLastColumn = (i === parsed.columns.length - 1);

      // Нормализуем пробелы в колонке
      const normalized_Column = normalize_Column_Spacing(parsed.columns[i]);
      aligned_Parts.push(normalized_Column);

      // Добавляем разделитель и отступы, если это не последняя колонка
      if (i < parsed.separators.length && !isLastColumn) {
        aligned_Parts.push(parsed.separators[i] + ' '.repeat(config.padding));
      }
    }

    return aligned_Parts.join('');
  });

  // 5. Восстанавливаем исходную структуру (вставляем пустые строки)
  return lines_Reconstruct_With_Empties(lines, aligned_Lines, empty_Line_Indices);
}

/**
 * Валидация конфигурации
 */
export function config_Validate(config: any): Result<Config_Aligner> {
  try {
    // Проверяем, что config - это объект
    if (typeof config !== 'object' || config === null) {
      return { success: false, error: 'Configuration must be an object' };
    }

    // Проверяем разделители
    if (!Array.isArray(config.separators)) {
      return { success: false, error: 'Separators must be an array' };
    }

    // Проверяем, что каждый разделитель - это непустая строка
    for (const sep of config.separators) {
      if (typeof sep !== 'string' || sep.trim().length === 0) {
        return { success: false, error: `Invalid separator: ${sep}` };
      }
    }

    // Проверяем padding
    if (typeof config.padding !== 'number' || config.padding < 0 || !Number.isInteger(config.padding)) {
      return { success: false, error: 'Padding must be a non-negative integer' };
    }

    // Проверяем alignComments
    if (typeof config.alignComments !== 'boolean') {
      return { success: false, error: 'AlignComments must be a boolean' };
    }

    // Проверяем ignorePrefix
    if (!Array.isArray(config.ignorePrefix)) {
      return { success: false, error: 'IgnorePrefix must be an array' };
    }

    // Проверяем, что каждый префикс - это строка
    for (const prefix of config.ignorePrefix) {
      if (typeof prefix !== 'string') {
        return { success: false, error: `Invalid ignore prefix: ${prefix}` };
      }
    }

    // Проверяем languages
    if (!Array.isArray(config.languages)) {
      return { success: false, error: 'Languages must be an array' };
    }

    // Проверяем, что каждый язык - это строка
    for (const lang of config.languages) {
      if (typeof lang !== 'string') {
        return { success: false, error: `Invalid language: ${lang}` };
      }
    }

    // Если все проверки пройдены, возвращаем валидную конфигурацию
    return {
      success: true,
      value: {
        separators: config.separators as any,
        padding: config.padding as any,
        alignComments: config.alignComments,
        ignorePrefix: config.ignorePrefix,
        languages: config.languages,
        minimalSpacing: config.minimalSpacing || false
      }
    };
  } catch (error) {
    return { success: false, error: `Validation error: ${error instanceof Error ? error.message : String(error)}` };
  }
}