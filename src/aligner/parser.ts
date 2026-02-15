import { Separator, Parse_Result } from './types';

/**
 * Проверяет, является ли строка пустой
 */
export function line_Is_Empty(line: string): boolean {
  return line.trim().length === 0;
}

/**
 * Проверяет, начинается ли строка с игнорируемого префикса
 */
export function line_Starts_With_Ignore_Prefix(line: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => line.startsWith(prefix));
}

/**
 * Проверяет, является ли строка допустимой для выравнивания
 */
export function line_Is_Valid_For_Alignment(line: string, prefixes: string[]): boolean {
  return !line_Is_Empty(line) && !line_Starts_With_Ignore_Prefix(line, prefixes);
}

/**
 * Сортировка разделителей по длине в порядке убывания (приоритет длинным)
 */
export function separators_Sort_By_Length_Desc(separators: Separator[]): Separator[] {
  return [...separators].sort((a, b) => b.length - a.length);
}

/**
 * Поиск самого длинного разделителя в строке
 */
export function separator_Find_Longest_First(line: string, separators: Separator[]): Separator | null {
  const sorted_Separators = separators_Sort_By_Length_Desc(separators);
  
  for (const sep of sorted_Separators) {
    if (line.includes(sep)) {
      return sep;
    }
  }
  
  return null;
}


/**
 * Вычисление ширины колонки (учитывая пробелы в начале и конце)
 */
export function column_Width_Calculate(column: string): number {
  // Для корректной работы с Unicode символами
  return [...column].length;
}

/**
 * Парсинг строки на колонки и разделители, учитывая строковые литералы и комментарии.
 */
export function line_Parse_Into_Columns(line: string, separators: Separator[]): Parse_Result {
  if (line_Is_Empty(line)) {
    return { columns: [line], separators: [] };
  }

  const sorted_Separators = separators_Sort_By_Length_Desc(separators);
  const valid_Separator_Occurrences: Array<{ separator: Separator; index: number }> = [];

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inMultiLineComment = false;
  let inSingleLineComment = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1]; // Для проверки многосимвольных токенов

    // Обнаружение и выход из однострочного комментария
    if (inSingleLineComment) {
      if (char === '\n') { // Или конец строки
        inSingleLineComment = false;
      }
      continue;
    }

    // Обнаружение начала/конца многострочного комментария
    if (char === '/' && nextChar === '*') {
      inMultiLineComment = true;
      i++; // Пропускаем следующий символ '*'
      continue;
    }
    if (char === '*' && nextChar === '/') {
      inMultiLineComment = false;
      i++; // Пропускаем следующий символ '/'
      continue;
    }
    if (inMultiLineComment) {
      continue;
    }

    // Обнаружение начала однострочного комментария
    if (char === '/' && nextChar === '/') {
      inSingleLineComment = true;
      i++; // Пропускаем следующий символ '/'
      continue;
    }
    
    // Обнаружение строковых литералов
    if (char === "'") {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (char === '"') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (char === '`') {
      inBacktick = !inBacktick;
      continue;
    }

    // Если находимся внутри строкового литерала, пропускаем проверку разделителей
    if (inSingleQuote || inDoubleQuote || inBacktick) {
      continue;
    }

    // Поиск разделителей вне строковых литералов и комментариев
    for (const sep of sorted_Separators) {
      // Проверяем, начинается ли строка с текущего индекса с разделителя
      if (line.substring(i, i + sep.length) === sep) {
        // Убедимся, что это не часть уже найденного, более длинного разделителя
        // или перекрытие
        let is_Overlapping = false;
        for (const existing_Sep of valid_Separator_Occurrences) {
          if (
            (i >= existing_Sep.index && i < existing_Sep.index + existing_Sep.separator.length) ||
            (existing_Sep.index >= i && existing_Sep.index < i + sep.length)
          ) {
            is_Overlapping = true;
            break;
          }
        }

        if (!is_Overlapping) {
          valid_Separator_Occurrences.push({ separator: sep, index: i });
          i += sep.length - 1; // Перемещаем индекс после найденного разделителя
          break; // Нашли разделитель, переходим к следующему символу
        }
      }
    }
  }

  // Отсортируем найденные валидные разделители по индексу
  valid_Separator_Occurrences.sort((a, b) => a.index - b.index);

  const columns: string[] = [];
  const found_Separators: Separator[] = [];
  let lastIndex = 0;

  for (const match of valid_Separator_Occurrences) {
    columns.push(line.substring(lastIndex, match.index));
    found_Separators.push(match.separator);
    lastIndex = match.index + match.separator.length;
  }

  if (lastIndex < line.length) {
    columns.push(line.substring(lastIndex));
  } else if (columns.length === 0 && line.length > 0) {
    // Если разделителей не найдено, вся строка является одной колонкой
    columns.push(line);
  }

  return { columns, separators: found_Separators };
}


/**
 * Добавление пробелов справа для выравнивания
 */
export function column_Pad_Right(column: string, target_Width: number): string {
  const current_Width = column_Width_Calculate(column);
  const padding_Needed = Math.max(0, target_Width - current_Width);
  return column + ' '.repeat(padding_Needed);
}