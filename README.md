# Ladnik Column Aligner

**Ladnik Column Aligner** — это расширение для Visual Studio Code, предназначенное для визуального выравнивания текста и кода по колонкам на основе разделителей.

## Основные команды

| Команда | Описание | Горячие клавиши |
|---------|----------|-----------------|
| `ladnik.alignSelection` | Выровнять выделенный текст | `Ctrl+Alt+L` / `Cmd+Alt+L` |
| `ladnik.alignFile` | Выровнять весь файл | — |
| `ladnik.configure` | Открыть/создать конфигурацию | — |

## Сборка и установка

### Компиляция TypeScript в JavaScript
```bash
npm run compile
```

### Запуск тестов
```bash
npm test
```

### Проверка кода через линтер
```bash
npm run lint
```

### Создание VSIX-пакета
```bash
npx @vscode/vsce package
```

### Установка расширения
```bash
./vsix_Build.sh
```

### Дополнительные команды

| Команда | Описание |
|---------|----------|
| `npm run watch` | Наблюдение за изменениями (в разработке) |
| `npm run vscode:prepublish` | Предварительная сборка |

### Полный процесс сборки
```bash
npm run compile && npm run lint && npm test && npx @vscode/vsce package
```

### Ручная сборка (альтернатива при проблемах с vsce)
```bash
# Сначала компиляция
npm run compile

# Затем создание архива вручную
zip -r ladnik-column-aligner-manual.vsix . -x \
  "node_modules/*" \
  ".git/*" \
  ".vscode-test/*" \
  "*.vsix" \
  "check-readiness.sh" \
  ".gitignore" \
  ".ladnikrc.json" \
  "__MACOSX/*" \
  "*/node_modules/*" \
  "*/__MACOSX/*" \
  "examples.md" \
  "FINAL-REPORT.md" \
  "ACCEPTANCE-CRITERIA.md" \
  "ALL-ACCEPTANCE-CRITERIA-MET.md" \
  "prompt_02.md" \
  ".vscodeignore"
```

Установить расширение можно через Marketplace VS Code или командой:
```bash
ext install ladnik-column-aligner
```

## Примеры работы

### JavaScript
```javascript
// До выравнивания
const user   = { name: "John", age: 25, email: "john@example.com" };
const config = { host: "localhost", port: 3000, debug: true };

// После выравнивания
const user   = { name: "John", age: 25, email: "john@example.com" };
const config = { host: "localhost", port: 3000, debug: true };
```

### PHP
```php
// До выравнивания
return [
  'host' => 'localhost',
  'port' => 3306,
  'database' => 'app_db',
  'username' => 'root',
];

// После выравнивания
return [
  'host'     => 'localhost',
  'port'     => 3306,
  'database' => 'app_db',
  'username' => 'root',
];
```

### CSS
```css
/* До выравнивания */
.container {
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

/* После выравнивания */
.container {
  width           : 100%;
  padding         : 20px;
  background-color: #fff;
  border-radius   : 8px;
}
```

## Конфигурация

### Через `.ladnikrc.json` в корне проекта
```json
{
  "align": {
    "separators": ["=>", "::", "=", ":", "->", ","],
    "padding": 2,
    "alignComments": true,
    "ignorePrefix": ["//", "#", ";"],
    "languages": []
  },
  "rules": {
    ".php": {
      "separators": ["=>", "::", "->"],
      "alignComments": false
    },
    ".js": {
      "separators": ["=", ":"],
      "padding": 1
    },
    ".py": {
      "separators": ["="],
      "ignorePrefix": ["#"]
    },
    ".css": {
      "separators": [":"],
      "padding": 1,
      "ignorePrefix": ["/*", "*/"]
    }
  }
}
```

### Через `settings.json` VS Code
```json
{
  "ladnik.defaultSeparators": ["=", ":", "=>"],
  "ladnik.defaultPadding": 2
}
```

## Поддерживаемые языки

Расширение работает со всеми текстовыми файлами, включая:
- JavaScript/TypeScript
- PHP
- Python
- CSS
- JSON
- и другие

## Горячие клавиши

- `Ctrl+Alt+L` (Windows/Linux) или `Cmd+Alt+L` (macOS) — выровнять выделенный текст

## Участие в разработке

Если вы хотите внести вклад в развитие этого расширения, создайте issue или pull request в GitHub-репозитории.

## Лицензия

MIT