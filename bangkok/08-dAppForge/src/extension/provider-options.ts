import { workspace } from 'vscode'
import { USER, MAX_EMPTY_COMPLETION_CHARS } from '../common/constants'
import {
  Message,
  RequestBodyBase,
  apiProviders,
  StreamBodyOpenAI,
  RequestOptionsOllama,
  RequestOptionsDappForge,
  User,
  dAppForgeRequestTypes
} from '../common/types'
import { getStoredUser, getBasicAuthToken } from './auth-utils'

export function createStreamRequestBody(
  provider: string,
  options: {
    temperature: number
    numPredictChat: number
    model: string
    messages?: Message[]
    keepAlive?: string | number,
    conversationId?: string
  }
): RequestBodyBase | RequestOptionsOllama | StreamBodyOpenAI | RequestOptionsDappForge {
  switch (provider) {
    case apiProviders.Ollama:
    case apiProviders.OpenWebUI:
      return {
        model: options.model,
        stream: true,
        messages: options.messages,
        keep_alive: options.keepAlive === '-1'
          ? -1
          : options.keepAlive,
        options: {
          temperature: options.temperature,
          num_predict: options.numPredictChat
        }
      }
    case apiProviders.dAppForge: {
      const user: User | null | undefined = getStoredUser()
      const config = workspace.getConfiguration('dappforge')
      const language: string = config.get('language') || ''
      let message: string | undefined = ''
      console.dir(options.messages)
      message = options.messages?.reverse().find(message => message.role === USER)?.content;
      if (user) {
        return {
          messages: options.messages,
          stream: true,
          accessToken: user.accessToken,
          authorization: `${getBasicAuthToken(user)}`,
          githubId: user.id,
          request: { query: prepareAIPrompt(message || '', 2000), kg_name: language, session_id: options.conversationId },
          requestType: dAppForgeRequestTypes.chat
        }
      } else {
        return {
          messages: options.messages,
          stream: true,
          temperature: options.temperature
        }
      }
    }
    case apiProviders.LiteLLM:
    default:
      return {
        model: options.model,
        stream: true,
        max_tokens: options.numPredictChat,
        messages: options.messages,
        temperature: options.temperature
      }
  }
}

export function createStreamRequestBodyFim(
  provider: string,
  prompt: string,
  options: {
    temperature: number
    numPredictFim: number
    model: string
    keepAlive?: string | number
  }
): RequestBodyBase | RequestOptionsOllama | StreamBodyOpenAI | RequestOptionsDappForge {
  switch (provider) {
    case apiProviders.Ollama:
    case apiProviders.OpenWebUI:
      return {
        model: options.model,
        prompt,
        stream: true,
        keep_alive: options.keepAlive === '-1'
          ? -1
          : options.keepAlive,
        options: {
          temperature: options.temperature,
          num_predict: options.numPredictFim
        }
      }
    case apiProviders.LMStudio:
      return {
        model: options.model,
        prompt,
        stream: true,
        temperature: options.temperature,
        n_predict: options.numPredictFim
      }
    case apiProviders.LlamaCpp:
    case apiProviders.Oobabooga:
      return {
        prompt,
        stream: true,
        temperature: options.temperature,
        n_predict: options.numPredictFim
      }
    case apiProviders.LiteLLM:
      return {
        messages: [{ content: prompt, role: USER }],
        model: options.model,
        stream: true,
        max_tokens: options.numPredictFim,
        temperature: options.temperature
      }
    case apiProviders.dAppForge: {
      const user: User | null | undefined = getStoredUser()
      const config = workspace.getConfiguration('dappforge')
      const language: string = config.get('language') || ''
      if (user) {
        return {
          prompt,
          stream: true,
          accessToken: user.accessToken,
          authorization: `${getBasicAuthToken(user)}`,
          githubId: user.id,
          request: { prefix_code: prepareAIPrompt(prompt), kg_name: language },
          requestType: dAppForgeRequestTypes.autocompletion
        }
      } else {
        return {
          prompt,
          stream: true,
          temperature: options.temperature,
          n_predict: options.numPredictFim,
        }
      }
    }
    default:
      return {
        prompt,
        stream: true,
        temperature: options.temperature,
        n_predict: options.numPredictFim
      }
  }
}

export function prepareAIPrompt(input: string, limit = MAX_EMPTY_COMPLETION_CHARS): string { 
  // Step 1: Trim the input to the last limit characters
  const trimmedInput = input.slice(-limit);
  
  // Step 2: Adjust the start to ensure it begins with a complete word
  const firstWordBoundary = trimmedInput.search(/\S/); // Find the first non-space character
  const adjustedInput = firstWordBoundary !== -1 ? trimmedInput.slice(firstWordBoundary) : trimmedInput;
  
  // Return the adjusted input
  return adjustedInput.trim();
}
