import { defaultTemplates } from '../extension/templates'

export const EXTENSION_NAME = '@ext:dappforge.dappforge'
export const ASSISTANT = 'assistant'
export const USER = 'user'
export const DAPPFORGE = 'dappforge'
export const SYSTEM = 'system'
export const YOU = 'You'
export const EMPTY_MESAGE = 'Sorry, I don’t understand or an error occurred. Please try again.'
export const MODEL_ERROR = 'Sorry, something went wrong...'
export const OPENING_BRACKETS = ['[', '{', '(']
export const CLOSING_BRACKETS = [']', '}', ')']
export const OPENING_TAGS = ['<']
export const CLOSING_TAGS = ['</']
export const QUOTES = ['"', '\'', '`']
export const ALL_BRACKETS = [...OPENING_BRACKETS, ...CLOSING_BRACKETS] as const
export const BRACKET_REGEX = /^[()[\]{}]+$/
export const NORMALIZE_REGEX = /\s*\r?\n|\r/g
export const LINE_BREAK_REGEX = /\r?\n|\r|\n/g
export const QUOTES_REGEX = /["'`]/g
export const MAX_CONTEXT_LINE_COUNT = 200
export const SKIP_DECLARATION_SYMBOLS = ['=']
export const IMPORT_SEPARATOR = [',', '{']
export const SKIP_IMPORT_KEYWORDS_AFTER = ['from', 'as', 'import']
export const MIN_COMPLETION_CHUNKS = 2
export const MAX_EMPTY_COMPLETION_CHARS = 250
export const DEFAULT_RERANK_THRESHOLD = 0.5
export const STATUSBAR_ICON = '$(chip)' + 'dAppForge'
export const STATUSBAR_BUSY = '$(sync~spin)' + 'dAppForge'
export const STATUSBAR_NOT_AUTH = '$(sync-ignored)' + 'dAppForge' 
export const SERVER_PORT = 54021
export const API_USERNAME='dappforge-api-user'

export const defaultChunkOptions = {
  maxSize: 500,
  minSize: 50,
  overlap: 50
}

export const EVENT_NAME = {
  dappforgeAddMessage: 'dappforge-add-message',
  dappforgeAcceptSolution: 'dappforge-accept-solution',
  dappforgeChat: 'dappforge-chat',
  dappforgeChatMessage: 'dappforge-chat-message',
  dappforgeClickSuggestion: 'dappforge-click-suggestion',
  dappforgeEnableModelDownload: 'dappforge-enable-model-download',
  dappforgeFetchOllamaModels: 'dappforge-fetch-ollama-models',
  dappforgeGetConfigValue: 'dappforge-get-config-value',
  dappforgeGlobalContext: 'dappforge-global-context',
  dappforgeHideBackButton: 'dappforge-hide-back-button',
  dappforgeListTemplates: 'dappforge-list-templates',
  dappforgeManageTemplates: 'dappforge-manage-templates',
  dappforgeNewDocument: 'dappforge-new-document',
  dappforgeNotification: 'dappforge-notification',
  dappforgeErrorNotification: 'dappforge-error-notification',
  dappforgeOnCompletion: 'dappforge-on-completion',
  dappforgeOnEnd: 'dappforge-on-end',
  dappforgeOnLoading: 'dappforge-on-loading',
  dappforgeOpenDiff: 'dappforge-open-diff',
  dappforgeRerankThresholdChanged: 'dappforge-rerank-threshold-changed',
  dappforgeSendLanguage: 'dappforge-send-language',
  dappforgeSendLoader: 'dappforge-send-loader',
  dappforgeSendSystemMessage: 'dappforge-send-system-message',
  dappforgeSendTheme: 'dappforge-send-theme',
  dappforgeSessionContext: 'dappforge-session-context',
  dappforgeSetConfigValue: 'dappforge-set-config-value',
  dappforgeSetGlobalContext: 'dappforge-set-global-context',
  dappforgeSetOllamaModel: 'dappforge-set-ollama-model',
  dappforgeSetSessionContext: 'dappforge-set-session-context',
  dappforgeSetTab: 'dappforge-set-tab',
  dappforgeSetWorkspaceContext: 'dappforge-set-workspace-context',
  dappforgeStopGeneration: 'dappforge-stop-generation',
  dappforgeTextSelection: 'dappforge-text-selection',
  dappforgeWorkspaceContext: 'dappforge-workspace-context'
}

export const DAPPFORGE_COMMAND_NAME = {
  addTests: 'dappforge.aiAddTests',
  conversationHistory: 'dappforge.aiChatHistory',
  authenticate: 'dappforge.authenticate',
  disable: 'dappforge.disable',
  enable: 'dappforge.enable',
  explain: 'dappforge.aiExplain',
  focusSidebar: 'dappforge.sidebar.focus',
  generateDocs: 'dappforge.aiGenerateDocs',
  hideBackButton: 'dappforge.hideBackButton',
  manageProviders: 'dappforge.manageProviders',
  manageTemplates: 'dappforge.manageTemplates',
  newConversation: 'dappforge.aiNewChat',
  openChat: 'dappforge.aiOpenChat',
  addTypes: 'dappforge.aiAddTypes',
  refactor: 'dappforge.aiRefactor',
  settings: 'dappforge.settings',
  stopGeneration: 'dappforge.aiStopGeneration',
  templateCompletion: 'dappforge.templateCompletion',
  templates: 'dappforge.templates',
  inlineCompletionAccepted: 'dappforge.inlineCompletionAccepted'
}

export const CONVERSATION_EVENT_NAME = {
  clearAllConversations: 'dappforge.clear-all-conversations',
  getActiveConversation: 'dappforge.get-active-conversation',
  getConversations: 'dappforge.get-conversations',
  removeConversation: 'dappforge.remove-conversation',
  saveConversation: 'dappforge.save-conversation',
  saveLastConversation: 'dappforge.save-last-conversation',
  setActiveConversation: 'dappforge.set-active-conversation'
}

export const AUTHENTICATION_EVENT_NAME = {
  getAuthenticationState: 'dappforge.get-authentication-state',
  authenticate: 'dappforge.authenticate',
  logout: 'dappforge.logout',
  focusAuthenticationTab: 'dappforge.focus-authentication-tab',
  updateUser: 'dappforge-update-user'
}

export const PROVIDER_EVENT_NAME = {
  addProvider: 'dappforge.add-provider',
  copyProvider: 'dappforge.copy-provider',
  focusProviderTab: 'dappforge.focus-provider-tab',
  getActiveChatProvider: 'dappforge.get-active-provider',
  getActiveFimProvider: 'dappforge.get-active-fim-provider',
  getAllProviders: 'dappforge.get-providers',
  removeProvider: 'dappforge.remove-provider',
  resetProvidersToDefaults: 'dappforge.reset-providers-to-defaults',
  setActiveChatProvider: 'dappforge.set-active-chat-provider',
  setActiveFimProvider: 'dappforge.set-active-fim-provider',
  updateProvider: 'dappforge.update-provider'
}

export const ACTIVE_CONVERSATION_STORAGE_KEY = 'dappforge.active-conversation'
export const ACTIVE_CONVERSATION_ID_STORAGE_KEY = 'dappforge.active-conversation.id'
export const ACTIVE_CHAT_PROVIDER_STORAGE_KEY = 'dappforge.active-chat-provider'
export const ACTIVE_FIM_PROVIDER_STORAGE_KEY = 'dappforge.active-fim-provider'
export const CONVERSATION_STORAGE_KEY = 'dappforge.conversations'
export const INFERENCE_PROVIDERS_STORAGE_KEY = 'dappforge.inference-providers'
export const USER_STORAGE_KEY = 'dappforge.user'
export const WEBSOCKET_URI_STORAGE_KEY = 'dappforge.websocket.uri'

export const WORKSPACE_STORAGE_KEY = {
  autoScroll: 'autoScroll',
  chatMessage: 'chatMessage',
  downloadCancelled: 'downloadCancelled',
  selectedTemplates: 'selectedTemplates',
  selection: 'selection',
  showProviders: 'showProviders'
}

export const EXTENSION_SETTING_KEY = {
  apiProvider: 'apiProvider',
  apiProviderFim: 'apiProviderFim',
  chatModelName: 'chatModelName',
  fimModelName: 'fimModelName'
}

export const EXTENSION_CONTEXT_NAME = {
  dappforgeAuthentication: 'dappforgeAuthentication',
  dappforgeConversationHistory: 'dappforgeConversationHistory',
  dappforgeGeneratingText: 'dappforgeGeneratingText',
  dappforgeManageProviders: 'dappforgeManageProviders',
  dappforgeManageTemplates: 'dappforgeManageTemplates',
  dappforgeRerankThreshold: 'dappforgeRerankThreshold',
  dappforgeMaxChunkSize: 'dappforgeMaxChunkSize',
  dappforgeMinChunkSize: 'dappforgeMinChunkSize',
  dappforgeOverlapSize: 'dappforgeOverlapSize',
  dappforgeRelevantFilePaths: 'dappforgeRelevantFilePaths',
  dappforgeRelevantCodeSnippets: 'dappforgeRelevantCodeSnippets',
  dappforgeVectorSearchMetric: 'dappforgeVectorSearchMetric'
}

export const WEBUI_TABS = {
  chat: 'chat',
  history: 'history',
  providers: 'providers',
  settings: 'templates',
  authenticate: 'authenticate'
}

export const FIM_TEMPLATE_FORMAT = {
  automatic: 'automatic',
  codegemma: 'codegemma',
  codellama: 'codellama',
  codeqwen: 'codeqwen',
  custom: 'custom-template',
  deepseek: 'deepseek',
  llama: 'llama',
  stableCode: 'stable-code',
  starcoder: 'starcoder',
  dappforge: 'dappforge'
}

export const STOP_LLAMA = ['<EOT>']

export const STOP_DEEPSEEK = [
  '<｜fim▁begin｜>',
  '<｜fim▁hole｜>',
  '<｜fim▁end｜>',
  '<END>',
  '<｜end▁of▁sentence｜>'
]

export const STOP_STARCODER = ['<|endoftext|>', '<file_sep>']

export const STOP_CODEGEMMA = ['<|file_separator|>', '<|end_of_turn|>', '<eos>']

export const DEFAULT_TEMPLATE_NAMES = defaultTemplates.map(({ name }) => name)

export const DEFAULT_ACTION_TEMPLATES = [
  'add-tests',
  'refactor',
  'explain',
  'generate-docs'
]

export const DEFAULT_PROVIDER_FORM_VALUES = {
  apiHostname: '0.0.0.0',
  apiKey: '',
  apiPath: '',
  apiPort: 0,
  apiProtocol: 'websocket',
  id: '',
  label: '',
  modelName: '',
  name: '',
  provider: 'dappforge',
  type: 'chat'
}

export const TITLE_GENERATION_PROMPT_MESAGE = `
  Generate a title for this conversation in under 10 words.
  It should not contain any special characters or quotes.
`

export const WASM_LANGUAGES: { [key: string]: string } = {
  'php-s': 'php',
  bash: 'bash',
  c: 'c',
  cc: 'cpp',
  cjs: 'javascript',
  cpp: 'cpp',
  cs: 'c_sharp',
  css: 'css',
  cts: 'typescript',
  cxx: 'cpp',
  eex: 'embedded_template',
  el: 'elisp',
  elm: 'elm',
  emacs: 'elisp',
  erb: 'ruby',
  ex: 'elixir',
  exs: 'elixir',
  go: 'go',
  h: 'c',
  heex: 'embedded_template',
  hpp: 'cpp',
  htm: 'html',
  html: 'html',
  hxx: 'cpp',
  java: 'java',
  js: 'javascript',
  json: 'json',
  jsx: 'javascript',
  leex: 'embedded_template',
  lua: 'lua',
  mjs: 'javascript',
  ml: 'ocaml',
  mli: 'ocaml',
  mts: 'typescript',
  ocaml: 'ocaml',
  php: 'php',
  php3: 'php',
  php4: 'php',
  php5: 'php',
  php7: 'php',
  phps: 'php',
  phtml: 'php',
  py: 'python',
  pyi: 'python',
  pyw: 'python',
  ql: 'ql',
  rb: 'ruby',
  rdl: 'systemrdl',
  res: 'rescript',
  resi: 'rescript',
  rs: 'rust',
  sh: 'bash',
  toml: 'toml',
  ts: 'typescript',
  tsx: 'tsx',
  vue: 'vue'
}

export const DEFAULT_RELEVANT_FILE_COUNT = 10
export const DEFAULT_RELEVANT_CODE_COUNT = 5
export const DEFAULT_VECTOR_SEARCH_METRIC = 'l2'

export const MULTILINE_OUTSIDE = [
  'class_body',
  'class',
  'export',
  'identifier',
  'interface_body',
  'interface',
  'program'
]

export const MULTILINE_INSIDE = [
  'body',
  'export_statement',
  'formal_parameters',
  'function_definition',
  'named_imports',
  'object_pattern',
  'object_type',
  'object',
  'parenthesized_expression',
  'statement_block'
]

export const MULTILINE_TYPES = [...MULTILINE_OUTSIDE, ...MULTILINE_INSIDE]

export const MULTI_LINE_DELIMITERS = ['\n\n', '\r\n\r\n']

