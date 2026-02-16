/**
 * Обрабатывает массив строк, группируя строки с разделителями для последующего выравнивания.
 * Строки, начинающиеся с игнорируемых префиксов, копируются без изменений.
 * @param a1_Strings_IN - Входной массив строк.
 * @param aX_Config - Конфигурация приложения.
 * @returns Новый массив строк с примененным выравниванием.
 */
// eslint-disable-next-line no-unused-vars
function array_Alignment(
    a1_Strings_IN: string[],
    aX_Config: AppConfig): string[] {
    // Инициализация (блок 12)
    const a1_Strings_Out: string[] = new Array(a1_Strings_IN.length)
    const a1_Ignors: string[] = aX_Config.align.ignorePrefix
    const a1_Separators: string[] = aX_Config.align.separators
    let a1_Indexes: number[] = []

    // Индекс текущей строки
    let i = 0

    // Состояния автомата
    type State =
        | 'НАЧАЛО'
        | 'ЦИКЛ'
        | 'ПРОВЕРКА_ИГНОРА'
        | 'СТРОКА_БЕЗ_ИГНОРОВ'
        | 'ПОИСК_РАЗДЕЛИТЕЛЕЙ'
        | 'СТРОКА_С_РАЗДЕЛИТЕЛЕМ'
        | 'КОПЛЮ_СТРОКИ'
        | 'СТРОКА_С_РАЗДЕЛИТЕЛЯМИ_ПОСЛЕДНЯЯ'
        | 'ПРОВЕРКА_НАКОПЛЕННЫХ'
        | 'ПРОВЕРКА_КОЛИЧЕСТВА_СТРОК'
        | 'ВЫРАВНИВАНИЕ_1'
        | 'ВЫРАВНИВАНИЕ_БОЛЬШЕ_1'
        | 'МАССИВ_ПУСТ'
        | 'КОПИРОВАНИЕ_ИГНОРА'
        | 'СЛЕДУЮЩАЯ_ИТЕРАЦИЯ'
        | 'ЗАВЕРШЕНИЕ'

    let state: State = 'НАЧАЛО'

    // --- Вспомогательные функции ---
    function string_Starts_With_Ignored(str: string, ignoredPrefixes: string[]): boolean {
        if(!ignoredPrefixes || ignoredPrefixes.length === 0) return false
        return ignoredPrefixes.some(prefix => str.startsWith(prefix))
    }

    function string_Include(str: string, separators: string[]): boolean {
        if(!separators || separators.length === 0) return false
        return separators.some(sep => str.includes(sep))
    }

    // Бесконечный цикл обработки состояний
    while(state !== 'ЗАВЕРШЕНИЕ') {
        switch(state) {
            case 'НАЧАЛО': {
                // Начальное состояние
                i = 0
                state = 'ЦИКЛ'
                break
            }

            case 'ЦИКЛ': {
                // Проверка условия выхода из цикла
                if(i >= a1_Strings_IN.length) {
                    state = 'ЗАВЕРШЕНИЕ'
                } else {
                    state = 'ПРОВЕРКА_ИГНОРА'
                }
                break
            }

            case 'ПРОВЕРКА_ИГНОРА': {
                const s = a1_Strings_IN[i]

                if(string_Starts_With_Ignored(s, a1_Ignors)) {
                    state = 'КОПИРОВАНИЕ_ИГНОРА'
                } else {
                    state = 'СТРОКА_БЕЗ_ИГНОРОВ'
                }
                break
            }

            case 'СТРОКА_БЕЗ_ИГНОРОВ': {
                state = 'ПОИСК_РАЗДЕЛИТЕЛЕЙ'
                break
            }

            case 'ПОИСК_РАЗДЕЛИТЕЛЕЙ': {
                const s = a1_Strings_IN[i]

                if(string_Include(s, a1_Separators)) {
                    state = 'СТРОКА_С_РАЗДЕЛИТЕЛЕМ'
                } else {
                    state = 'СТРОКА_С_РАЗДЕЛИТЕЛЯМИ_ПОСЛЕДНЯЯ'
                }
                break
            }

            case 'СТРОКА_С_РАЗДЕЛИТЕЛЕМ': {
                state = 'КОПЛЮ_СТРОКИ'
                break
            }

            case 'КОПЛЮ_СТРОКИ': {
                a1_Indexes.push(i)
                i++ // Переход к следующей строке
                state = 'ЦИКЛ'
                break
            }

            case 'СТРОКА_С_РАЗДЕЛИТЕЛЯМИ_ПОСЛЕДНЯЯ': {
                state = 'ПРОВЕРКА_НАКОПЛЕННЫХ'
                break
            }

            case 'ПРОВЕРКА_НАКОПЛЕННЫХ': {
                if(a1_Indexes.length > 0) {
                    state = 'ПРОВЕРКА_КОЛИЧЕСТВА_СТРОК'
                } else {
                    state = 'МАССИВ_ПУСТ'
                }
                break
            }

            case 'ПРОВЕРКА_КОЛИЧЕСТВА_СТРОК': {
                if(a1_Indexes.length === 1) {
                    state = 'ВЫРАВНИВАНИЕ_1'
                } else {
                    state = 'ВЫРАВНИВАНИЕ_БОЛЬШЕ_1'
                }
                break
            }

            case 'ВЫРАВНИВАНИЕ_1': {
                const idxToAlign = a1_Indexes[0]
                const originalString = a1_Strings_IN[idxToAlign]
                a1_Strings_Out[idxToAlign] = string_1_Align(originalString)

                // Очищаем индексы
                a1_Indexes = []

                // Текущую строку (без разделителя) копируем как есть
                a1_Strings_Out[i] = a1_Strings_IN[i]

                i++ // Переход к следующей строке
                state = 'ЦИКЛ'
                break
            }

            case 'ВЫРАВНИВАНИЕ_БОЛЬШЕ_1': {
                const alignedBatch: string[] = a1_Strings_Align_Batch(a1_Indexes, a1_Strings_IN, aX_Config)

                // Записываем выровненные строки
                for(let j = 0; j < a1_Indexes.length; j++) {
                    const originalIndex = a1_Indexes[j]
                    a1_Strings_Out[originalIndex] = alignedBatch[j]
                }

                // Очищаем индексы
                a1_Indexes = []

                // Текущую строку (без разделителя) копируем как есть
                a1_Strings_Out[i] = a1_Strings_IN[i]

                i++ // Переход к следующей строке
                state = 'ЦИКЛ'
                break
            }

            case 'МАССИВ_ПУСТ': {
                // Накопленных строк нет, просто копируем текущую строку
                a1_Strings_Out[i] = a1_Strings_IN[i]
                i++ // Переход к следующей строке
                state = 'ЦИКЛ'
                break
            }

            case 'КОПИРОВАНИЕ_ИГНОРА': {
                // Копируем игнорируемую строку как есть
                a1_Strings_Out[i] = a1_Strings_IN[i]
                i++ // Переход к следующей строке
                state = 'ЦИКЛ'
                break
            }

            case 'ЗАВЕРШЕНИЕ': {
                // Обработка оставшихся накопленных строк после завершения цикла
                if(a1_Indexes.length > 0) {
                    if(a1_Indexes.length === 1) {
                        const idxToAlign = a1_Indexes[0]
                        const originalString = a1_Strings_IN[idxToAlign]
                        a1_Strings_Out[idxToAlign] = string_1_Align(originalString)
                    } else {
                        const alignedBatch: string[] = a1_Strings_Align_Batch(a1_Indexes, a1_Strings_IN, aX_Config)
                        for(let j = 0; j < a1_Indexes.length; j++) {
                            a1_Strings_Out[a1_Indexes[j]] = alignedBatch[j]
                        }
                    }
                }

                // Выход из цикла while
                break
            }

            default: {
                // На случай необработанного состояния
                throw new Error(`Неизвестное состояние: ${state}`)
            }
        }
    }

    // Возвращаем результат
    return a1_Strings_Out
}

// Типы для конфигурации
interface AlignConfig {
    ignorePrefix: string[]
    separators: string[]
}

interface AppConfig {
    align: AlignConfig
}


/**
 * Выравнивает группу строк по разделителям.
 * Анализирует структуру разделителей в каждой строке и выравнивает их в столбцы.
 * 
 * @param indexes - индексы строк для выравнивания
 * @param allStrings - все исходные строки
 * @param aX_Config - конфигурация с разделителями
 * @returns массив выровненных строк в том же порядке, что и indexes
 */
function a1_Strings_Align_Batch(
    indexes: number[],
    allStrings: string[],
    aX_Config: AppConfig
): string[] {
    // Получаем только нужные строки
    const stringsToAlign: string[] = indexes.map(idx => allStrings[idx])

    if(stringsToAlign.length === 0) return []

    const separators: string[] = aX_Config.align.separators

    // --- Шаг 1: Парсинг структуры каждой строки ---

    // Типы токенов
    type TokenType = 'text' | 'separator'

    interface Token {
        type: TokenType
        value: string
        separatorChar?: string // для типа 'separator'
    }

    interface ParsedLine {
        tokens: Token[]
        separatorPositions: number[] // позиции разделителей в исходной строке
    }

    // Состояния для парсера строки
    type ParserState = 'TEXT' | 'SEPARATOR' | 'END'

    /**
     * Разбирает строку на токены (текст и разделители)
     */
    function parseLine(line: string): ParsedLine {
        const tokens: Token[] = []
        const separatorPositions: number[] = []

        let currentToken = ''
        let state: ParserState = 'TEXT'
        let i = 0

        while(state !== 'END') {
            switch(state) {
                case 'TEXT': {
                    if(i >= line.length) {
                        if(currentToken) {
                            tokens.push({ type: 'text', value: currentToken })
                        }
                        state = 'END'
                        break
                    }

                    const char = line[i]

                    // Проверяем, является ли символ началом разделителя
                    let foundSeparator = false
                    for(const sep of separators) {
                        if(line.startsWith(sep, i)) {
                            // Нашли разделитель
                            if(currentToken) {
                                tokens.push({ type: 'text', value: currentToken })
                                currentToken = ''
                            }

                            tokens.push({ type: 'separator', value: sep, separatorChar: sep })
                            separatorPositions.push(tokens.length - 1)

                            i += sep.length
                            foundSeparator = true
                            break
                        }
                    }

                    if(!foundSeparator) {
                        // Обычный текст
                        currentToken += char
                        i++
                    }
                    break
                }

                case 'END':
                    // Завершаем цикл
                    break
            }
        }

        return { tokens, separatorPositions }
    }

    // Парсим все строки
    const parsedLines: ParsedLine[] = stringsToAlign.map(line => parseLine(line))

    // --- Шаг 2: Проверка совместимости структур ---

    /**
     * Проверяет, одинаковая ли последовательность разделителей в строках
     */
    function haveSameSeparatorStructure(lines: ParsedLine[]): boolean {
        if(lines.length === 0) return true

        const firstLineSeqs = lines[0].tokens
            .filter(t => t.type === 'separator')
            .map(t => t.separatorChar)

        for(let i = 1; i < lines.length; i++) {
            const currentLineSeqs = lines[i].tokens
                .filter(t => t.type === 'separator')
                .map(t => t.separatorChar)

            if(currentLineSeqs.length !== firstLineSeqs.length) {
                return false
            }

            for(let j = 0; j < currentLineSeqs.length; j++) {
                if(currentLineSeqs[j] !== firstLineSeqs[j]) {
                    return false
                }
            }
        }

        return true
    }

    if(!haveSameSeparatorStructure(parsedLines)) {
        // Если структуры разные, возвращаем исходные строки
        return stringsToAlign
    }

    // --- Шаг 3: Определение максимальных ширин для каждого столбца ---

    // Находим все позиции текстовых блоков между разделителями
    interface ColumnInfo {
        texts: string[]        // тексты для этого столбца из каждой строки
        maxWidth: number        // максимальная ширина
    }

    // Определяем количество столбцов (текстовых блоков)
    // Столбцов = количество разделителей + 1 (текст до первого разделителя)
    const separatorCount = parsedLines[0].tokens.filter(t => t.type === 'separator').length
    const columnCount = separatorCount + 1

    // Инициализируем информацию о столбцах
    const columns: ColumnInfo[] = Array(columnCount).fill(null).map(() => ({
        texts: [],
        maxWidth: 0
    }))

    // Состояния для сбора текстов по столбцам
    type ColumnBuilderState = 'COLLECT_TEXT' | 'SKIP_SEPARATOR' | 'DONE'

    // Собираем тексты по столбцам
    for(let lineIdx = 0; lineIdx < parsedLines.length; lineIdx++) {
        const line = parsedLines[lineIdx]
        let columnIdx = 0
        let state: ColumnBuilderState = 'COLLECT_TEXT'
        let currentText = ''

        for(let tokenIdx = 0; tokenIdx < line.tokens.length; tokenIdx++) {
            const token = line.tokens[tokenIdx]

            switch(state) {
                case 'COLLECT_TEXT': {
                    if(token.type === 'text') {
                        currentText = token.value
                        // Сохраняем текст в соответствующий столбец
                        columns[columnIdx].texts[lineIdx] = currentText
                        columns[columnIdx].maxWidth = Math.max(
                            columns[columnIdx].maxWidth,
                            currentText.length
                        )
                        state = 'SKIP_SEPARATOR'
                    } else {
                        // Пустой текст перед разделителем (строка начинается с разделителя)
                        columns[columnIdx].texts[lineIdx] = ''
                        state = 'SKIP_SEPARATOR'
                        tokenIdx-- // обработаем этот же токен как разделитель
                    }
                    break
                }

                case 'SKIP_SEPARATOR': {
                    if(token.type === 'separator') {
                        columnIdx++
                        state = 'COLLECT_TEXT'
                    }
                    break
                }
            }
        }

        // Обработка последнего столбца, если строка заканчивается текстом
        if(state === 'COLLECT_TEXT' && columnIdx < columnCount) {
            columns[columnIdx].texts[lineIdx] = currentText
            columns[columnIdx].maxWidth = Math.max(
                columns[columnIdx].maxWidth,
                currentText.length
            )
        }
    }

    // --- Шаг 4: Построение выровненных строк ---

    /**
     * Строит выровненную строку из текстов столбцов и разделителей
     */
    function buildAlignedLine(
        lineIdx: number,
        originalTokens: Token[]
    ): string {
        const result: string[] = []
        let columnIdx = 0

        // Состояния для построителя
        type BuilderState = 'ADD_TEXT' | 'ADD_SEPARATOR' | 'FINISH'
        let state: BuilderState = 'ADD_TEXT'

        for(let tokenIdx = 0; tokenIdx < originalTokens.length; tokenIdx++) {
            const token = originalTokens[tokenIdx]

            switch(state) {
                case 'ADD_TEXT': {
                    if(token.type === 'text') {
                        // Добавляем текст с выравниванием по ширине столбца
                        const text = token.value
                        const paddedText = text.padEnd(columns[columnIdx].maxWidth)
                        result.push(paddedText)
                        state = 'ADD_SEPARATOR'
                    } else {
                        // Пустой текст перед разделителем
                        const paddedText = ''.padEnd(columns[columnIdx].maxWidth)
                        result.push(paddedText)
                        state = 'ADD_SEPARATOR'
                        tokenIdx-- // обработаем разделитель
                    }
                    break
                }

                case 'ADD_SEPARATOR': {
                    if(token.type === 'separator') {
                        result.push(token.value)
                        columnIdx++
                        state = 'ADD_TEXT'
                    }
                    break
                }
            }
        }

        // Добавляем последний текст, если строка им заканчивается
        if(state === 'ADD_TEXT' && columnIdx < columnCount) {
            const text = columns[columnIdx].texts[lineIdx] || ''
            const paddedText = text.padEnd(columns[columnIdx].maxWidth)
            result.push(paddedText)
        }

        return result.join('')
    }

    // Строим выровненные строки
    const alignedStrings: string[] = []
    for(let i = 0; i < parsedLines.length; i++) {
        alignedStrings.push(buildAlignedLine(i, parsedLines[i].tokens))
    }

    return alignedStrings
}

// --- Вспомогательная функция для одиночного выравнивания ---
function string_1_Align(
    str: string
): string {
    // Для одной строки просто возвращаем её без изменений,
    // так как выравнивание имеет смысл только для группы строк
    return str
}