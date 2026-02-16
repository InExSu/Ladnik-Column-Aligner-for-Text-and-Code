  // Типы и брендированные типы для Ladnik Column Aligner

  // Брендированные типы для гарантии валидности
export type Separator  = string & { __brand: 'separator' };
export type Padding    = number & { __brand: 'padding' };
export type FilePath   = string & { __brand: 'filePath' };
export type LanguageId = string & { __brand: 'languageId' };

  // Конфигурация выравнивания
export interface Config_Aligner {
  separators     : Separator[];
  padding        : Padding;
  alignComments  : boolean;
  ignorePrefix   : string[];
  languages      : string[];
  minimalSpacing?: boolean;      // Новый параметр для минимального добавления пробелов
}

  // Результат парсинга строки
export interface Parse_Result {
  columns   : string[];
  separators: Separator[];
}

  // Результат выполнения операции
export type Result_Success<T> = { success: true; value: T };
export type Result_Error      = { success: false; error: string };
export type Result<T>         = Result_Success<T> | Result_Error;

  // Состояния машины
export type State_Machine = 'idle' | 'parsing' | 'aligning' | 'done';