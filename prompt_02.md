*Полный технический промпт без временных ограничений*                                
---                                                                                  

1. [Цель и философия](#цель-и-философия)                                             

2. [Основной функционал](#основной-функционал)                                       
3. [Алгоритм выравнивания](#алгоритм-выравнивания)                                   
4. [Требования к коду](#требования-к-коду)                                           
5. [Конфигурация](#конфигурация)                                                     
6. [Интеграция с VS Code](#интеграция-с-vs-code)                                     
7. [Примеры использования](#примеры-использования)                                   
8. [Acceptance Criteria](#acceptance-criteria)                                       
9. [Структура проекта](#структура-проекта)                                           
10. [План реализации](#план-реализации)                                              
---                                                                                  
**Что создаём**                                                                      :   Расширение VS Code для визуального выравнивания текста и кода по столбцам на основе разделителей.

**Философия**                                                                        :  

- ✨ Простота использования                                                           :   выделил → нажал → получил результат                                                              

- 🔒 Надёжность                                                                       :   никогда не ломает синтаксис кода                                                                 

- ⚡ Производительность                                                               :   мгновенный отклик даже на 10 000 строк                                                           
- 🧩 Модульность                                                                      :   каждая функция делает ровно одну вещь                                                            
**Для кого**                                                                         :   Разработчики                                                                                     ,   ценящие визуальную чистоту кода — от начинающих до архитекторов.
---                                                                                  
| Команда | Описание | Горячая клавиша |                                             

|---------|----------|-----------------|                                             

| `ladnik.alignSelection` | Выровнять выделенный текст | `Ctrl+Alt+L` / `Cmd+Alt+L` |

| `ladnik.alignFile` | Выровнять весь файл | — |                                     

| `ladnik.configure` | Открыть/создать конфигурацию | — |                            
- При выделении текста → обрабатывает только выделение                               
- Без выделения → обрабатывает весь файл                                             
- Пустые строки → сохраняются без изменений                                          
- Строки без разделителей → не изменяются                                            
- Отмена через `Ctrl+Z` → полностью восстанавливает исходный текст                   

---                                                                                  
```typescript                                                                        
/**                                                                                  
 * { lines — массив строк для обработки                                              ,   config — валидная конфигурация }                                                                 
 * { возвращает массив выровненных строк с сохранением исходной структуры }          
 */                                                                                  

function lines_Align(config                                                          :   Config_Aligner                                                                                   ,   lines                                                           :   string[])                                                                        :   string[] {                                                          

  // 1. Сохраняем индексы пустых строк для восстановления структуры                  

  const empty_Line_Indices                                                           =   lines.map((line                                                                                  ,   index)                                                          =>                                                                                    
    line_Is_Empty(line) ? index                                                      :   -1                                                                                               
  ).filter(index                                                                     =>   index !                                                                                          =                                                                   =   -1);                                                                             
  // 2. Фильтруем валидные строки (не пустые                                         ,   не игнорируемые)                                                                                 
  const valid_Lines                                                                  =   lines.filter(line                                                                                =>                                                                   
    line_Is_Valid_For_Alignment(line                                                 ,   config)                                                                                          
  );                                                                                 
  // 3. Парсим каждую строку на колонки и разделители                                
  const parsed_Lines                                                                 =   valid_Lines.map(line                                                                             =>                                                                   
    line_Parse_Into_Columns(line                                                     ,   config.separators)                                                                               
  );                                                                                 
  
  // 4. Находим максимальную ширину для каждой колонки                               
  const max_Widths                                                                   =   columns_Widths_Calculate(parsed_Lines);                                                          
  // 5. Выравниваем каждую строку по максимальным ширинам                            
  const aligned_Lines                                                                =   parsed_Lines.map(parsed                                                                          =>                                                                   
  
    parsed_Line_Align(parsed                                                         ,   max_Widths                                                                                       ,   config.padding)                                                 
  );                                                                                 
  // 6. Восстанавливаем исходную структуру (вставляем пустые строки)                 
  return lines_Reconstruct_With_Empties(lines                                        ,   aligned_Lines                                                                                    ,   empty_Line_Indices);                                            
  
}                                                                                    
```                                                                                  
  
- **Приоритет длинных разделителей**                                                 :   `                                                                                                =>  ` проверяется до `                                               =  `                                                                                 ,   `                                                                   ::  ` до `       :  `                    
- **Сохранение разделителей**                                                        :   оригинальный разделитель сохраняется в результате                                                
- **Разное количество колонок**                                                      :   выравнивание по максимальному количеству колонок в блоке                                         
- **Unicode-безопасность**                                                           :   корректная работа с многосимвольными символами (эмодзи                                           ,   CJK)                                                            
  
- **Табуляции**                                                                      :   заменяются на пробелы перед обработкой (с учётом настроек редактора)                             
---                                                                                  
```typescript                                                                        
type Separator                                                                       =   string & { __brand                                                                               :   'separator' };                                                  

type Padding                                                                         =   number & { __brand                                                                               :   'padding' };                                                    
type FilePath                                                                        =   string & { __brand                                                                               :   'filePath' };                                                   
function separator_Validate(value                                                    :   string)                                                                                          :   Separator | null {                                              
  return value.trim().length > 0 ? (value as Separator)                              :   null;                                                                                            
}                                                                                    
function padding_Validate(value                                                      :   number)                                                                                          :   Padding | null {                                                

  return value >                                                                     =   0 && Number.isInteger(value) ? (value as Padding)                                                :   null;                                                           

}                                                                                    

```                                                                                  
```typescript                                                                        
type Config_Aligner                                                                  =   { ... }                                                                                          
type Parse_Result                                                                    =   { columns                                                                                        :   string[]; separators                                            :   Separator[] }                                                                    
type State_Machine                                                                   =   'idle' | 'parsing' | 'aligning'                                                                  
function lines_Align(config                                                          :   Config_Aligner                                                                                   ,   lines                                                           :   string[])                                                                        :   string[]                                                            

function columns_Widths_Calculate(parsed_Lines                                       :   Parse_Result[])                                                                                  :   number[]                                                        
function separator_Find_Longest_First(line                                           :   string                                                                                           ,   separators                                                      :   Separator[])                                                                     :   Separator | null                                                    
const max_Widths                                                                     :   number[]                                                                                         =   []                                                              

const is_Valid                                                                       :   boolean                                                                                          =   true                                                            
const parsed_Lines                                                                   :   Parse_Result[]                                                                                   =   []                                                              
```                                                                                  
```typescript                                                                        

class Aligner { ... }                                                                
class ConfigLoader { ... }                                                           
type Config_Aligner                                                                  =   { separators                                                                                     :   Separator[]; padding                                            :   Padding }                                                                        
function config_Load(workspace_Root                                                  :   FilePath)                                                                                        :   Config_Aligner | Error_Result                                   
function lines_Align(config                                                          :   Config_Aligner                                                                                   ,   lines                                                           :   string[])                                                                        :   string[]                                                            
```                                                                                  

Каждая функция                                                                       :  
- Делает ровно одну логическую операцию                                              
- Содержит 3–15 строк кода                                                           
- Имеет название                                                                     ,   точно описывающее её назначение                                                                  

- Не имеет побочных эффектов                                                         
Примеры корректных функций                                                           :  
```typescript                                                                        
function line_Is_Empty(line                                                          :   string)                                                                                          :   boolean                                                         
function line_Starts_With_Ignore_Prefix(line                                         :   string                                                                                           ,   prefixes                                                        :   string[])                                                                        :   boolean                                                             

function separators_Sort_By_Length_Desc(separators                                   :   Separator[])                                                                                     :   Separator[]                                                     
function column_Width_Calculate(column                                               :   string)                                                                                          :   number                                                          
function column_Pad_Right(column                                                     :   string                                                                                           ,   target_Width                                                    :   number)                                                                          :   string                                                              
```                                                                                  
Обработка ошибок через монадические цепочки                                          :  

```typescript                                                                        
type Result_Success<T>                                                               =   { success                                                                                        :   true; value                                                     :   T }                                                                              
type Result_Error                                                                    =   { success                                                                                        :   false; error                                                    :   string }                                                                         
type Result<T>                                                                       =   Result_Success<T> | Result_Error                                                                 
function config_Load(path                                                            :   FilePath)                                                                                        :   Result<Config_Aligner> {                                        

  return file_Read(path)                                                             
    .map(content                                                                     =>   neon_Parse(content))                                                                             
    .map(config                                                                      =>   config_Validate(config))                                                                         
    .match(                                                                          
      success                                                                        =>   ({ success                                                                                       :   true                                                            ,   value                                                                            :   success })                                                          ,  
      error                                                                          =>   ({ success                                                                                       :   false                                                           ,   error                                                                            :   `Config error                                                       :   ${error}` })

    )                                                                                
}                                                                                    
```                                                                                  
Технология switch (профессор Шалыто)                                                 
Для сложных алгоритмов — явное выделение состояний и переходов через `switch`        :                                                                                                    
```typescript                                                                        
type State_Parse                                                                     =   'idle' | 'scanning' | 'aligning' | 'done';                                                       
function state_Process(state                                                         :   State_Parse                                                                                      ,   input                                                           :   any)                                                                             :   State_Parse {                                                       

    switch(state) {                                                                  
        case 'idle'                                                                  :   return input ? 'scanning'                                                                        :   'idle';                                                         
        case 'scanning'                                                              :   return separator_Found ? 'aligning'                                                              :   'scanning';                                                     
        case 'aligning'                                                              :   return all_Done ? 'done'                                                                         :   'aligning';                                                     
        case 'done'                                                                  :   return 'idle';                                                                                   
             default                                                                 :   return assertNever(state);                                                                       

    }                                                                                
}                                                                                    
```                                                                                  
---                                                                                  
```json                                                                              
{                                                                                    
  "align"                                                                            :   {                                                                                                
    "separators"                                                                     :   ["                                                                                               =>  "                                                                ,   "                                                                                ::  "                                                                    ,   "           =  "                    ,   ":  ",   "->  ",   ",  "]               ,  
    "padding"                                                                        :   2                                                                                                ,  
    "alignComments"                                                                  :   true                                                                                             ,  

    "ignorePrefix"                                                                   :   ["//"                                                                                            ,   "#"                                                             ,   ";"]                                                                             ,  

    "languages"                                                                      :   []                                                                                               

  }                                                                                  ,  
  "rules"                                                                            :   {                                                                                                

    ".php"                                                                           :   {                                                                                                
      "separators"                                                                   :   ["                                                                                               =>  "                                                                ,   "                                                                                ::  "                                                                    ,   "           ->  "]                   ,  
      "alignComments"                                                                :   false                                                                                            
    }                                                                                ,  
    ".js"                                                                            :   {                                                                                                
      "separators"                                                                   :   ["                                                                                               =  "                                                                ,   "                                                                                :  "]                                                                   ,  
      "padding"                                                                      :   1                                                                                                
    }                                                                                ,  
    ".py"                                                                            :   {                                                                                                
      "separators"                                                                   :   ["                                                                                               =  "]                                                               ,  
      "ignorePrefix"                                                                 :   ["#"]                                                                                            

    }                                                                                ,  

    ".css"                                                                           :   {                                                                                                
      "separators"                                                                   :   ["                                                                                               :  "]                                                               ,  
      "padding"                                                                      :   1                                                                                                ,  
      "ignorePrefix"                                                                 :   ["/*"                                                                                            ,   "*/"]                                                           
    }                                                                                
  }                                                                                  
}                                                                                    
```                                                                                  
1. Файл `.ladnikrc.json` в корне рабочей области                                     
2. Настройки пользователя через `settings.json` (`ladnik.defaultSeparators`          ,   `ladnik.defaultPadding`)                                                                         
3. Значения по умолчанию                                                             
```typescript                                                                        
const DEFAULT_CONFIG                                                                 :   Config_Aligner                                                                                   =   {                                                               
  separators                                                                         :   ['                                                                                               =>  '                                                                ,   '                                                                                ::  '                                                                    ,   '           =  '                    ,   ':  ',   '->  ',   ',  '] as Separator[],  
  padding                                                                            :   2 as Padding                                                                                     ,  
  alignComments                                                                      :   true                                                                                             ,  
  ignorePrefix                                                                       :   ['//'                                                                                            ,   '#'                                                             ,   ';']                                                                             ,  
  languages                                                                          :   []                                                                                               
};                                                                                   
```                                                                                  
---                                                                                  
```typescript                                                                        
vscode.commands.registerCommand('ladnik.alignSelection'                              ,   ()                                                                                               =>   {                                                               
  const editor                                                                       =   vscode.window.activeTextEditor;                                                                  
  if (!editor) return;                                                               
  const selection                                                                    =   editor.selection;                                                                                
  const text                                                                         =   editor.document.getText(selection);                                                              
  const lines                                                                        =   text.split('\n');                                                                                
  const config                                                                       =   config_Resolve_For_Document(editor.document);                                                    
  const result                                                                       =   lines_Align(config                                                                               ,   lines);                                                         
  editor.edit(editBuilder                                                            =>   {                                                                                                

    editBuilder.replace(selection                                                    ,   result.join('\n'));                                                                              
  });                                                                                
});                                                                                  
```                                                                                  

```typescript                                                                        
vscode.languages.registerDocumentFormattingEditProvider('*'                          ,   {                                                                                                
  provideDocumentFormattingEdits(document                                            :   vscode.TextDocument)                                                                             :   vscode.TextEdit[] {                                             
    const text                                                                       =   document.getText();                                                                              
    const lines                                                                      =   text.split('\n');                                                                                
    const config                                                                     =   config_Resolve_For_Document(document);                                                           
    const result                                                                     =   lines_Align(config                                                                               ,   lines);                                                         
    return [vscode.TextEdit.replace(                                                 
      new vscode.Range(                                                              
        document.positionAt(0)                                                       ,  

        document.positionAt(text.length)                                             

      )                                                                              ,  

      result.join('\n')                                                              
    )];                                                                              
  }                                                                                  
});                                                                                  
```                                                                                  
  
```json                                                                              
"menus"                                                                              :   {                                                                                                
  "editor/context"                                                                   :   [                                                                                                
  
    {                                                                                
      "command"                                                                      :   "ladnik.alignSelection"                                                                          ,  
  
      "group"                                                                        :   "navigation"                                                                                     ,  
      "when"                                                                         :   "editorHasSelection"                                                                             
    }                                                                                
  ]                                                                                  
}                                                                                    

```                                                                                  
---                                                                                  
```javascript                                                                        
const user                                                                           =   {name                                                                                            :   "John"                                                          ,   age                                                                              :   25                                                                  ,   email       :   "john@example.com"};
const config                                                                         =   {host                                                                                            :   "localhost"                                                     ,   port                                                                             :   3000                                                                ,   debug       :   true};              
const user                                                                           =   {name                                                                                            :   "John"                                                          ,   age                                                                              :   25                                                                  ,   email       :   "john@example.com"};
const config                                                                         =   {host                                                                                            :   "localhost"                                                     ,   port                                                                             :   3000                                                                ,   debug       :   true};              
```                                                                                  
    
```php                                                                               
return [                                                                             
  'host'                                                                             =>   'localhost'                                                                                      ,  
  'port'                                                                             =>   3306                                                                                             ,  
  'database'                                                                         =>   'app_db'                                                                                         ,  
  'username'                                                                         =>   'root'                                                                                           ,  
];                                                                                   
return [                                                                             
  'host'                                                                             =>   'localhost'                                                                                      ,  
  'port'                                                                             =>   3306                                                                                             ,  

  'database'                                                                         =>   'app_db'                                                                                         ,  
  'username'                                                                         =>   'root'                                                                                           ,  
];                                                                                   
```                                                                                  
```css                                                                               
/* Было                                                                              :   */                                                                                               
.container {                                                                         
  width                                                                              :   100%;                                                                                            
  padding                                                                            :   20px;                                                                                            
  background-color                                                                   :   #fff;                                                                                            
  border-radius                                                                      :   8px;                                                                                             
}                                                                                    

/* Стало                                                                             :   */                                                                                               

.container {                                                                         

  width                                                                              :   100%;                                                                                            
  padding                                                                            :   20px;                                                                                            
  background-color                                                                   :   #fff;                                                                                            
  border-radius                                                                      :   8px;                                                                                             
}                                                                                    

```                                                                                  
```                                                                                  
Имя                                                                                  =   Иван                                                                                             
Возраст                                                                              =   25                                                                                               

Город                                                                                =   Москва                                                                                           
Имя                                                                                  =   Иван                                                                                             
Возраст                                                                              =   25                                                                                               
Город                                                                                =   Москва                                                                                           
```                                                                                  
---                                                                                  
- [ ] Выравнивает текст по `                                                         =  ` без конфигурации                                                                                
- [ ] Работает с выделением и без выделения                                          
- [ ] Сохраняет пустые строки на своих местах                                        

- [ ] Строки без разделителей остаются неизменными                                   
- [ ] Отмена через `Ctrl+Z` полностью восстанавливает текст                          
- [ ] Время выполнения < 50мс для 1000 строк                                         
- [ ] Поддерживает 10+ разделителей с приоритетом по длине                           
- [ ] Корректно обрабатывает строки с разным количеством колонок                     
- [ ] Читает конфигурацию из `.ladnikrc.json`                                        
- [ ] Применяет правила для конкретных расширений файлов                             
- [ ] Игнорирует строки по префиксам (`//`                                           ,   `#`                                                                                              ,   `;`)                                                            

- [ ] Корректно обрабатывает Unicode и эмодзи                                        
- [ ] Команда `ladnik.alignSelection` в палитре команд                               
- [ ] Горячая клавиша `Ctrl+Alt+L` / `Cmd+Alt+L`                                     
- [ ] Контекстное меню в редакторе                                                   
- [ ] Работает как форматтер по умолчанию                                            
- [ ] Показывает уведомления об ошибках конфигурации                                 
- [ ] Не конфликтует с другими форматтерами                                          
- [ ] 100% покрытие тестами критических функций                                      
- [ ] Обработка ошибок без падения расширения                                        

- [ ] Валидация конфигурации до применения                                           
- [ ] Защита от бесконечных циклов при парсинге                                      
- [ ] Отмена операции при зависании (>2 сек)                                         
---                                                                                  
```                                                                                  
ladnik-column-aligner/                                                               
├── .vscode/                                                                         
│   ├── launch.json          # Конфигурация отладки                                  

│   └── tasks.json           # Задачи сборки                                         
├── src/                                                                             
│   ├── extension.ts         # Точка входа расширения                                
│   ├── aligner/                                                                     
│   │   ├── aligner.ts       # Основная логика выравнивания                          
│   │   ├── parser.ts        # Парсинг строк на колонки                              

│   │   ├── config.ts        # Загрузка и валидация конфигурации                     
│   │   └── types.ts         # Типы и брендированные типы                            
│   └── test/                                                                        
│       └── suite/                                                                   
│           ├── aligner.test.ts                                                      

│           ├── parser.test.ts                                                       

│           ├── config.test.ts                                                       

│           └── integration.test.ts                                                  
├── .ladnikrc.json           # Пример конфигурации для проекта                       
├── package.json             # Метаданные и зависимости                              
├── tsconfig.json            # Настройки TypeScript                                  
├── README.md                # Документация для пользователей                        
├── CHANGELOG.md             # История изменений                                     
├── LICENSE                                                                          

└── .gitignore                                                                       
```                                                                                  
---                                                                                  
1. Создать структуру проекта через `yo code`                                         
2. Реализовать базовые типы с брендированием (`Separator`                            ,   `Padding`)                                                                                       
3. Написать функции парсинга строк на колонки                                        
4. Реализовать алгоритм вычисления максимальных ширин                                

5. Написать функцию выравнивания строк                                               
6. Покрыть юнит-тестами все функции ядра                                             
1. Реализовать команду `ladnik.alignSelection`                                       
2. Добавить горячую клавишу `Ctrl+Alt+L`                                             
3. Создать контекстное меню в редакторе                                              
4. Реализовать обработку выделения и полного файла                                   
5. Добавить поддержку отмены через `Ctrl+Z`                                          

6. Протестировать на реальных файлах (JS                                             ,   PHP                                                                                              ,   CSS)                                                            
1. Реализовать парсер `.ladnikrc.json`                                               
2. Создать систему разрешения конфигурации (файл → настройки → дефолты)              
3. Добавить поддержку правил для расширений файлов                                   
4. Реализовать валидацию конфигурации                                                
5. Добавить команду `ladnik.configure` для создания шаблона конфига                  

6. Протестировать все сценарии загрузки конфигурации                                 

1. Реализовать игнорирование строк по префиксам                                      

2. Добавить поддержку выравнивания комментариев (опционально)                        
3. Реализовать обработку Unicode и эмодзи                                            
4. Добавить защиту от зависаний (таймауты)                                           
5. Создать интеграционные тесты                                                      
6. Написать документацию (README                                                     ,   CHANGELOG)                                                                                       
1. Собрать расширение в VSIX (`vsce package`)                                        
2. Протестировать установку из VSIX                                                  
3. Проверить работу на разных ОС (Windows                                            ,   macOS                                                                                            ,   Linux)                                                          
4. Оптимизировать производительность                                                 
5. Добавить иконки и метаданные для маркетплейса                                     
6. Подготовить публикацию в VS Code Marketplace                                      
---                                                                                  
1. **Невалидное состояние невозможно** — валидация на границах системы               ,   брендированные типы                                                                              
2. **Максимальная читаемость** — snake_Case с заглавной буквой после подчёркивания   
3. **Функциональный подход** — никаких классов                                       ,   только чистые функции и простые объекты                                                          
4. **Атомарность** — каждая функция делает одну маленькую вещь (3–15 строк)          
5. **Безопасность** — обработка ошибок через Railway Oriented Programming            
6. **Производительность** — алгоритмы линейной сложности                             ,   кэширование где уместно                                                                          
7. **Тестируемость** — чистые функции без побочных эффектов                          
---                                                                                  
- [ ] Нет ни одного `class`                                                          ,   `this`                                                                                           ,   `new`                                                           
- [ ] Все типы                                                                       :   `Config_Aligner`                                                                                 ,   `Parse_Result`                                                  ,   `State_Machine`                                                                  
- [ ] Все функции                                                                    :   `lines_Align`                                                                                    ,   `columns_Widths_Calculate`                                      ,   `separator_Find`                                                                 
- [ ] Все переменные                                                                 :   `max_Widths`                                                                                     ,   `is_Valid`                                                      ,   `parsed_Lines`                                                                   
- [ ] Брендированные типы для критических значений (`Separator`                      ,   `Padding`)                                                                                       
- [ ] Каждая функция 3–15 строк                                                      ,   делает одну вещь                                                                                 

- [ ] Есть комментарии Хоара для сложных функций                                     

- [ ] 100% покрытие тестами ядра                                                     

- [ ] Работает как форматтер по умолчанию                                            
- [ ] Отмена через `Ctrl+Z` полностью восстанавливает текст                          
---                                                                                  
**Результат**                                                                        :   Профессиональное                                                                                 ,   надёжное расширение для VS Code                                 ,   которое делает код визуально чище за один клик. Кодовая база проста для понимания,   расширения и поддержки — как хороший инструмент в руках мастера. 🛠️✨
4. Реализовать алгоритм вычисления максимальных ширин
5. Написать функцию выравнивания строк
6. Покрыть юнит-тестами все функции ядра

### Этап 2: Интеграция с VS Code
1. Реализовать команду `ladnik.alignSelection`
2. Добавить горячую клавишу `Ctrl+Alt+L`
3. Создать контекстное меню в редакторе
4. Реализовать обработку выделения и полного файла
5. Добавить поддержку отмены через `Ctrl+Z`
6. Протестировать на реальных файлах (JS, PHP, CSS)

### Этап 3: Конфигурация
1. Реализовать парсер `.ladnikrc.json`
2. Создать систему разрешения конфигурации (файл → настройки → дефолты)
3. Добавить поддержку правил для расширений файлов
4. Реализовать валидацию конфигурации
5. Добавить команду `ladnik.configure` для создания шаблона конфига
6. Протестировать все сценарии загрузки конфигурации

### Этап 4: Продвинутые возможности
1. Реализовать игнорирование строк по префиксам
2. Добавить поддержку выравнивания комментариев (опционально)
3. Реализовать обработку Unicode и эмодзи
4. Добавить защиту от зависаний (таймауты)
5. Создать интеграционные тесты
6. Написать документацию (README, CHANGELOG)

### Этап 5: Финальная подготовка
1. Собрать расширение в VSIX (`vsce package`)
2. Протестировать установку из VSIX
3. Проверить работу на разных ОС (Windows, macOS, Linux)
4. Оптимизировать производительность
5. Добавить иконки и метаданные для маркетплейса
6. Подготовить публикацию в VS Code Marketplace

---

## 🎯 Ключевые принципы реализации

1. **Невалидное состояние невозможно** — валидация на границах системы, брендированные типы
2. **Максимальная читаемость** — snake_Case с заглавной буквой после подчёркивания
3. **Функциональный подход** — никаких классов, только чистые функции и простые объекты
4. **Атомарность** — каждая функция делает одну маленькую вещь (3–15 строк)
5. **Безопасность** — обработка ошибок через Railway Oriented Programming
6. **Производительность** — алгоритмы линейной сложности, кэширование где уместно
7. **Тестируемость** — чистые функции без побочных эффектов

---

## 💡 Финальная проверка перед сдачей

- [ ] Нет ни одного `class`, `this`, `new`
- [ ] Все типы: `Config_Aligner`, `Parse_Result`, `State_Machine`
- [ ] Все функции: `lines_Align`, `columns_Widths_Calculate`, `separator_Find`
- [ ] Все переменные: `max_Widths`, `is_Valid`, `parsed_Lines`
- [ ] Брендированные типы для критических значений (`Separator`, `Padding`)
- [ ] Каждая функция 3–15 строк, делает одну вещь
- [ ] Есть комментарии Хоара для сложных функций
- [ ] 100% покрытие тестами ядра
- [ ] Работает как форматтер по умолчанию
- [ ] Отмена через `Ctrl+Z` полностью восстанавливает текст

---

**Результат**: Профессиональное, надёжное расширение для VS Code, которое делает код визуально чище за один клик. Кодовая база проста для понимания, расширения и поддержки — как хороший инструмент в руках мастера. 🛠️✨