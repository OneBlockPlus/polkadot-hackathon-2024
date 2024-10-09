import {
  ColorThemeKind,
  ExtensionContext,
  InlineCompletionContext,
  InlineCompletionTriggerKind,
  Position,
  Range,
  Terminal,
  TextDocument,
  WebviewView,
  window,
  workspace
} from 'vscode'

import {
  Theme,
  LanguageType,
  apiProviders,
  StreamResponse,
  PrefixSuffix,
  Bracket,
  Message,
  ChunkOptions,
  ServerMessage
} from '../common/types'
import { supportedLanguages } from '../common/languages'
import {
  ALL_BRACKETS,
  CLOSING_BRACKETS,
  defaultChunkOptions,
  EVENT_NAME,
  EXTENSION_CONTEXT_NAME,
  MULTILINE_TYPES,
  NORMALIZE_REGEX,
  OPENING_BRACKETS,
  QUOTES,
  SKIP_DECLARATION_SYMBOLS,
  DAPPFORGE
} from '../common/constants'
import { Logger } from '../common/logger'
import { SyntaxNode } from 'web-tree-sitter'
import { getParser } from './parser-utils'

const logger = new Logger()

export const delayExecution = <T extends () => void>(
  fn: T,
  delay = 200
): NodeJS.Timeout => {
  return setTimeout(() => {
    fn()
  }, delay)
}

export const getTextSelection = () => {
  const editor = window.activeTextEditor
  const selection = editor?.selection
  const text = editor?.document.getText(selection)
  return text || ''
}

export const getLanguage = (): LanguageType => {
  const editor = window.activeTextEditor
  const languageId = editor?.document.languageId
  const language =
    supportedLanguages[languageId as keyof typeof supportedLanguages]
  return {
    language,
    languageId
  }
}

export const getIsBracket = (char: string): char is Bracket => {
  return ALL_BRACKETS.includes(char as Bracket)
}

export const getIsClosingBracket = (char: string): char is Bracket => {
  return CLOSING_BRACKETS.includes(char as Bracket)
}

export const getIsOpeningBracket = (char: string): char is Bracket => {
  return OPENING_BRACKETS.includes(char as Bracket)
}

export const getIsSingleBracket = (chars: string) =>
  chars?.length === 1 && getIsBracket(chars)

export const getIsOnlyOpeningBrackets = (chars: string) => {
  if (!chars || !chars.length) return false

  for (const char of chars) {
    if (!getIsOpeningBracket(char)) {
      return false
    }
  }
  return true
}

export const getIsOnlyClosingBrackets = (chars: string) => {
  if (!chars || !chars.length) return false

  for (const char of chars) {
    if (!getIsClosingBracket(char)) {
      return false
    }
  }
  return true
}

export const getIsOnlyBrackets = (chars: string) => {
  if (!chars || !chars.length) return false

  for (const char of chars) {
    if (!getIsBracket(char)) {
      return false
    }
  }
  return true
}

export const getSkipVariableDeclataion = (
  characterBefore: string,
  textAfter: string
) => {
  if (
    characterBefore &&
    SKIP_DECLARATION_SYMBOLS.includes(characterBefore.trim()) &&
    textAfter.length &&
    (!textAfter.at(0) as unknown as string) === '?' &&
    !getIsOnlyBrackets(textAfter)
  ) {
    return true
  }

  return false
}

export const getShouldSkipCompletion = (
  context: InlineCompletionContext,
  autoSuggestEnabled: boolean
) => {
  const editor = window.activeTextEditor
  if (!editor) return true
  const document = editor.document
  const cursorPosition = editor.selection.active
  const lineEndPosition = document.lineAt(cursorPosition.line).range.end
  const textAfterRange = new Range(cursorPosition, lineEndPosition)
  const textAfter = document.getText(textAfterRange)
  const { charBefore } = getBeforeAndAfter()

  // Avoid autocomplete on empty lines
  const line = document.lineAt(cursorPosition.line).text.trim();
  if (line.trim() === '') {
    logger.log('xxx blank line, skip')
    return true;
  }

  // Avoid autocomplete when system menu is shown (ghost text is hidden anyway)
  if (context.selectedCompletionInfo) {
    logger.log('xxx system menu shown, skip')
    return true;
  }  
  
  if (getSkipVariableDeclataion(charBefore, textAfter)) {
    return true
  }

  return (
    context.triggerKind === InlineCompletionTriggerKind.Automatic &&
    !autoSuggestEnabled
  )
}

export const getPrefixSuffix = (
  numLines: number,
  document: TextDocument,
  position: Position,
  contextRatio = [0.85, 0.15]
): PrefixSuffix => {
  const currentLine = position.line
  const numLinesToEnd = document.lineCount - currentLine
  let numLinesPrefix = Math.floor(Math.abs(numLines * contextRatio[0]))
  let numLinesSuffix = Math.ceil(Math.abs(numLines * contextRatio[1]))

  if (numLinesPrefix > currentLine) {
    numLinesSuffix += numLinesPrefix - currentLine
    numLinesPrefix = currentLine
  }

  if (numLinesSuffix > numLinesToEnd) {
    numLinesPrefix += numLinesSuffix - numLinesToEnd
    numLinesSuffix = numLinesToEnd
  }

  const prefixRange = new Range(
    Math.max(0, currentLine - numLinesPrefix),
    0,
    currentLine,
    position.character
  )
  const suffixRange = new Range(
    currentLine,
    position.character,
    currentLine + numLinesSuffix,
    0
  )

  return {
    prefix: document.getText(prefixRange),
    suffix: document.getText(suffixRange)
  }
}

export const getBeforeAndAfter = () => {
  const editor = window.activeTextEditor
  if (!editor)
    return {
      charBefore: '',
      charAfter: ''
    }

  const position = editor.selection.active
  const lineText = editor.document.lineAt(position.line).text

  const charBefore = lineText
    .substring(0, position.character)
    .trim()
    .split('')
    .reverse()[0]

  const charAfter = lineText.substring(position.character).trim().split('')[0]

  return {
    charBefore,
    charAfter
  }
}

export const getIsMiddleOfString = () => {
  const { charBefore, charAfter } = getBeforeAndAfter()

  return (
    charBefore && charAfter && /\w/.test(charBefore) && /\w/.test(charAfter)
  )
}

export const getCurrentLineText = (position: Position | null) => {
  const editor = window.activeTextEditor
  if (!editor || !position) return ''

  const lineText = editor.document.lineAt(position.line).text

  return lineText
}

export const getHasLineTextBeforeAndAfter = () => {
  const { charBefore, charAfter } = getBeforeAndAfter()

  return charBefore && charAfter
}

export const isCursorInEmptyString = () => {
  const { charBefore, charAfter } = getBeforeAndAfter()

  return QUOTES.includes(charBefore) && QUOTES.includes(charAfter)
}

export const getNextLineIsClosingBracket = () => {
  const editor = window.activeTextEditor
  if (!editor) return false
  const position = editor.selection.active
  const nextLineText = editor.document
    .lineAt(Math.min(position.line + 1, editor.document.lineCount - 1))
    .text.trim()
  return getIsOnlyClosingBrackets(nextLineText)
}

export const getPreviousLineIsOpeningBracket = () => {
  const editor = window.activeTextEditor
  if (!editor) return false
  const position = editor.selection.active
  const previousLineCharacter = editor.document
    .lineAt(Math.max(position.line - 1, 0))
    .text.trim()
    .split('')
    .reverse()[0]
  return getIsOnlyOpeningBrackets(previousLineCharacter)
}

export const getIsMultilineCompletion = ({
  node,
  prefixSuffix
}: {
  node: SyntaxNode | null
  prefixSuffix: PrefixSuffix | null
}) => {
  if (!node) return false

  const isMultilineCompletion =
    !getHasLineTextBeforeAndAfter() &&
    !isCursorInEmptyString() &&
    MULTILINE_TYPES.includes(node.type)

  return !!(isMultilineCompletion || !prefixSuffix?.suffix.trim())
}

export const getTheme = () => {
  const currentTheme = window.activeColorTheme
  if (currentTheme.kind === ColorThemeKind.Light) {
    return Theme.Light
  } else if (currentTheme.kind === ColorThemeKind.Dark) {
    return Theme.Dark
  } else {
    return Theme.Contrast
  }
}

export const getChatDataFromProvider = (
  provider: string,
  data: StreamResponse
) => {
  switch (provider) {
    case apiProviders.dAppForge:
      if (data) {
        return processDappForgeChatResponse(data)
      } else {
        return '';
      }
    case apiProviders.Ollama:
    case apiProviders.OpenWebUI:
      return data?.choices[0].delta?.content
        ? data?.choices[0].delta.content
        : ''
    case apiProviders.LlamaCpp:
      return data?.content
    case apiProviders.LiteLLM:
    default:
      if (data?.choices[0].delta.content === 'undefined') return ''
      return data?.choices[0].delta?.content
        ? data?.choices[0].delta.content
        : ''
  }
}

export const getFimDataFromProvider = (
  provider: string,
  data: StreamResponse | undefined
) => {
  switch (provider) {
    case apiProviders.dAppForge:
      if (data) {
        return processDappForgeResponse(data)
      } else {
        return '';
      }

    case apiProviders.Ollama:
    case apiProviders.OpenWebUI:
      return data?.response;

    case apiProviders.LlamaCpp:
      return data?.content;

    case apiProviders.LiteLLM:
      return data?.choices[0].delta.content;

    default:
      if (!data?.choices.length) return;
      if (data?.choices[0].text === 'undefined') {
        return '';
      }
      return data?.choices[0].text ? data?.choices[0].text : '';
  }
};

function processDappForgeChatResponse(data: StreamResponse): string {
  const responseJson: { 
    error?: string, 
    reply?: string 
  } = data.response as { 
    error?: string, 
    reply?: string 
  }

  // Check the status
  if (Number(data.status) !== 200) {
    throw Error(`Status: ${data.status} Error: ${responseJson.error}` || 'Unknown error');
  }
  
  let chatReply = '';

  // Access the 'generated_code' field directly
  if (responseJson.reply) {
    // Unescape control characters
    chatReply = unescapeControlCharacters(responseJson.reply);

    // Trim ends of all lines
    chatReply = chatReply.split('\n').map((v) => v.trimEnd()).join('\n');
    
    logger.log(`<~~~~~ chatReply: ${chatReply}`);
  }
  return chatReply;  
}

function processDappForgeResponse(data: StreamResponse): string {
    // No need for JSON.parse since the response is already an object
    const responseJson: { 
      error?: string, 
      generated_code?: string, 
      kg_edges?: [], 
      subgraph_plot?: string } = data.response as { 
        error?: string, 
        generated_code?: string, 
        kg_edges?: [], 
        subgraph_plot?: string };

    // Check the status
    if (Number(data.status) !== 200) {
      throw Error(`Status: ${data.status} Error: ${responseJson.error}` || 'Unknown error');
    }

    let code = '';

    // Access the 'generated_code' field directly
    if (responseJson.generated_code) {
      code = responseJson.generated_code;
      // Unescape control characters
      code = unescapeControlCharacters(code);

      // Trim ends of all lines
      code = code.split('\n').map((v) => v.trimEnd()).join('\n');
      
      logger.log(`<~~~~~ completion code received: ${code}`);
    }
    return code;  
}


export function isStreamWithDataPrefix(stringBuffer: string) {
  return stringBuffer.startsWith('data:')
}

export const getNoTextBeforeOrAfter = () => {
  const editor = window.activeTextEditor
  const cursorPosition = editor?.selection.active
  if (!cursorPosition) return
  const lastLinePosition = new Position(
    cursorPosition.line,
    editor.document.lineCount
  )
  const textAfterRange = new Range(cursorPosition, lastLinePosition)
  const textAfter = editor?.document.getText(textAfterRange)
  const textBeforeRange = new Range(new Position(0, 0), cursorPosition)
  const textBefore = editor?.document.getText(textBeforeRange)
  return !textAfter || !textBefore
}

export function safeParseJsonResponse(
  stringBuffer: string
): StreamResponse | undefined {
  try {
    if (isStreamWithDataPrefix(stringBuffer)) {
      return JSON.parse(stringBuffer.split('data:')[1])
    }
    return JSON.parse(stringBuffer)
  } catch (e) {
    return undefined
  }
}

export function safeParseJsonStringBuffer(
  stringBuffer: string
): unknown | undefined {
  try {
    return JSON.parse(stringBuffer.replace(NORMALIZE_REGEX, ''))
  } catch (e) {
    return undefined
  }
}

export function safeParseJson<T>(data: string): T | undefined {
  try {
    return JSON.parse(data)
  } catch (e) {
    return undefined
  }
}

export const getCurrentWorkspacePath = (): string | undefined => {
  if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
    const workspaceFolder = workspace.workspaceFolders[0]
    return workspaceFolder.uri.fsPath
  } else {
    window.showInformationMessage('No workspace is open.')
    return undefined
  }
}

export const getTerminal = async (): Promise<Terminal | undefined> => {
  const dappforgeTerminal = window.terminals.find((t) => t.name === DAPPFORGE)
  if (dappforgeTerminal) return dappforgeTerminal
  const terminal = window.createTerminal({ name: DAPPFORGE })
  terminal.show()
  return terminal
}

export const getTerminalExists = (): boolean => {
  if (window.terminals.length === 0) {
    window.showErrorMessage('No active terminals')
    return false
  }
  return true
}

export const getNormalisedText = (text: string) =>
  text.replace(NORMALIZE_REGEX, ' ')

function getSplitChunks(node: SyntaxNode, options: ChunkOptions): string[] {
  const { minSize = 50, maxSize = 500 } = options
  const chunks: string[] = []

  function traverse(node: SyntaxNode) {
    if (node.text.length <= maxSize && node.text.length >= minSize) {
      chunks.push(node.text)
    } else if (node.children.length > 0) {
      for (const child of node.children) {
        traverse(child)
      }
    } else if (node.text.length > maxSize) {
      let start = 0
      while (start < node.text.length) {
        const end = Math.min(start + maxSize, node.text.length)
        chunks.push(node.text.slice(start, end))
        start = end
      }
    }
  }

  traverse(node)
  return chunks
}

export const getChunkOptions = (
  context: ExtensionContext | undefined
): ChunkOptions => {
  if (!context) return defaultChunkOptions
  const maxChunkSizeContext = `${EVENT_NAME.dappforgeGlobalContext}-${EXTENSION_CONTEXT_NAME.dappforgeMaxChunkSize}`
  const minChunkSizeContext = `${EVENT_NAME.dappforgeGlobalContext}-${EXTENSION_CONTEXT_NAME.dappforgeMinChunkSize}`
  const overlap = `${EVENT_NAME.dappforgeGlobalContext}-${EXTENSION_CONTEXT_NAME.dappforgeOverlapSize}`

  const options = {
    maxSize: Number(context.globalState.get(maxChunkSizeContext)) || 500,
    minSize: Number(context.globalState.get(minChunkSizeContext)) || 50,
    overlap: Number(context.globalState.get(overlap)) || 10
  }

  return options
}

export async function getDocumentSplitChunks(
  content: string,
  filePath: string,
  context: ExtensionContext | undefined
): Promise<string[]> {
  if (!context) return []

  const options = getChunkOptions(context)

  try {
    const parser = await getParser(filePath)

    if (!parser) {
      return simpleChunk(content, options)
    }

    const tree = parser.parse(content)
    const chunks = getSplitChunks(tree.rootNode, options)
    return combineChunks(chunks, options)
  } catch (error) {
    console.error(`Error parsing file ${filePath}: ${error}`)
    return simpleChunk(content, options)
  }
}

function combineChunks(chunks: string[], options: ChunkOptions): string[] {
  const { minSize, maxSize, overlap } = options
  const result: string[] = []
  let currentChunk = ''

  for (const chunk of chunks) {
    if (currentChunk.length + chunk.length > maxSize) {
      if (currentChunk.length >= minSize) {
        result.push(currentChunk)
        currentChunk = chunk
      } else {
        currentChunk += ' ' + chunk
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + chunk
    }
    if (currentChunk.length >= maxSize - overlap) {
      result.push(currentChunk)
      currentChunk = currentChunk.slice(-overlap)
    }
  }

  if (currentChunk.length >= minSize) {
    result.push(currentChunk)
  }

  return result
}

function simpleChunk(content: string, options: ChunkOptions): string[] {
  const { minSize = 50, maxSize = 500, overlap = 50 } = options
  const chunks: string[] = []
  let start = 0

  while (start < content.length) {
    const end = Math.min(start + maxSize, content.length)
    const chunk = content.slice(start, end)

    try {
      chunks.push(chunk)
    } catch (error) {
      if (
        error instanceof RangeError &&
        error.message.includes('Invalid array length')
      ) {
        logger.log(
          'Maximum array size reached. Returning chunks processed so far.'
        )
        break
      } else {
        throw error
      }
    }

    start = end - overlap > start ? end - overlap : end

    if (end === content.length) break
  }

  return chunks.filter(
    (chunk, index) => chunk.length >= minSize || index === chunks.length - 1
  )
}

export const updateLoadingMessage = (
  view: WebviewView | undefined,
  message: string
) => {
  view?.webview.postMessage({
    type: EVENT_NAME.dappforgeSendLoader,
    value: {
      data: message
    }
  } as ServerMessage<string>)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logStreamOptions = (opts: any) => {
  logger.log(
    `
***Dappforge Stream Debug***\n\
Streaming response from ${opts.options.hostname}:${opts.options.port}.\n\
Request body:\n${JSON.stringify(opts.body, null, 2)}\n\n
Request options:\n${JSON.stringify(opts.options, null, 2)}\n\n
Number characters in all messages = ${
      opts.body.messages &&
      opts.body.messages?.reduce((acc: number, msg: Message) => {
        return msg.content?.length ? acc + msg.content?.length : 0
      }, 0)
    }\n\n
    `.trim()
  )
}

export function extractHostAndPort(websocketUri: string): { host: string, port: number } {
  const url = new URL(websocketUri);
  const host = url.hostname;
  const port = parseInt(url.port, 10);
  return { host, port };
}

export function unescapeControlCharacters(str: string): string {
  // Define a mapping of escaped characters to their actual characters
  const controlCharacterMap: { [key: string]: string } = {
      '\\n': '\n',
      '\\t': '\t',
      '\\r': '\r',
      '\\b': '\b',
      '\\f': '\f',
      '\\v': '\v',
      '\\0': '\0',
      '\\\\': '\\', // To handle escaped backslash
      '\\"': '"',  // To handle escaped double quote
      '\\\'': '\'',  // To handle escaped single quote
  }

  // Create a regular expression to match all escaped control characters
  const controlCharacterRegex = /\\[ntrbfv0\\'"]/g

  // Replace the escaped sequences with their corresponding control characters
  return str.replace(controlCharacterRegex, (match) => controlCharacterMap[match] || match)
}

export function generateConversationTitle(): string {
  const currentDate = new Date();

  // Manually extract date components
  const year = currentDate.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[currentDate.getMonth()];
  const day = currentDate.getDate();

  // Manually extract time components
  let hours = currentDate.getHours();
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const seconds = currentDate.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time

  // Generate the conversation title with manually formatted date and time
  const formattedDate = `${month} ${day}, ${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;

  return `${formattedDate} at ${formattedTime}`;
}

