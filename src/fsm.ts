/**
 * Машина состояний для форматирования текста в стиле шалыто
 */

/* eslint-disable no-unused-vars */

type State = 
  | 'TEXT'           // Обычный текст
  | 'WHITESPACE'     // Пробельные символы
  | 'WORD'           // Слово
  | 'PUNCTUATION'    // Пунктуация
  | 'SINGLE_QUOTE_STRING'  // Строка в одинарных кавычках
  | 'DOUBLE_QUOTE_STRING'  // Строка в двойных кавычках
  | 'BACKTICK_STRING'      // Строка в обратных кавычках
  | 'LINE_COMMENT'         // Однострочный комментарий
  | 'BLOCK_COMMENT_START'  // Начало блочного комментария
  | 'BLOCK_COMMENT'        // Блочный комментарий
  | 'ESCAPE_SEQUENCE'      // Экранированная последовательность
  | 'END';                 // Конец

type TokenType = 
  | 'TEXT'
  | 'WHITESPACE'
  | 'WORD'
  | 'PUNCTUATION'
  | 'STRING'
  | 'COMMENT'
  | 'ESCAPE';

interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

class ShalatoFormatterFSM {
  private state: State = 'TEXT';
  private position: number = 0;
  private tokens: Token[] = [];
  private buffer: string = '';
  private start: number = 0;
  private inSingleQuoteString: boolean = false;
  private inDoubleQuoteString: boolean = false;
  private inBacktickString: boolean = false;
  private inLineComment: boolean = false;
  private inBlockComment: boolean = false;
  private escaped: boolean = false;

  input: string;
  
  constructor(input: string) {
    this.input = input;
  }

  /**
   * Запуск машины состояний
   */
  public run(): Token[] {
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      this.processCharacter(char);
      this.position++;
    }

    // Обработка последнего токена
    this.finalizeToken();

    return this.tokens;
  }

  /**
   * Обработка текущего символа в зависимости от состояния
   */
  private processCharacter(char: string): void {
    switch (this.state) {
      case 'TEXT':
        this.handleTextState(char);
        break;
      case 'WHITESPACE':
        this.handleWhitespaceState(char);
        break;
      case 'WORD':
        this.handleWordState(char);
        break;
      case 'PUNCTUATION':
        this.handlePunctuationState(char);
        break;
      case 'SINGLE_QUOTE_STRING':
        this.handleSingleQuoteStringState(char);
        break;
      case 'DOUBLE_QUOTE_STRING':
        this.handleDoubleQuoteStringState(char);
        break;
      case 'BACKTICK_STRING':
        this.handleBacktickStringState(char);
        break;
      case 'LINE_COMMENT':
        this.handleLineCommentState(char);
        break;
      case 'BLOCK_COMMENT_START':
        this.handleBlockCommentStartState(char);
        break;
      case 'BLOCK_COMMENT':
        this.handleBlockCommentState(char);
        break;
      case 'ESCAPE_SEQUENCE':
        this.handleEscapeSequenceState(char);
        break;
    }
  }

  /**
   * Обработка состояния текста
   */
  private handleTextState(char: string): void {
    if (/\s/.test(char)) {
      // Начало пробельной последовательности
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'WHITESPACE';
    } else if (/[a-zA-Zа-яА-ЯёЁ_]/.test(char)) {
      // Начало слова
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'WORD';
    } else if (char === "'") {
      // Начало строки в одинарных кавычках
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'SINGLE_QUOTE_STRING';
      this.inSingleQuoteString = true;
    } else if (char === '"') {
      // Начало строки в двойных кавычках
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'DOUBLE_QUOTE_STRING';
      this.inDoubleQuoteString = true;
    } else if (char === '`') {
      // Начало строки в обратных кавычках
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'BACKTICK_STRING';
      this.inBacktickString = true;
    } else if (char === '/' && this.position + 1 < this.input.length && this.input[this.position + 1] === '/') {
      // Начало однострочного комментария
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'LINE_COMMENT';
      this.inLineComment = true;
    } else if (char === '/' && this.position + 1 < this.input.length && this.input[this.position + 1] === '*') {
      // Начало блочного комментария
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'BLOCK_COMMENT_START';
      this.inBlockComment = true;
    } else if (char === '\\') {
      // Начало экранированной последовательности
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'ESCAPE_SEQUENCE';
      this.escaped = true;
    } else {
      // Пунктуация
      this.finalizeToken();
      this.start = this.position;
      this.buffer = char;
      this.state = 'PUNCTUATION';
    }
  }

  /**
   * Обработка состояния пробелов
   */
  private handleWhitespaceState(char: string): void {
    if (/\s/.test(char)) {
      // Продолжение пробельной последовательности
      this.buffer += char;
    } else {
      // Конец пробельной последовательности
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'TEXT';
      this.processCharacter(char);
    }
  }

  /**
   * Обработка состояния слова
   */
  private handleWordState(char: string): void {
    if (/[a-zA-Zа-яА-ЯёЁ0-9_]/.test(char)) {
      // Продолжение слова
      this.buffer += char;
    } else {
      // Конец слова
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'TEXT';
      this.processCharacter(char);
    }
  }

  /**
   * Обработка состояния пунктуации
   */
  private handlePunctuationState(char: string): void {
    if (/\s/.test(char)) {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'WHITESPACE';
      this.processCharacter(char);
    } else if (/[a-zA-Zа-яА-ЯёЁ0-9_]/.test(char)) {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'WORD';
      this.processCharacter(char);
    } else if (char === "'") {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'SINGLE_QUOTE_STRING';
      this.inSingleQuoteString = true;
      this.processCharacter(char);
    } else if (char === '"') {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'DOUBLE_QUOTE_STRING';
      this.inDoubleQuoteString = true;
      this.processCharacter(char);
    } else if (char === '`') {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'BACKTICK_STRING';
      this.inBacktickString = true;
      this.processCharacter(char);
    } else if (char === '/' && this.position + 1 < this.input.length && this.input[this.position + 1] === '/') {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'LINE_COMMENT';
      this.inLineComment = true;
      this.processCharacter(char);
    } else if (char === '/' && this.position + 1 < this.input.length && this.input[this.position + 1] === '*') {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'BLOCK_COMMENT_START';
      this.inBlockComment = true;
      this.processCharacter(char);
    } else if (char === '\\') {
      // Конец пунктуации
      this.finalizeToken();
      // Переход к новому состоянию
      this.state = 'ESCAPE_SEQUENCE';
      this.escaped = true;
      this.processCharacter(char);
    } else {
      // Продолжение пунктуации (если это логично)
      this.buffer += char;
    }
  }

  /**
   * Обработка состояния строки в одинарных кавычках
   */
  private handleSingleQuoteStringState(char: string): void {
    if (this.escaped) {
      // Предыдущий символ был экранированием
      this.buffer += char;
      this.escaped = false;
    } else if (char === "'") {
      // Конец строки в одинарных кавычках
      this.buffer += char;
      this.finalizeToken();
      this.state = 'TEXT';
      this.inSingleQuoteString = false;
    } else if (char === '\\') {
      // Начало экранированной последовательности
      this.buffer += char;
      this.escaped = true;
    } else {
      // Продолжение строки
      this.buffer += char;
    }
  }

  /**
   * Обработка состояния строки в двойных кавычках
   */
  private handleDoubleQuoteStringState(char: string): void {
    if (this.escaped) {
      // Предыдущий символ был экранированием
      this.buffer += char;
      this.escaped = false;
    } else if (char === '"') {
      // Конец строки в двойных кавычках
      this.buffer += char;
      this.finalizeToken();
      this.state = 'TEXT';
      this.inDoubleQuoteString = false;
    } else if (char === '\\') {
      // Начало экранированной последовательности
      this.buffer += char;
      this.escaped = true;
    } else {
      // Продолжение строки
      this.buffer += char;
    }
  }

  /**
   * Обработка состояния строки в обратных кавычках
   */
  private handleBacktickStringState(char: string): void {
    if (this.escaped) {
      // Предыдущий символ был экранированием
      this.buffer += char;
      this.escaped = false;
    } else if (char === '`') {
      // Конец строки в обратных кавычках
      this.buffer += char;
      this.finalizeToken();
      this.state = 'TEXT';
      this.inBacktickString = false;
    } else if (char === '\\') {
      // Начало экранированной последовательности
      this.buffer += char;
      this.escaped = true;
    } else {
      // Продолжение строки
      this.buffer += char;
    }
  }

  /**
   * Обработка состояния однострочного комментария
   */
  private handleLineCommentState(char: string): void {
    if (char === '\n' || char === '\r') {
      // Конец строки - конец комментария
      this.finalizeToken();
      this.state = 'TEXT';
      this.inLineComment = false;
      // Обработка символа окончания строки
      this.processCharacter(char);
    } else {
      // Продолжение комментария
      this.buffer += char;
    }
  }

  /**
   * Обработка состояния начала блочного комментария
   */
  private handleBlockCommentStartState(char: string): void {
    // Второй символ блочного комментария (*)
    this.buffer += char;
    this.state = 'BLOCK_COMMENT';
  }

  /**
   * Обработка состояния блочного комментария
   */
  private handleBlockCommentState(char: string): void {
    if (char === '*' && this.position + 1 < this.input.length && this.input[this.position + 1] === '/') {
      // Конец блочного комментария
      this.buffer += char;
      this.position++; // Пропустить следующий символ '/'
      this.buffer += '/';
      this.finalizeToken();
      this.state = 'TEXT';
      this.inBlockComment = false;
    } else {
      // Продолжение комментария
      this.buffer += char;
    }
  }

  /**
   * Обработка состояния экранированной последовательности
   */
  private handleEscapeSequenceState(char: string): void {
    // Добавить следующий символ как есть
    this.buffer += char;
    this.escaped = false;
    // Вернуться к предыдущему состоянию
    this.state = 'TEXT';
  }

  /**
   * Завершение текущего токена
   */
  private finalizeToken(): void {
    if (this.buffer) {
      let tokenType: TokenType;

      switch (this.state) {
        case 'WHITESPACE':
          tokenType = 'WHITESPACE';
          break;
        case 'WORD':
          tokenType = 'WORD';
          break;
        case 'PUNCTUATION':
          tokenType = 'PUNCTUATION';
          break;
        case 'SINGLE_QUOTE_STRING':
        case 'DOUBLE_QUOTE_STRING':
        case 'BACKTICK_STRING':
          tokenType = 'STRING';
          break;
        case 'LINE_COMMENT':
        case 'BLOCK_COMMENT_START':
        case 'BLOCK_COMMENT':
          tokenType = 'COMMENT';
          break;
        case 'ESCAPE_SEQUENCE':
          tokenType = 'ESCAPE';
          break;
        default:
          tokenType = 'TEXT';
      }

      this.tokens.push({
        type: tokenType,
        value: this.buffer,
        start: this.start,
        end: this.position
      });

      this.buffer = '';
    }
  }

  /**
   * Форматирование текста в стиле шалыто
   */
  public format(): string {
    const tokens = this.run();
    let result = '';

    for (const token of tokens) {
      switch (token.type) {
        case 'WHITESPACE':
          // Заменить последовательности пробелов на один пробел
          result += ' ';
          break;
        case 'WORD':
          // Добавить слово как есть
          result += token.value;
          break;
        case 'PUNCTUATION':
          // Добавить пунктуацию как есть
          result += token.value;
          break;
        case 'STRING':
          // Добавить строку как есть (сохранить пробелы внутри)
          result += token.value;
          break;
        case 'COMMENT':
          // Добавить комментарий как есть
          result += token.value;
          break;
        case 'ESCAPE':
          // Добавить экранирование как есть
          result += token.value;
          break;
        default:
          result += token.value;
      }
    }

    return result;
  }
}

// Экспорт класса
export { ShalatoFormatterFSM };

// Пример использования
if (require.main === module) {
  const text = `const user  =     {name:       "John"     ,       age :       25  ,    email:    "john@example.com"};`;
  const formatter = new ShalatoFormatterFSM(text);
  console.log('Исходный текст:', text);
  console.log('Форматированный текст:', formatter.format());
  console.log('Токены:', formatter.run());
}