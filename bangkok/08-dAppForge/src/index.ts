import {
  commands,
  ExtensionContext,
  languages,
  StatusBarAlignment,
  window,
  workspace
} from 'vscode'
import * as path from 'path'
import * as os from 'os'
import * as vscode from 'vscode'

import { CompletionProvider } from './extension/providers/completion'
import { SidebarProvider } from './extension/providers/sidebar'
import { SessionManager } from './extension/session-manager'
import {
  delayExecution
} from './extension/utils'
import { setContext } from './extension/context'
import {
  EXTENSION_CONTEXT_NAME,
  EXTENSION_NAME,
  EVENT_NAME,
  WEBUI_TABS,
  DAPPFORGE_COMMAND_NAME,
  USER_STORAGE_KEY,
  WORKSPACE_STORAGE_KEY,
  DEFAULT_ACTION_TEMPLATES
} from './common/constants'
import { TemplateProvider } from './extension/template-provider'
import {
  ClientMessage,
  ServerMessage
} from './common/types'
import { FileInteractionCache } from './extension/file-interaction'
import { GlobalStateWatcher } from './extension/event-emitter'
import { checkAuthenticationStatus } from './extension/auth-utils'


export async function activate(context: ExtensionContext) {
  setContext(context)
  const config = workspace.getConfiguration('dappforge')
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100)
  const templateDir = path.join(os.homedir(), '.dappforge/templates') as string
  const templateProvider = new TemplateProvider(templateDir)
  const fileInteractionCache = new FileInteractionCache()
  const sessionManager = new SessionManager()

  const sidebarProvider = new SidebarProvider(
    statusBar,
    context,
    templateDir,
    sessionManager,
  )

  const completionProvider = new CompletionProvider(
    statusBar,
    fileInteractionCache,
    templateProvider,
    context,
  )

  // Do some init of default values
  const isInitialized = context.globalState.get<boolean>('isInitialized', false)
  if (!isInitialized) {
    sidebarProvider.setWorkspaceContext({
      type: EVENT_NAME.dappforgeSetWorkspaceContext,
      key: WORKSPACE_STORAGE_KEY.selectedTemplates,
      data: DEFAULT_ACTION_TEMPLATES
    } as ClientMessage<string[]>)
    context.globalState.update('isInitialized', true)
  }

  templateProvider.init()

  context.subscriptions.push(
    languages.registerInlineCompletionItemProvider(
      { pattern: '**' },
      completionProvider
    ),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.enable, () => {
      statusBar.show()
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.disable, () => {
      statusBar.hide()
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.explain, () => {
      commands.executeCommand(DAPPFORGE_COMMAND_NAME.focusSidebar)
      delayExecution(() => sidebarProvider?.streamTemplateCompletion('explain'))
    }),
		commands.registerCommand(DAPPFORGE_COMMAND_NAME.inlineCompletionAccepted, () => {
			completionProvider.setAcceptedLastCompletion()
		}),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.refactor, () => {
      commands.executeCommand(DAPPFORGE_COMMAND_NAME.focusSidebar)
      delayExecution(() =>
        sidebarProvider?.streamTemplateCompletion('refactor')
      )
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.generateDocs, () => {
      commands.executeCommand(DAPPFORGE_COMMAND_NAME.focusSidebar)
      delayExecution(() =>
        sidebarProvider?.streamTemplateCompletion('generate-docs')
      )
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.addTests, () => {
      commands.executeCommand(DAPPFORGE_COMMAND_NAME.focusSidebar)
      delayExecution(() =>
        sidebarProvider?.streamTemplateCompletion('add-tests')
      )
    }),
    commands.registerCommand(
      DAPPFORGE_COMMAND_NAME.templateCompletion,
      (template: string) => {
        commands.executeCommand(DAPPFORGE_COMMAND_NAME.focusSidebar)
        delayExecution(() =>
          sidebarProvider?.streamTemplateCompletion(template)
        )
      }
    ),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.stopGeneration, () => {
      completionProvider.onError()
      sidebarProvider.destroyStream()
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.templates, async () => {
      await vscode.commands.executeCommand(
        'vscode.openFolder',
        vscode.Uri.file(templateDir),
        true
      )
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.manageProviders, async () => {
      commands.executeCommand(
        'setContext',
        EXTENSION_CONTEXT_NAME.dappforgeManageProviders,
        true
      )
      sidebarProvider.view?.webview.postMessage({
        type: EVENT_NAME.dappforgeSetTab,
        value: {
          data: WEBUI_TABS.providers
        }
      } as ServerMessage<string>)
    }),
    commands.registerCommand(
      DAPPFORGE_COMMAND_NAME.conversationHistory,
      async () => {
        commands.executeCommand(
          'setContext',
          EXTENSION_CONTEXT_NAME.dappforgeConversationHistory,
          true
        )
        sidebarProvider.view?.webview.postMessage({
          type: EVENT_NAME.dappforgeSetTab,
          value: {
            data: WEBUI_TABS.history
          }
        } as ServerMessage<string>)
      }
    ),
    commands.registerCommand(
      DAPPFORGE_COMMAND_NAME.authenticate,
      async () => {
        commands.executeCommand(
          'setContext',
          EXTENSION_CONTEXT_NAME.dappforgeAuthentication,
          true
        )
        sidebarProvider.view?.webview.postMessage({
          type: EVENT_NAME.dappforgeSetTab,
          value: {
            data: WEBUI_TABS.authenticate
          }
        } as ServerMessage<string>)
      }
    ),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.manageTemplates, async () => {
      commands.executeCommand(
        'setContext',
        EXTENSION_CONTEXT_NAME.dappforgeManageTemplates,
        true
      )
      sidebarProvider.view?.webview.postMessage({
        type: EVENT_NAME.dappforgeSetTab,
        value: {
          data: WEBUI_TABS.settings
        }
      } as ServerMessage<string>)
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.hideBackButton, () => {
      commands.executeCommand(
        'setContext',
        EXTENSION_CONTEXT_NAME.dappforgeManageTemplates,
        false
      )
      commands.executeCommand(
        'setContext',
        EXTENSION_CONTEXT_NAME.dappforgeConversationHistory,
        false
      )
      commands.executeCommand(
        'setContext',
        EXTENSION_CONTEXT_NAME.dappforgeManageProviders,
        false
      )
      commands.executeCommand(
        'setContext',
        EXTENSION_CONTEXT_NAME.dappforgeAuthentication,
        false
      )
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.openChat, () => {
      commands.executeCommand(DAPPFORGE_COMMAND_NAME.hideBackButton)
      sidebarProvider.view?.webview.postMessage({
        type: EVENT_NAME.dappforgeSetTab,
        value: {
          data: WEBUI_TABS.chat
        }
      } as ServerMessage<string>)
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.settings, () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        EXTENSION_NAME
      )
    }),
    commands.registerCommand(DAPPFORGE_COMMAND_NAME.newConversation, () => {
      sidebarProvider.conversationHistory?.resetConversation()
      sidebarProvider.view?.webview.postMessage({
        type: EVENT_NAME.dappforgeStopGeneration
      } as ServerMessage<string>)
      commands.executeCommand(DAPPFORGE_COMMAND_NAME.openChat)
    }),
    window.registerWebviewViewProvider('dappforge.sidebar', sidebarProvider),
    statusBar
  )

  context.subscriptions.push(
    workspace.onDidCloseTextDocument((document) => {
      const filePath = document.uri.fsPath
      fileInteractionCache.endSession()
      fileInteractionCache.delete(filePath)
    }),
    workspace.onDidOpenTextDocument((document) => {
      const filePath = document.uri.fsPath
      fileInteractionCache.startSession(filePath)
      fileInteractionCache.incrementVisits()
    }),
    workspace.onDidChangeTextDocument((e) => {
      const changes = e.contentChanges[0]
      if (!changes) return
      //const lastCompletion = completionProvider.lastCompletionText
      //const isLastCompltionMultiline = getLineBreakCount(lastCompletion) > 1
      //completionProvider.setAcceptedLastCompletion(
      //  !!(
      //    changes.text &&
      //    lastCompletion &&
      //    changes.text === lastCompletion &&
      //    isLastCompltionMultiline
      //  )
      //)
      const currentLine = changes.range.start.line
      const currentCharacter = changes.range.start.character
      fileInteractionCache.incrementStrokes(currentLine, currentCharacter)
    })
  )

  //window.onDidChangeTextEditorSelection(() => {
  //  completionProvider.abortCompletion()
  //  delayExecution(() => {
  //    completionProvider.setAcceptedLastCompletion(false)
  //  }, 200)
  //})

  // On change of config update setting values, also
  // handle statusbar visibility if enabled changed
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration('dappforge')) return
      sidebarProvider.updateConfig()
      completionProvider.updateConfig()
    })
  )

  // Monitor user data stored in globalState on change update status bar
  // display messages, lock down app if not authenticated
  GlobalStateWatcher.getInstance().onDidChangeGlobalState((key: string) => {
    if (key == USER_STORAGE_KEY) {
      sidebarProvider.userUpdated()
    }
  })  

  if (config.get('enabled')) statusBar.show() 

  // Update statusbar depeding on auth state
  checkAuthenticationStatus()
  sidebarProvider.userUpdated()
}
