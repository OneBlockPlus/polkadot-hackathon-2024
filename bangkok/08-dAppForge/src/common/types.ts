import { InlineCompletionItem, InlineCompletionList } from 'vscode'
import { CodeLanguageDetails } from './languages'
import { ALL_BRACKETS } from './constants'

export interface RequestBodyBase {
  stream: boolean
  n_predict?: number
  temperature?: number
}

export interface RequestOptionsOllama extends RequestBodyBase {
  model: string
  keep_alive?: string | number
  messages?: Message[] | Message
  prompt: string
  options: Record<string, unknown>
}

export const dAppForgeRequestTypes = {
  autocompletion: 'ai-autocomplete',
  chat: 'ai-chat',
  reduceCount: 'ai-reducecount'
} as const

export interface RequestOptionsDappForge extends RequestBodyBase {
  accessToken: string
  authorization: string
  githubId: string
  request: { prefix_code?: string, kg_name: string, query?: string, session_id?: string }
  requestType: (typeof dAppForgeRequestTypes)[keyof typeof dAppForgeRequestTypes]
}


export interface StreamBodyOpenAI extends RequestBodyBase {
  messages?: Message[] | Message
  max_tokens: number
}

export interface PrefixSuffix {
  prefix: string
  suffix: string
}

export interface StreamResponse {
  status: number
  model: string
  created_at: string
  response: string
  content: string
  message: {
    content: string
  }
  done: boolean
  context: number[]
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  prompt_eval_duration: number
  eval_count: number
  eval_duration: number
  type? : string
  choices: [
    {
      text: string
      delta: {
        content: string
      }
    }
  ]
}

export interface LanguageType {
  language: CodeLanguageDetails
  languageId: string | undefined
}

export interface ClientMessage<T = string | boolean | Message[]> {
  data?: T
  type?: string
  key?: string
}

export interface ServerMessage<T = LanguageType> {
  type: string
  value: {
    completion: string
    data?: T
    error?: boolean
    errorMessage?: string
    type: string
  }
}
export interface Message {
  role: string
  content: string | undefined
  type?: string
  language?: LanguageType
  error?: boolean
}

export interface Conversation {
  id?: string
  title?: string
  messages: Message[]
}

export interface User {
  id: string;
  accessToken: string;
  apiPassword: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  tokenCount?: number;
}

export const Theme = {
  Light: 'Light',
  Dark: 'Dark',
  Contrast: 'Contrast'
} as const

export interface DefaultTemplate {
  systemMessage?: string
}

export interface TemplateData extends Record<string, string | undefined> {
  code: string
  systemMessage?: string
  language?: string
}

export interface FimTemplateData extends Record<string, string | undefined> {
  context: string
  fileName: string
  prefix: string
  suffix: string
  systemMessage: string
}

export interface ChatTemplateData {
  systemMessage?: string
  role: string
  messages: Message[]
  code: string
  language?: string
}

export type ThemeType = (typeof Theme)[keyof typeof Theme]

export interface FimPromptTemplate {
  context: string
  header: string
  prefixSuffix: PrefixSuffix
  fileContextEnabled: boolean
  language?: string
}

export interface ApiProviders {
  [key: string]: { fimApiPath: string; chatApiPath: string; port: number }
}

export type Bracket = (typeof ALL_BRACKETS)[number]

export interface StreamRequestOptions {
  hostname: string
  path: string
  port: string | number
  protocol: string
  method: string
  headers: Record<string, string>
}

export interface StreamRequest {
  body: RequestBodyBase | StreamBodyOpenAI | RequestOptionsDappForge
  options: StreamRequestOptions
  onEnd?: () => void
  onStart?: (controller: AbortController) => void
  onError?: (error: Error) => void
  onData: <T = StreamResponse>(streamResponse:  T) => void
}

export interface UiTabs {
  [key: string]: JSX.Element
}

export const apiProviders = {
  LiteLLM: 'litellm',
  LlamaCpp: 'llamacpp',
  LMStudio: 'lmstudio',
  Ollama: 'ollama',
  Oobabooga: 'oobabooga',
  OpenWebUI: 'openwebui',
  dAppForge: 'dappforge'
} as const

export interface ApiModel {
  parent_model: string
  format: string
  family: string
  parameter_size: string
  digest: string
  model: string
  modified_at: string
  name: string
  size: number
}

export interface ApiModels {
  models: ApiModel[]
}

export type ResolvedInlineCompletion =
  | InlineCompletionItem[]
  | InlineCompletionList
  | PromiseLike<
      InlineCompletionItem[] | InlineCompletionList | null | undefined
    >
  | null
  | undefined

export interface InteractionItem {
  keyStrokes: number | null | undefined
  lastVisited: number
  name: string | null | undefined
  sessionLength: number
  visits: number | null | undefined
  activeLines: {
    line: number
    character: number
  }[]
}

export interface InferenceProvider {
  apiBaseUrl?: string
  apiHostname?: string
  apiKey?: string
  apiPath?: string
  apiPort?: number
  apiProtocol?: string
  modelName?: string
  name: string
  type: (typeof apiProviders)[keyof typeof apiProviders]
}

export interface Peer {
  publicKey: Buffer;
  write: (value: string) => boolean;
  on: (key: string, cb: (data: Buffer) => void) => void;
  once: (key: string, cb: (data: Buffer) => void) => void;
  writable: boolean;
  key: string;
  discovery_key: string;
}

export interface InferenceRequest {
  key: string;
  messages: Message[];
}

export interface ChunkOptions {
  minSize: number
  maxSize: number
  overlap: number
}
