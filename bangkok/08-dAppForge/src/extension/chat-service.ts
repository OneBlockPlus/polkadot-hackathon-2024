import {
  StatusBarItem,
  WebviewView,
  commands,
  window,
  workspace,
  ExtensionContext,
  languages,
  DiagnosticSeverity
} from 'vscode'
import * as fs from 'fs/promises'

import {
  ACTIVE_CHAT_PROVIDER_STORAGE_KEY,
  DEFAULT_RERANK_THRESHOLD,
  EVENT_NAME,
  EXTENSION_CONTEXT_NAME,
  SYSTEM,
  USER,
  WEBUI_TABS,
  STATUSBAR_BUSY,
  ACTIVE_CONVERSATION_ID_STORAGE_KEY
} from '../common/constants'
import {
  StreamResponse,
  RequestBodyBase,
  ServerMessage,
  TemplateData,
  Message,
  StreamRequestOptions
} from '../common/types'
import {
  getChatDataFromProvider,
  getLanguage,
  updateLoadingMessage
} from './utils'
import { updateStatusBar } from './auth-utils'
import { CodeLanguageDetails } from '../common/languages'
import { TemplateProvider } from './template-provider'
import { streamResponse, completionAccepted } from './stream'
import { createStreamRequestBody } from './provider-options'
import { kebabToSentence } from '../webview/utils'
import { DappforgeProvider } from './provider-manager'
import { Reranker } from './reranker'
import { Logger } from '../common/logger'
import { SessionManager } from './session-manager'

const logger = new Logger()

export class ChatService {
  private _streamError = false
  private _completion = ''
  private _config = workspace.getConfiguration('dappforge')
  private _context?: ExtensionContext
  private _controller?: AbortController
  private _keepAlive = this._config.get('keepAlive', '5m') as string | number
  private _numPredictChat = this._config.get('numPredictChat', 512) as number
  private _promptTemplate = ''
  private _reranker: Reranker
  private _statusBar: StatusBarItem
  private _temperature = this._config.get('temperature', 0.2) as number
  private _templateProvider?: TemplateProvider
  private _view?: WebviewView
  private _sessionManager: SessionManager

  constructor(
    statusBar: StatusBarItem,
    templateDir: string,
    extensionContext: ExtensionContext,
    view: WebviewView,
    sessionManager: SessionManager,
  ) {
    this._view = view
    this._statusBar = statusBar
    this._templateProvider = new TemplateProvider(templateDir)
    this._reranker = new Reranker()
    this._context = extensionContext
    this._sessionManager = sessionManager
    workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration('dappforge')) {
        return
      }
      this.updateConfig()
    })
  }

  private getRerankThreshold() {
    const rerankThresholdContext = `${EVENT_NAME.dappforgeGlobalContext}-${EXTENSION_CONTEXT_NAME.dappforgeRerankThreshold}`
    const stored = this._context?.globalState.get(
      rerankThresholdContext
    ) as number
    const rerankThreshold = stored || DEFAULT_RERANK_THRESHOLD

    return rerankThreshold
  }

  private async readFileContent(
    filePath: string | undefined,
    maxFileSize: number = 5 * 1024
  ): Promise<string | null> {
    if (!filePath) return null

    try {
      const stats = await fs.stat(filePath)

      if (stats.size > maxFileSize) {
        return null
      }

      if (stats.size === 0) {
        return ''
      }

      const content = await fs.readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      return null
    }
  }

  private getProvider = () => {
    const provider = this._context?.globalState.get<DappforgeProvider>(
      ACTIVE_CHAT_PROVIDER_STORAGE_KEY
    )
    return provider
  }

  private buildStreamRequest(messages?: Message[] | Message[]) {
    const provider = this.getProvider()

    if (!provider) return

    const requestOptions: StreamRequestOptions = {
      hostname: provider.apiHostname,
      port: Number(provider.apiPort),
      path: provider.apiPath,
      protocol: provider.apiProtocol,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: provider.apiKey ? `Bearer ${provider.apiKey}` : ''
      }
    }
    const conversationId: string | undefined =
      this._context?.globalState.get(ACTIVE_CONVERSATION_ID_STORAGE_KEY)
    const requestBody = createStreamRequestBody(provider.provider, {
      model: provider.modelName,
      numPredictChat: this._numPredictChat,
      temperature: this._temperature,
      messages,
      keepAlive: this._keepAlive,
      conversationId: conversationId
    })

    return { requestOptions, requestBody }
  }

  private onStreamData = (
    streamResponse: StreamResponse,
    onEnd?: (completion: string) => void
  ) => {
    const provider = this.getProvider()
    if (!provider) return

    try {
      const data = getChatDataFromProvider(provider.provider, streamResponse)
      this._completion = this._completion + data
      if (onEnd) return
      this._view?.webview.postMessage({
        type: EVENT_NAME.dappforgeOnCompletion,
        value: {
          completion: this._completion.trimStart(),
          data: getLanguage(),
          type: this._promptTemplate
        }
      } as ServerMessage)
    } catch (error) {
      if (error instanceof Error) {
        window.showErrorMessage(error.message)
        logger.error(error)
      } else {
        window.showErrorMessage(String(error))
        logger.log(`${error}`)
      }      
      return
    }
  }

  private onStreamEnd = (onEnd?: (completion: string) => void) => {
    commands.executeCommand(
      'setContext',
      EXTENSION_CONTEXT_NAME.dappforgeGeneratingText,
      false
    )
    if (onEnd) {
      onEnd(this._completion)
      this._view?.webview.postMessage({
        type: EVENT_NAME.dappforgeOnEnd
      } as ServerMessage)
      return
    }
    this._view?.webview.postMessage({
      type: EVENT_NAME.dappforgeOnEnd,
      value: {
        completion: this._completion.trimStart(),
        data: getLanguage(),
        type: this._promptTemplate
      }
    } as ServerMessage)
    if (!this._streamError) this.completionAccepted()
    updateStatusBar(this._statusBar)
  }

  public completionAccepted() {
    const request = this.buildStreamRequest()
    if (request) {
      const { requestBody } = request
      completionAccepted(requestBody)
    }    
  }

  private onStreamError = (error: Error) => {
    updateStatusBar(this._statusBar)
    window.showErrorMessage(error.message)
    this._view?.webview.postMessage({
      type: EVENT_NAME.dappforgeOnEnd,
      value: {
        error: true,
        errorMessage: error.message
      }
    } as ServerMessage)
    this._streamError = true
  }

  private onStreamStart = (controller: AbortController) => {
    this._streamError = false
    this._controller = controller
    commands.executeCommand(
      'setContext',
      EXTENSION_CONTEXT_NAME.dappforgeGeneratingText,
      true
    )
    this._view?.webview.onDidReceiveMessage((data: { type: string }) => {
      if (data.type === EVENT_NAME.dappforgeStopGeneration) {
        this._controller?.abort()
      }
    })
  }

  public destroyStream = () => {
    this._controller?.abort()
    //updateStatusBar(this._statusBar)
    commands.executeCommand(
      'setContext',
      EXTENSION_CONTEXT_NAME.dappforgeGeneratingText,
      true
    )
    this._view?.webview.postMessage({
      type: EVENT_NAME.dappforgeOnEnd,
      value: {
        completion: this._completion.trimStart(),
        data: getLanguage(),
        type: this._promptTemplate
      }
    } as ServerMessage)
  }

  private buildTemplatePrompt = async (
    template: string,
    language: CodeLanguageDetails,
    context?: string
  ) => {
    const editor = window.activeTextEditor
    const selection = editor?.selection
    const selectionContext =
      editor?.document.getText(selection) || context || ''

    const prompt = await this._templateProvider?.readTemplate<TemplateData>(
      template,
      {
        code: selectionContext || '',
        language: language?.langName || 'unknown'
      }
    )
    return { prompt: prompt || '', selection: selectionContext }
  }

  private streamResponse({
    requestBody,
    requestOptions,
    onEnd
  }: {
    requestBody: RequestBodyBase
    requestOptions: StreamRequestOptions
    onEnd?: (completion: string) => void
  }) {
    return streamResponse({
      body: requestBody,
      options: requestOptions,
      onData: (streamResponse) =>
        this.onStreamData(streamResponse as StreamResponse, onEnd),
      onEnd: () => this.onStreamEnd(onEnd),
      onStart: this.onStreamStart,
      onError: this.onStreamError
    })
  }

  private sendEditorLanguage = () => {
    this._view?.webview.postMessage({
      type: EVENT_NAME.dappforgeSendLanguage,
      value: {
        data: getLanguage()
      }
    } as ServerMessage)
  }

  private focusChatTab = () => {
    this._view?.webview.postMessage({
      type: EVENT_NAME.dappforgeSetTab,
      value: {
        data: WEBUI_TABS.chat
      }
    } as ServerMessage<string>)
  }

  getProblemsContext(): string {
    const problems = workspace.textDocuments
      .flatMap((document) =>
        languages.getDiagnostics(document.uri).map((diagnostic) => ({
          severity: DiagnosticSeverity[diagnostic.severity],
          message: diagnostic.message,
          code: document.getText(diagnostic.range),
          line: document.lineAt(diagnostic.range.start.line).text,
          lineNumber: diagnostic.range.start.line + 1,
          character: diagnostic.range.start.character + 1,
          source: diagnostic.source,
          diagnosticCode: diagnostic.code
        }))
      )
      .map((problem) => JSON.stringify(problem))
      .join('\n')

    return problems
  }

  public async streamChatCompletion(messages: Message[]) {
    this._completion = ''
    this.sendEditorLanguage()
    const editor = window.activeTextEditor
    const selection = editor?.selection
    const userSelection = editor?.document.getText(selection)
    const lastMessage = messages[messages.length - 1]
    const text = lastMessage.content

    const systemMessage = {
      role: SYSTEM,
      content: await this._templateProvider?.readSystemMessageTemplate(
        this._promptTemplate
      )
    }

    let additionalContext = ''

    if (userSelection) {
      additionalContext += `Selected Code:\n${userSelection}\n\n`
    }

    const cleanedText = text?.replace(/@workspace/g, '').trim()

    const updatedMessages = [systemMessage, ...messages.slice(0, -1)]

    if (additionalContext) {
      const lastMessageContent = `${cleanedText}\n\n${additionalContext.trim()}`
      updatedMessages.push({
        role: USER,
        content: lastMessageContent
      })
    } else {
      updatedMessages.push({
        ...lastMessage,
        content: cleanedText
      })
    }
    updateLoadingMessage(this._view, 'Thinking')
    this._statusBar.text = STATUSBAR_BUSY
    const request = this.buildStreamRequest(updatedMessages)
    if (!request) return
    const { requestBody, requestOptions } = request
    return this.streamResponse({ requestBody, requestOptions })
  }

  public async getTemplateMessages(
    template: string,
    context?: string,
    skipMessage?: boolean
  ): Promise<Message[]> {
    this._statusBar.text = STATUSBAR_BUSY
    const { language } = getLanguage()
    this._completion = ''
    this._promptTemplate = template
    this.sendEditorLanguage()

    const { prompt, selection } = await this.buildTemplatePrompt(
      template,
      language,
      context
    )

    if (!skipMessage) {
      this.focusChatTab()
      this._view?.webview.postMessage({
        type: EVENT_NAME.dappforgeOnLoading
      })
      this._view?.webview.postMessage({
        type: EVENT_NAME.dappforgeAddMessage,
        value: {
          completion: kebabToSentence(template) + '\n\n' + '```\n' + selection,
          data: getLanguage()
        }
      } as ServerMessage)
    }

    const systemMessage = {
      role: SYSTEM,
      content: await this._templateProvider?.readSystemMessageTemplate(
        this._promptTemplate
      )
    }

    const conversation: Message[] = [
      systemMessage,
      {
        role: USER,
        content: prompt
      }
    ]

    return conversation
  }

  public async streamTemplateCompletion(
    promptTemplate: string,
    context?: string,
    onEnd?: (completion: string) => void,
    skipMessage?: boolean
  ) {
    const messages = await this.getTemplateMessages(
      promptTemplate,
      context,
      skipMessage
    )
    const request = this.buildStreamRequest(messages)

    if (!request) return
    const { requestBody, requestOptions } = request
    return this.streamResponse({ requestBody, requestOptions, onEnd })
  }

  private updateConfig() {
    this._config = workspace.getConfiguration('dappforge')
    this._temperature = this._config.get('temperature', 0.2) as number
    this._keepAlive = this._config.get('keepAlive', '5m') as string | number
  }
}
