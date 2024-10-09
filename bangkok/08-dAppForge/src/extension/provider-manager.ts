import { ExtensionContext, WebviewView } from 'vscode'
import { apiProviders, ClientMessage, ServerMessage } from '../common/types'
import {
  ACTIVE_CHAT_PROVIDER_STORAGE_KEY,
  ACTIVE_FIM_PROVIDER_STORAGE_KEY,
  FIM_TEMPLATE_FORMAT,
  INFERENCE_PROVIDERS_STORAGE_KEY,
  PROVIDER_EVENT_NAME,
  WEBUI_TABS
} from '../common/constants'
import { v4 as uuidv4 } from 'uuid'

export interface DappforgeProvider {
  apiHostname: string
  apiPath: string
  apiPort: number
  apiProtocol: string
  id: string
  label: string
  modelName: string
  provider: string
  type: string
  apiKey?: string
  fimTemplate?: string
}

type Providers = Record<string, DappforgeProvider> | undefined

export class ProviderManager {
  _context: ExtensionContext
  _webviewView: WebviewView

  constructor(context: ExtensionContext, webviewView: WebviewView) {
    this._context = context
    this._webviewView = webviewView
    this.setUpEventListeners()
    this.addDefaultProviders()
  }

  setUpEventListeners() {
    this._webviewView.webview.onDidReceiveMessage(
      (message: ClientMessage<DappforgeProvider>) => {
        this.handleMessage(message)
      }
    )
  }

  handleMessage(message: ClientMessage<DappforgeProvider>) {
    const { data: provider } = message
    switch (message.type) {
      case PROVIDER_EVENT_NAME.addProvider:
        return this.addProvider(provider)
      case PROVIDER_EVENT_NAME.removeProvider:
        return this.removeProvider(provider)
      case PROVIDER_EVENT_NAME.updateProvider:
        return this.updateProvider(provider)
      case PROVIDER_EVENT_NAME.getActiveChatProvider:
        return this.getActiveChatProvider()
      case PROVIDER_EVENT_NAME.getActiveFimProvider:
        return this.getActiveFimProvider()
      case PROVIDER_EVENT_NAME.setActiveChatProvider:
        return this.setActiveChatProvider(provider)
      case PROVIDER_EVENT_NAME.setActiveFimProvider:
        return this.setActiveFimProvider(provider)
      case PROVIDER_EVENT_NAME.copyProvider:
        return this.copyProvider(provider)
      case PROVIDER_EVENT_NAME.getAllProviders:
        return this.getAllProviders()
      case PROVIDER_EVENT_NAME.resetProvidersToDefaults:
        return this.resetProvidersToDefaults()
    }
  }

  public focusProviderTab = () => {
    this._webviewView?.webview.postMessage({
      type: PROVIDER_EVENT_NAME.focusProviderTab,
      value: {
        data: WEBUI_TABS.providers
      }
    } as ServerMessage<string>)
  }

  getDefaultChatProvider() {
    return {
      apiHostname: '0.0.0.0',
      apiPath: '',
      apiPort: 123456,
      apiProtocol: 'websocket',
      label: 'dAppForge Chat',
      id: uuidv4(),
      modelName: 'dAppForgeChat',
      provider: apiProviders.dAppForge,
      type: 'chat'
    } as DappforgeProvider
  }

  getDefaultFimProvider() {
    return {
      apiHostname: '0.0.0.0',
      apiPath: '',
      apiPort: 123456,
      apiProtocol: 'websocket',
      fimTemplate: FIM_TEMPLATE_FORMAT.dappforge,
      label: 'dAppForge',
      id: uuidv4(),
      modelName: 'dAppForge',
      provider: apiProviders.dAppForge,
      type: 'fim'
    } as DappforgeProvider
  }
  
  addDefaultProviders() {
    this.addDefaultChatProvider()
    this.addDefaultFimProvider()
  }

  addDefaultChatProvider(): DappforgeProvider {
    const provider = this.getDefaultChatProvider()
    if (!this._context.globalState.get(ACTIVE_CHAT_PROVIDER_STORAGE_KEY)) {
      this.addDefaultProvider(provider)
    }
    return provider
  }

  addDefaultFimProvider(): DappforgeProvider {
    const provider = this.getDefaultFimProvider()
    if (!this._context.globalState.get(ACTIVE_FIM_PROVIDER_STORAGE_KEY)) {
      this.addDefaultProvider(provider)
    }
    return provider
  }

  addDefaultProvider(provider: DappforgeProvider): void {
    if (provider.type === 'chat') {
      this._context.globalState.update(
        ACTIVE_CHAT_PROVIDER_STORAGE_KEY,
        provider
      )
    } else if (provider.type === 'fim') {
      this._context.globalState.update(
        ACTIVE_FIM_PROVIDER_STORAGE_KEY,
        provider
      )
    }
    this.addProvider(provider)
  }

  getProviders(): Providers {
    const providers = this._context.globalState.get<
      Record<string, DappforgeProvider>
    >(INFERENCE_PROVIDERS_STORAGE_KEY)
    return providers
  }

  getAllProviders() {
    const providers = this.getProviders() || {}
    this._webviewView.webview.postMessage({
      type: PROVIDER_EVENT_NAME.getAllProviders,
      value: {
        data: providers
      }
    })
  }

  getActiveChatProvider() {
    const provider = this._context.globalState.get<DappforgeProvider>(
      ACTIVE_CHAT_PROVIDER_STORAGE_KEY
    )
    this._webviewView.webview.postMessage({
      type: PROVIDER_EVENT_NAME.getActiveChatProvider,
      value: {
        data: provider
      }
    })
    return provider
  }

  getActiveFimProvider() {
    const provider = this._context.globalState.get<DappforgeProvider>(
      ACTIVE_FIM_PROVIDER_STORAGE_KEY
    )
    this._webviewView.webview.postMessage({
      type: PROVIDER_EVENT_NAME.getActiveFimProvider,
      value: {
        data: provider
      }
    })
    return provider
  }

  setActiveChatProvider(provider?: DappforgeProvider) {
    if (!provider) return
    this._context.globalState.update(ACTIVE_CHAT_PROVIDER_STORAGE_KEY, provider)
    return this.getActiveChatProvider()
  }

  setActiveFimProvider(provider?: DappforgeProvider) {
    if (!provider) return
    this._context.globalState.update(ACTIVE_FIM_PROVIDER_STORAGE_KEY, provider)
    return this.getActiveFimProvider()
  }

  addProvider(provider?: DappforgeProvider) {
    const providers = this.getProviders() || {}
    if (!provider) return
    provider.id = uuidv4()
    providers[provider.id] = provider
    this._context.globalState.update(INFERENCE_PROVIDERS_STORAGE_KEY, providers)
    this.getAllProviders()
  }

  copyProvider(provider?: DappforgeProvider) {
    if (!provider) return
    provider.id = uuidv4()
    provider.label = `${provider.label}-copy`
    this.addProvider(provider)
  }

  removeProvider(provider?: DappforgeProvider) {
    const providers = this.getProviders() || {}
    if (!provider) return
    delete providers[provider.id]
    this._context.globalState.update(INFERENCE_PROVIDERS_STORAGE_KEY, providers)
    this.getAllProviders()
  }

  updateProvider(provider?: DappforgeProvider) {
    const providers = this.getProviders() || {}
    const activeFimProvider = this.getActiveFimProvider()
    const activeChatProvider = this.getActiveChatProvider()
    if (!provider) return
    providers[provider.id] = provider
    this._context.globalState.update(INFERENCE_PROVIDERS_STORAGE_KEY, providers)
    if (provider.id === activeFimProvider?.id)
      this.setActiveFimProvider(provider)
    if (provider.id === activeChatProvider?.id)
      this.setActiveChatProvider(provider)
    this.getAllProviders()
  }

  resetProvidersToDefaults(): void {
    this._context.globalState.update(INFERENCE_PROVIDERS_STORAGE_KEY, undefined)
    this._context.globalState.update(
      ACTIVE_CHAT_PROVIDER_STORAGE_KEY,
      undefined
    )
    this._context.globalState.update(ACTIVE_FIM_PROVIDER_STORAGE_KEY, undefined)
    const chatProvider = this.addDefaultChatProvider()
    const fimProvider = this.addDefaultFimProvider()
    this.focusProviderTab()
    this.setActiveChatProvider(chatProvider)
    this.setActiveFimProvider(fimProvider)
    this.getAllProviders()
  }
}
