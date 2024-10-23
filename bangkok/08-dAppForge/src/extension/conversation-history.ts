import { ExtensionContext, WebviewView, workspace } from 'vscode'
import {
  ClientMessage,
  Conversation,
  Message,
  ServerMessage,
  RequestBodyBase,
  StreamRequestOptions,
  StreamResponse
} from '../common/types'
import { v4 as uuidv4 } from 'uuid'
import { createStreamRequestBody } from './provider-options'
import { DappforgeProvider } from './provider-manager'
import { streamResponse } from './stream'
import { getChatDataFromProvider, generateConversationTitle } from './utils'
import {
  ACTIVE_CHAT_PROVIDER_STORAGE_KEY,
  ACTIVE_CONVERSATION_STORAGE_KEY,
  CONVERSATION_EVENT_NAME,
  CONVERSATION_STORAGE_KEY,
  TITLE_GENERATION_PROMPT_MESAGE,
  ACTIVE_CONVERSATION_ID_STORAGE_KEY
} from '../common/constants'
import { SessionManager } from './session-manager'

type Conversations = Record<string, Conversation> | undefined

export class ConversationHistory {
  private _context: ExtensionContext
  private _webviewView: WebviewView
  private _config = workspace.getConfiguration('dappforge')
  private _keepAlive = this._config.get('keepAlive', '5m') as string | number
  private _temperature = this._config.get('temperature', 0.2) as number
  private _title = ''
  private _id = ''
  private _sessionManager: SessionManager

  constructor(
    context: ExtensionContext,
    webviewView: WebviewView,
    sessionManager: SessionManager
  ) {
    this._context = context
    this._webviewView = webviewView
    this._sessionManager = sessionManager
    this.setUpEventListeners()
    this.getNewConversationId()
  }

  setUpEventListeners() {
    this._webviewView.webview.onDidReceiveMessage(
      (message: ClientMessage<Conversation>) => {
        this.handleMessage(message)
      }
    )
  }

  handleMessage(message: ClientMessage<Conversation>) {
    const { type } = message
    switch (type) {
      case CONVERSATION_EVENT_NAME.getConversations:
        return this.getAllConversations()
      case CONVERSATION_EVENT_NAME.getActiveConversation:
        return this.getActiveConversation()
      case CONVERSATION_EVENT_NAME.setActiveConversation:
        return this.setActiveConversation(message.data)
      case CONVERSATION_EVENT_NAME.removeConversation:
        return this.removeConversation(message.data)
      case CONVERSATION_EVENT_NAME.saveConversation:
        if (!message.data) return
        return this.saveConversation(message.data)
      case CONVERSATION_EVENT_NAME.clearAllConversations:
        return this.clearAllConversations()
      default:
      // do nothing
    }
  }

  streamConversationTitle({
    requestBody,
    requestOptions
  }: {
    requestBody: RequestBodyBase
    requestOptions: StreamRequestOptions
    onEnd?: (completion: string) => void
  }): Promise<string> {
    const provider = this.getProvider()

    if (!provider) return Promise.resolve('')

    return new Promise((resolve, reject) => {
      try {
        return streamResponse({
          body: requestBody,
          options: requestOptions,
          onData: (streamResponse) => {
            const data = getChatDataFromProvider(
              provider.provider,
              streamResponse as StreamResponse
            )
            this._title = this._title + data
          },
          onEnd: () => {
            return resolve(this._title)
          }
        })
      } catch (e) {
        return reject(e)
      }
    })
  }

  private getProvider = () => {
    return this._context?.globalState.get<DappforgeProvider>(
      ACTIVE_CHAT_PROVIDER_STORAGE_KEY
    )
  }

  private buildStreamRequest(messages?: Message[]) {
    const provider = this.getProvider()

    if (!provider || !messages?.length) return

    const requestOptions: StreamRequestOptions = {
      hostname: provider.apiHostname,
      port: Number(provider.apiPort),
      path: provider.apiPath,
      protocol: provider.apiProtocol,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`
      }
    }

    const requestBody = createStreamRequestBody(provider.provider, {
      model: provider.modelName,
      numPredictChat: 100,
      temperature: this._temperature,
      messages: [
        ...messages,
        {
          role: 'user',
          content: TITLE_GENERATION_PROMPT_MESAGE
        }
      ],
      keepAlive: this._keepAlive
    })

    return { requestOptions, requestBody }
  }

  async getConversationTitle(): Promise<string> {  
    return generateConversationTitle()
    //const request = this.buildStreamRequest(messages)
    //if (!request) return ''
    //return await this.streamConversationTitle(request)
  }

  getAllConversations() {
    const conversations = this.getConversations() || {}
    this._webviewView.webview.postMessage({
      type: CONVERSATION_EVENT_NAME.getConversations,
      value: {
        data: conversations
      }
    })
  }

  getConversations(): Conversations {
    const conversations = this._context.globalState.get<
      Record<string, Conversation>
    >(CONVERSATION_STORAGE_KEY)
    return conversations
  }

  resetConversation() {
    this._context.globalState.update(ACTIVE_CONVERSATION_STORAGE_KEY, undefined)
    this.setActiveConversation(undefined)
    this.getNewConversationId()
  }

  updateConversation(conversation: Conversation) {
    const conversations = this.getConversations() || {}
    if (!conversation.id) return
    this._context.globalState.update(CONVERSATION_STORAGE_KEY, {
      ...conversations,
      [conversation.id]: conversation
    })
    this.setActiveConversation(conversation)
  }

  setActiveConversation(conversation: Conversation | undefined) {
    this._context.globalState.update(
      ACTIVE_CONVERSATION_STORAGE_KEY,
      conversation
    )
    if (!conversation) 
      this.getNewConversationId()
    else
      this.storeConversationId(conversation.id || '')
    this._webviewView?.webview.postMessage({
      type: CONVERSATION_EVENT_NAME.getActiveConversation,
      value: {
        data: conversation
      }
    } as ServerMessage<Conversation>)
    this.getAllConversations()
  }

  getActiveConversation() {
    const conversation: Conversation | undefined =
      this._context.globalState.get(ACTIVE_CONVERSATION_STORAGE_KEY)
    this.setActiveConversation(conversation)
    return conversation
  }

  removeConversation(conversation?: Conversation) {
    const conversations = this.getConversations() || {}
    if (!conversation?.id) return
    delete conversations[conversation.id]
    this._context.globalState.update(CONVERSATION_STORAGE_KEY, {
      ...conversations
    })
    this.setActiveConversation(undefined)
    this.getAllConversations()
  }

  clearAllConversations() {
    this._context.globalState.update(CONVERSATION_STORAGE_KEY, {})
    this.setActiveConversation(undefined)
  }

  async saveConversation(conversation: Conversation) {
    const activeConversation = this.getActiveConversation()
    if (activeConversation)
      return this.updateConversation({
        ...activeConversation,
        messages: conversation.messages
      })

    if (!conversation.messages.length || conversation.messages.length > 2)
      return

    //this._title = await this.getConversationTitle(conversation.messages)
    this._title = await this.getConversationTitle()
    this.saveConversationEnd(conversation)
  }

  private getNewConversationId() {
    this._id = uuidv4()
    this._context.globalState.update(ACTIVE_CONVERSATION_ID_STORAGE_KEY, this._id)    
  }

  private storeConversationId(id: string) {
    this._context.globalState.update(ACTIVE_CONVERSATION_ID_STORAGE_KEY, id)    
  }

  private saveConversationEnd(conversation: Conversation) {
    const id = this._id
    const conversations = this.getConversations()
    if (!conversations) return
    const newConversation: Conversation = {
      id,
      title: this._title || '',
      messages: conversation.messages
    }
    conversations[id] = newConversation
    this._context.globalState.update(CONVERSATION_STORAGE_KEY, conversations)
    this.setActiveConversation(newConversation)
    this._title = ''
  }
}
