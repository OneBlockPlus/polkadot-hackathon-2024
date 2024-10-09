import * as vscode from 'vscode'

import {
  getLanguage,
  getTextSelection,
  getTheme
} from '../utils'
import { getStoredUser, updateStatusBar } from '../auth-utils'
import {
  WORKSPACE_STORAGE_KEY,
  EVENT_NAME,
  DAPPFORGE_COMMAND_NAME,
  AUTHENTICATION_EVENT_NAME
} from '../../common/constants'
import { ChatService } from '../chat-service'
import {
  ClientMessage,
  Message,
  ApiModel,
  ServerMessage
} from '../../common/types'
import { TemplateProvider } from '../template-provider'
import { OllamaService } from '../ollama-service'
import { ProviderManager } from '../provider-manager'
import { AuthenticationManager } from '../authentication-manager'
import { ConversationHistory } from '../conversation-history'
import { SessionManager } from '../session-manager'
import { DiffManager } from '../diff'

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _config = vscode.workspace.getConfiguration('dappforge')
  private _context: vscode.ExtensionContext
  private _diffManager = new DiffManager()
  private _ollamaService: OllamaService | undefined = undefined
  private _sessionManager: SessionManager
  private _statusBar: vscode.StatusBarItem
  private _templateDir: string
  private _templateProvider: TemplateProvider
  public chatService: ChatService | undefined = undefined
  public conversationHistory: ConversationHistory | undefined = undefined
  public view?: vscode.WebviewView

  constructor(
    statusBar: vscode.StatusBarItem,
    context: vscode.ExtensionContext,
    templateDir: string,
    sessionManager: SessionManager
  ) {
    this._statusBar = statusBar
    this._context = context
    this._templateDir = templateDir
    this._sessionManager = sessionManager
    this._templateProvider = new TemplateProvider(templateDir)
    this._ollamaService = new OllamaService()
    return this
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView

    this.chatService = new ChatService(
      this._statusBar,
      this._templateDir,
      this._context,
      webviewView,
      this._sessionManager
    )

    this.conversationHistory = new ConversationHistory(
      this._context,
      this.view,
      this._sessionManager
    )

    new ProviderManager(this._context, this.view)

    new AuthenticationManager(this._context, this.view)

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context?.extensionUri]
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    vscode.window.onDidChangeTextEditorSelection(
      (event: vscode.TextEditorSelectionChangeEvent) => {
        const text = event.textEditor.document.getText(event.selections[0])
        webviewView.webview.postMessage({
          type: EVENT_NAME.dappforgeTextSelection,
          value: {
            type: WORKSPACE_STORAGE_KEY.selection,
            completion: text
          }
        })
      }
    )

    vscode.window.onDidChangeActiveColorTheme(() => {
      webviewView.webview.postMessage({
        type: EVENT_NAME.dappforgeSendTheme,
        value: {
          data: getTheme()
        }
      })
    })

    webviewView.webview.onDidReceiveMessage((message) => {
      const eventHandlers = {
        [EVENT_NAME.dappforgeAcceptSolution]: this.acceptSolution,
        [EVENT_NAME.dappforgeChatMessage]: this.streamChatCompletion,
        [EVENT_NAME.dappforgeClickSuggestion]: this.clickSuggestion,
        [EVENT_NAME.dappforgeFetchOllamaModels]: this.fetchOllamaModels,
        [EVENT_NAME.dappforgeGlobalContext]: this.getGlobalContext,
        [EVENT_NAME.dappforgeOpenDiff]: this.openDiff,
        [EVENT_NAME.dappforgeListTemplates]: this.listTemplates,
        [EVENT_NAME.dappforgeSetTab]: this.setTab,
        [DAPPFORGE_COMMAND_NAME.settings]: this.openSettings,
        [EVENT_NAME.dappforgeNewDocument]: this.createNewUntitledDocument,
        [EVENT_NAME.dappforgeNotification]: this.sendNotification,
        [EVENT_NAME.dappforgeErrorNotification]: this.sendErrorNotification,
        [EVENT_NAME.dappforgeSendLanguage]: this.getCurrentLanguage,
        [EVENT_NAME.dappforgeSendTheme]: this.getTheme,
        [EVENT_NAME.dappforgeSetGlobalContext]: this.setGlobalContext,
        [EVENT_NAME.dappforgeSetWorkspaceContext]: this.setWorkspaceContext,
        [EVENT_NAME.dappforgeTextSelection]: this.getSelectedText,
        [EVENT_NAME.dappforgeWorkspaceContext]: this.getDappforgeWorkspaceContext,
        [EVENT_NAME.dappforgeSetConfigValue]: this.setConfigurationValue,
        [EVENT_NAME.dappforgeGetConfigValue]: this.getConfigurationValue,
        [EVENT_NAME.dappforgeHideBackButton]: this.dappforgeHideBackButton,
        [EVENT_NAME.dappforgeSessionContext]: this.getSessionContext
      }
      eventHandlers[message.type as string]?.(message)
    })
  }

  public openSettings() {
    vscode.commands.executeCommand(DAPPFORGE_COMMAND_NAME.settings)
  }

  public setTab(tab: ClientMessage) {
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeSetTab,
      value: {
        data: tab as string
      }
    } as ServerMessage<string>)
  }

  public getConfigurationValue = (message: ClientMessage) => {
    if (!message.key) return
    const config = vscode.workspace.getConfiguration('dappforge')
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeGetConfigValue,
      value: {
        data: config.get(message.key as string),
        type: message.key
      }
    } as ServerMessage<string>)
  }

  public setConfigurationValue = (message: ClientMessage) => {
    if (!message.key) return
    const config = vscode.workspace.getConfiguration('dappforge')
    config.update(message.key, message.data, vscode.ConfigurationTarget.Global)
  }

  public fetchOllamaModels = async () => {
    try {
      const models = await this._ollamaService?.fetchModels()
      if (!models?.length) {
        return
      }
      this.view?.webview.postMessage({
        type: EVENT_NAME.dappforgeFetchOllamaModels,
        value: {
          data: models
        }
      } as ServerMessage<ApiModel[]>)
    } catch (e) {
      return
    }
  }

  public listTemplates = () => {
    const templates = this._templateProvider.listTemplates()
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeListTemplates,
      value: {
        data: templates
      }
    } as ServerMessage<string[]>)
  }

  public sendNotification = (message: ClientMessage) => {
    vscode.window.showInformationMessage(message.data as string)
  }

  public sendErrorNotification = (message: ClientMessage) => {
    vscode.window.showErrorMessage(message.data as string)
  }

  public clickSuggestion = (message: ClientMessage) => {
    vscode.commands.executeCommand(
      'dappforge.templateCompletion',
      message.data as string
    )
  }

  public streamChatCompletion = async (data: ClientMessage<Message[]>) => {
    this.chatService?.streamChatCompletion(data.data || [])
  }

  public async streamTemplateCompletion(template: string) {
    this.chatService?.streamTemplateCompletion(template)
  }

  public getSelectedText = () => {
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeTextSelection,
      value: {
        type: WORKSPACE_STORAGE_KEY.selection,
        completion: getTextSelection()
      }
    })
  }

  public openDiff = async (message: ClientMessage) => {
    await this._diffManager.openDiff(message)
  }

  public acceptSolution = async (message: ClientMessage) => {
    await this._diffManager.acceptSolution(message)
  }

  public createNewUntitledDocument = async (message: ClientMessage) => {
    const lang = getLanguage()
    const document = await vscode.workspace.openTextDocument({
      content: message.data as string,
      language: lang.languageId
    })
    await vscode.window.showTextDocument(document)
  }

  public getGlobalContext = (message: ClientMessage) => {
    const storedData = this._context?.globalState.get(
      `${EVENT_NAME.dappforgeGlobalContext}-${message.key}`
    )
    this.view?.webview.postMessage({
      type: `${EVENT_NAME.dappforgeGlobalContext}-${message.key}`,
      value: storedData
    })
  }

  public getTheme = () => {
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeSendTheme,
      value: {
        data: getTheme()
      }
    })
  }

  public getCurrentLanguage = () => {
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeSendLanguage,
      value: {
        data: getLanguage()
      }
    } as ServerMessage)
  }


  public getSessionContext = (data: ClientMessage) => {
    if (!data.key) return undefined
    this.view?.webview.postMessage({
      type: `${EVENT_NAME.dappforgeSessionContext}-${data.key}`,
      value: this._sessionManager.get(data.key)
    })
  }

  public setGlobalContext = (message: ClientMessage) => {
    this._context?.globalState.update(
      `${EVENT_NAME.dappforgeGlobalContext}-${message.key}`,
      message.data
    )
  }

  public getDappforgeWorkspaceContext = (message: ClientMessage) => {
    const storedData = this._context?.workspaceState.get(
      `${EVENT_NAME.dappforgeWorkspaceContext}-${message.key}`
    )
    this.view?.webview.postMessage({
      type: `${EVENT_NAME.dappforgeWorkspaceContext}-${message.key}`,
      value: storedData
    } as ServerMessage)
  }

  public setWorkspaceContext = <T>(message: ClientMessage<T>) => {
    const value = message.data
    this._context.workspaceState.update(
      `${EVENT_NAME.dappforgeWorkspaceContext}-${message.key}`,
      value
    )
    this.view?.webview.postMessage({
      type: `${EVENT_NAME.dappforgeWorkspaceContext}-${message.key}`,
      value
    })
  }

  public destroyStream = () => {
    this.chatService?.destroyStream()
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeStopGeneration
    })
  }

  public updateConfig() {
    const config = vscode.workspace.getConfiguration('dappforge')
    const enabled = config.get('enabled') 
    if (enabled === false) {
      this._statusBar.hide()
    } else {
      this._statusBar.show()
    }   
    this.view?.webview.postMessage({
      type: EVENT_NAME.dappforgeGetConfigValue,
      value: {
        type: 'enabled',
        data: enabled
      }
    })
  }

  public userUpdated() {
    updateStatusBar(this._statusBar)
    // Update user details with latest data if account tab open
    this.view?.webview.postMessage({
      type: AUTHENTICATION_EVENT_NAME.updateUser,
      value: {
        data: getStoredUser()
      }
    } as ServerMessage<string>)
  }

  private dappforgeHideBackButton() {
    vscode.commands.executeCommand(DAPPFORGE_COMMAND_NAME.hideBackButton)
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'out', 'sidebar.js')
    )

    const codiconCssUri = vscode.Uri.joinPath(
      this._context.extensionUri,
      'assets',
      'codicon.css'
    )

    const css = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'out', 'sidebar.css')
    )

    const codiconCssWebviewUri = webview.asWebviewUri(codiconCssUri)

    const nonce = getNonce()

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <link href="${codiconCssWebviewUri}" rel="stylesheet">
        <link href="${css}" rel="stylesheet">
        <meta charset="UTF-8">
				<meta
          http-equiv="Content-Security-Policy"
          content="default-src 'self' http://localhost:11434;
          img-src vscode-resource: https:;
          font-src vscode-webview-resource:;
          script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;"
        >
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sidebar</title>
        <style>
          body { padding: 10px }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`
  }
}

function getNonce() {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
