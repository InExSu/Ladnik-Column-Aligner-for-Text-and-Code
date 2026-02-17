// ============================================================================
// Типы конфигурации
// ============================================================================

interface AlignConfig {
    ignorePrefix: string[]
    separators: string[]
}

interface AppConfig {
    align: AlignConfig
}

// ============================================================================
// Вспомогательные функции проверки строк
// ============================================================================

/**
 * Проверяет, начинается ли строка с одного из игнорируемых префиксов.
 */
function string_Starts_With_Ignored(str: string, ignoredPrefixes: string[]): boolean {
    if(!ignoredPrefixes || ignoredPrefixes.length === 0) return false
    return ignoredPrefixes.some(prefix => str.startsWith(prefix))
}

/**
 * Проверяет, содержит ли строка один из разделителей.
 */
function string_Include(str: string, separators: string[]): boolean {
    if(!separators || separators.length === 0) return false
    return separators.some(sep => str.includes(sep))
}

// ============================================================================
// Типы для FSM основного автомата
// ============================================================================

type AlignerState =
    | 'НАЧАЛО'
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

interface AlignerContext {
    stringsIn : string[]
    stringsOut: string[]
    ignors    : string[]
    separators: string[]
    indexes   : number[]
    i         : number
    state     : AlignerState
    config    : AppConfig
}

// ============================================================================
// Обработчики состояний основного автомата
// ============================================================================

function handleStart(ctx: AlignerContext): void {
    ctx.i = 0
    ctx.state = 'ПРОВЕРКА_ИГНОРА'
}

function handleCheckIgnor(ctx: AlignerContext): void {
    const s = ctx.stringsIn[ctx.i]
    ctx.state = string_Starts_With_Ignored(s, ctx.ignors)
        ? 'КОПИРОВАНИЕ_ИГНОРА'
        : 'СТРОКА_БЕЗ_ИГНОРОВ'
}

function handleSearchSeparators(ctx: AlignerContext): void {
    const s = ctx.stringsIn[ctx.i]
    ctx.state = string_Include(s, ctx.separators)
        ? 'СТРОКА_С_РАЗДЕЛИТЕЛЕМ'
        : 'СТРОКА_С_РАЗДЕЛИТЕЛЯМИ_ПОСЛЕДНЯЯ'
}

function handleAccumulateLines(ctx: AlignerContext): void {
    ctx.indexes.push(ctx.i)
    ctx.i++
    ctx.state = 'ПРОВЕРКА_ИГНОРА'
}

function handleCheckAccumulated(ctx: AlignerContext): void {
    ctx.state = ctx.indexes.length > 0
        ? 'ПРОВЕРКА_КОЛИЧЕСТВА_СТРОК'
        : 'МАССИВ_ПУСТ'
}

function handleCheckLineCount(ctx: AlignerContext): void {
    ctx.state = ctx.indexes.length === 1
        ? 'ВЫРАВНИВАНИЕ_1'
        : 'ВЫРАВНИВАНИЕ_БОЛЬШЕ_1'
}

function handleAlignSingle(ctx: AlignerContext): void {
    const idxToAlign = ctx.indexes[0]
    const originalString = ctx.stringsIn[idxToAlign]
    ctx.stringsOut[idxToAlign] = string_1_Align(originalString)
    ctx.indexes = []
    ctx.stringsOut[ctx.i] = ctx.stringsIn[ctx.i]
    ctx.i++
    ctx.state = 'ПРОВЕРКА_ИГНОРА'
}

function handleAlignBatch(ctx: AlignerContext): void {
    const alignedBatch = a1_Strings_Align_Batch(ctx.indexes, ctx.stringsIn, ctx.config)
    for(let j = 0; j < ctx.indexes.length; j++) {
        ctx.stringsOut[ctx.indexes[j]] = alignedBatch[j]
    }
    ctx.indexes = []
    ctx.stringsOut[ctx.i] = ctx.stringsIn[ctx.i]
    ctx.i++
    ctx.state = 'ПРОВЕРКА_ИГНОРА'
}

function handleEmptyArray(ctx: AlignerContext): void {
    ctx.stringsOut[ctx.i] = ctx.stringsIn[ctx.i]
    ctx.i++
    ctx.state = 'ПРОВЕРКА_ИГНОРА'
}

function handleCopyIgnor(ctx: AlignerContext): void {
    ctx.stringsOut[ctx.i] = ctx.stringsIn[ctx.i]
    ctx.i++
    ctx.state = 'ПРОВЕРКА_ИГНОРА'
}

function processState(ctx: AlignerContext): void {
    switch(ctx.state) {
        case 'НАЧАЛО':
            handleStart(ctx)
            break
        case 'ПРОВЕРКА_ИГНОРА':
            handleCheckIgnor(ctx)
            break
        case 'СТРОКА_БЕЗ_ИГНОРОВ':
            ctx.state = 'ПОИСК_РАЗДЕЛИТЕЛЕЙ'
            break
        case 'ПОИСК_РАЗДЕЛИТЕЛЕЙ':
            handleSearchSeparators(ctx)
            break
        case 'СТРОКА_С_РАЗДЕЛИТЕЛЕМ':
            ctx.state = 'КОПЛЮ_СТРОКИ'
            break
        case 'КОПЛЮ_СТРОКИ':
            handleAccumulateLines(ctx)
            break
        case 'СТРОКА_С_РАЗДЕЛИТЕЛЯМИ_ПОСЛЕДНЯЯ':
            ctx.state = 'ПРОВЕРКА_НАКОПЛЕННЫХ'
            break
        case 'ПРОВЕРКА_НАКОПЛЕННЫХ':
            handleCheckAccumulated(ctx)
            break
        case 'ПРОВЕРКА_КОЛИЧЕСТВА_СТРОК':
            handleCheckLineCount(ctx)
            break
        case 'ВЫРАВНИВАНИЕ_1':
            handleAlignSingle(ctx)
            break
        case 'ВЫРАВНИВАНИЕ_БОЛЬШЕ_1':
            handleAlignBatch(ctx)
            break
        case 'МАССИВ_ПУСТ':
            handleEmptyArray(ctx)
            break
        case 'КОПИРОВАНИЕ_ИГНОРА':
            handleCopyIgnor(ctx)
            break
        default:
            throw new Error(`Неизвестное состояние: ${ctx.state}`)
    }
}

function finalizeAccumulatedLines(ctx: AlignerContext): void {
    if(ctx.indexes.length === 0) return

    if(ctx.indexes.length === 1) {
        const idxToAlign = ctx.indexes[0]
        ctx.stringsOut[idxToAlign] = string_1_Align(ctx.stringsIn[idxToAlign])
    } else {
        const alignedBatch = a1_Strings_Align_Batch(ctx.indexes, ctx.stringsIn, ctx.config)
        for(let j = 0; j < ctx.indexes.length; j++) {
            ctx.stringsOut[ctx.indexes[j]] = alignedBatch[j]
        }
    }
}

/**
 * Обрабатывает массив строк, группируя строки с разделителями для последующего выравнивания.
 */
// eslint-disable-next-line no-unused-vars
function array_Alignment(stringsIn: string[], config: AppConfig): string[] {
    const ctx: AlignerContext = {
        stringsIn,
        stringsOut: new Array(stringsIn.length),
        ignors: config.align.ignorePrefix,
        separators: config.align.separators,
        indexes: [],
        i: 0,
        state: 'НАЧАЛО',
        config
    }

    while(ctx.i < ctx.stringsIn.length) {
        processState(ctx)
    }

    finalizeAccumulatedLines(ctx)

    return ctx.stringsOut
}

// ============================================================================
// Типы для пакетного выравнивания
// ============================================================================

type TokenType = 'text' | 'separator'

interface Token {
    type: TokenType
    value: string
    separatorChar?: string
}

interface ParsedLine {
    tokens: Token[]
    separatorPositions: number[]
}

interface ColumnInfo {
    texts: string[]
    maxWidth: number
}

// ============================================================================
// Парсинг строки на токены
// ============================================================================

function parseLine(line: string, separators: string[]): ParsedLine {
    const tokens: Token[] = []
    const separatorPositions: number[] = []
    let currentToken = ''
    let i = 0

    while(i < line.length) {
        let foundSeparator = false

        for(const sep of separators) {
            if(line.startsWith(sep, i)) {
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
            currentToken += line[i]
            i++
        }
    }

    if(currentToken) {
        tokens.push({ type: 'text', value: currentToken })
    }

    return { tokens, separatorPositions }
}

// ============================================================================
// Проверка совместимости структур разделителей
// ============================================================================

function getSeparatorSequence(line: ParsedLine): string[] {
    return line.tokens
        .filter(t => t.type === 'separator')
        .map(t => t.separatorChar!)
}

function haveSameSeparatorStructure(lines: ParsedLine[]): boolean {
    if(lines.length === 0) return true

    const firstSeq = getSeparatorSequence(lines[0])

    for(let i = 1; i < lines.length; i++) {
        const currentSeq = getSeparatorSequence(lines[i])
        if(currentSeq.length !== firstSeq.length) return false
        for(let j = 0; j < currentSeq.length; j++) {
            if(currentSeq[j] !== firstSeq[j]) return false
        }
    }
    return true
}

// ============================================================================
// Сбор текстов по столбцам
// ============================================================================

function collectColumnTexts(parsedLines: ParsedLine[], columnCount: number): ColumnInfo[] {
    const columns: ColumnInfo[] = Array(columnCount).fill(null).map(() => ({
        texts: [],
        maxWidth: 0
    }))

    for(let lineIdx = 0; lineIdx < parsedLines.length; lineIdx++) {
        const line = parsedLines[lineIdx]
        let columnIdx = 0

        for(let tokenIdx = 0; tokenIdx < line.tokens.length; tokenIdx++) {
            const token = line.tokens[tokenIdx]

            switch(token.type) {
                case 'text':
                    columns[columnIdx].texts[lineIdx] = token.value
                    columns[columnIdx].maxWidth = Math.max(
                        columns[columnIdx].maxWidth,
                        token.value.length
                    )
                    break
                case 'separator':
                    columnIdx++
                    break
            }
        }
    }

    return columns
}

// ============================================================================
// Построение выровненной строки
// ============================================================================

function buildAlignedLine(tokens: Token[], columns: ColumnInfo[]): string {
    const result: string[] = []
    let columnIdx = 0

    for(const token of tokens) {
        switch(token.type) {
            case 'text': {
                const text = token.value
                const paddedText = text.padEnd(columns[columnIdx].maxWidth)
                result.push(paddedText)
                break
            }
            case 'separator':
                result.push(token.value)
                columnIdx++
                break
        }
    }

    return result.join('')
}

// ============================================================================
// Пакетное выравнивание строк
// ============================================================================

/**
 * Выравнивает группу строк по разделителям.
 */
function a1_Strings_Align_Batch(
    indexes: number[],
    allStrings: string[],
    config: AppConfig
): string[] {
    const stringsToAlign = indexes.map(idx => allStrings[idx])
    if(stringsToAlign.length === 0) return []

    const separators = config.align.separators
    const parsedLines = stringsToAlign.map(line => parseLine(line, separators))

    if(!haveSameSeparatorStructure(parsedLines)) {
        return stringsToAlign
    }

    const separatorCount = getSeparatorSequence(parsedLines[0]).length
    const columnCount = separatorCount + 1
    const columns = collectColumnTexts(parsedLines, columnCount)

    return parsedLines.map(line => buildAlignedLine(line.tokens, columns))
}

// ============================================================================
// Одиночное выравнивание
// ============================================================================

/**
 * Возвращает строку без изменений (выравнивание имеет смысл для группы строк).
 */
function string_1_Align(str: string): string {
    return str
}
