import { ExtensionContext, WebviewView } from 'vscode'
import { ClientMessage, User, ServerMessage } from '../common/types'
import {
  AUTHENTICATION_EVENT_NAME,
  WEBUI_TABS,
  EVENT_NAME
} from '../common/constants'
import { getStoredUser, setStoredUser, authenticate, checkAuthenticationStatus } from './auth-utils'

export class AuthenticationManager {
  _context: ExtensionContext
  _webviewView: WebviewView

  constructor(context: ExtensionContext, webviewView: WebviewView) {
    this._context = context
    this._webviewView = webviewView
    this.setUpEventListeners()
  }

  setUpEventListeners() {
    this._webviewView.webview.onDidReceiveMessage(
      async (message: ClientMessage<User>) => {
        await this.handleMessage(message); // Use await to handle async code
      }
    );
  }

  async handleMessage(message: ClientMessage<User>) {
    //const { data: user } = message
    switch (message.type) {
      case AUTHENTICATION_EVENT_NAME.getAuthenticationState:
        return await this.getAuthenticationStatus()
      case AUTHENTICATION_EVENT_NAME.authenticate:
        return await this.authenticate()
      case AUTHENTICATION_EVENT_NAME.logout:
        return this.logout()
      case AUTHENTICATION_EVENT_NAME.focusAuthenticationTab:
        return this.focusAuthenticationTab()
    }
  }

  public focusAuthenticationTab = () => {
    this._webviewView?.webview.postMessage({
      type: EVENT_NAME.dappforgeSetTab,
      value: {
        data: WEBUI_TABS.authenticate
      }
    } as ServerMessage<string>)
  }

  async getAuthenticationStatus() {
    // Retrieve user details at the same time check github token is still valid
    await checkAuthenticationStatus(() => {
      this._webviewView.webview.postMessage({
        type: AUTHENTICATION_EVENT_NAME.getAuthenticationState,
        value: {
          data: getStoredUser()
        }
      })})
  }

  async authenticate() {
    await authenticate(() => {
      this._webviewView.webview.postMessage({
        type: AUTHENTICATION_EVENT_NAME.authenticate,
        value: {
          data: getStoredUser()
        }
      })})
  }

  logout() {
    setStoredUser(undefined)
    this._webviewView.webview.postMessage({
      type: AUTHENTICATION_EVENT_NAME.logout
    })
  }

}
