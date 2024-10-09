import { StreamRequest, RequestOptionsDappForge, dAppForgeRequestTypes, RequestBodyBase } from '../common/types'
import { logStreamOptions, safeParseJsonResponse } from './utils'
import { WebSocketHandler } from './websocket'
import { updateTokenCount, getWebSocketUri } from './auth-utils'
import { Logger } from '../common/logger'

const logger = new Logger()
let completionWebSocket: WebSocketHandler | undefined = undefined
let chatWebSocket: WebSocketHandler | undefined = undefined
let tokenCountWebSocket: WebSocketHandler | undefined = undefined

export async function completionAccepted(body: RequestBodyBase) {
  const websocket: WebSocketHandler = setupWebsocket(dAppForgeRequestTypes.reduceCount)
  const dAppForgeBody = body as RequestOptionsDappForge
  const websocketBody = {
    githubId: dAppForgeBody.githubId,
    requestType: dAppForgeRequestTypes.reduceCount,       
    request: '',
    authorization: dAppForgeBody.authorization,
    accessToken: dAppForgeBody.accessToken,
  }
  try {
    const response = await websocket?.sendRequest(websocketBody)
    if (typeof response === 'string') {
      if (response.length > 0) {
        logger.log(`------> response: ${response}`)
        const jsonResponse: {  status: number, response: {error?: string, tokenCount?: string } } = JSON.parse(response)
        if (jsonResponse.status != 200) {
          throw Error(jsonResponse.response.error)
        } else {
          updateTokenCount(Number(jsonResponse.response.tokenCount))  
        }
      }
    } else {
      throw new Error('Expected response to be of type string')
    }
  } catch(e) {
    if (e instanceof Error) {
      logger.error(e)
    } else {
      logger.log(`${e}`)
    }
  }
}

function setupWebsocket(requestType: string): WebSocketHandler {
  const url = getWebSocketUri(requestType) || ''
  let webSocket: WebSocketHandler | undefined = undefined

  if (requestType === dAppForgeRequestTypes.autocompletion) {
    if (!completionWebSocket) {
      completionWebSocket = new WebSocketHandler(url)
    }
    webSocket = completionWebSocket
  } else if (requestType === dAppForgeRequestTypes.chat) {
    if (!chatWebSocket) {
      chatWebSocket = new WebSocketHandler(url)
    }
    webSocket = chatWebSocket
  } else if (requestType === dAppForgeRequestTypes.reduceCount) {
    if (!tokenCountWebSocket) {
      tokenCountWebSocket = new WebSocketHandler(url)
    }
    webSocket = tokenCountWebSocket
  }
  
  if (!webSocket) throw Error('Unable to create websocket')

  if (webSocket && webSocket.getNewUrl() !== url) webSocket?.setNewUrl(url)

  return webSocket
}

export async function streamResponse(request: StreamRequest) {
  logStreamOptions(request)
  const { body, options, onData, onEnd, onError, onStart } = request
  const controller = new AbortController()
  const { signal } = controller
  let webSocket: WebSocketHandler | undefined = undefined

  try {
    if (options.protocol === 'websocket') {
      const dAppForgeBody = body as RequestOptionsDappForge
      const websocketBody = {
        githubId: dAppForgeBody.githubId,
        requestType: dAppForgeBody.requestType,       
        request: JSON.stringify(dAppForgeBody.request),
        authorization: dAppForgeBody.authorization,
        accessToken: dAppForgeBody.accessToken,
      }      
      logger.log(`~~~~~> streamResponse websocketBody: ${JSON.stringify(websocketBody)}`)
      webSocket = setupWebsocket(dAppForgeBody.requestType)

      onStart?.(controller)

      try {
        const response = await webSocket?.sendRequest(websocketBody, onData, onEnd)
        if (typeof response === 'string') {
          if (response.length > 0)
            logger.log(`<~~~~~ streamResponse response: ${response}`)            
            await processStreamResponse(response, onData, onError ?? (error => console.error(error)), signal) 
        } else {
          throw new Error('Expected response to be of type string')
        }
        controller.abort()
        onEnd?.()
      } catch (error) {
        controller.abort()
        console.error('WebSocket Error:', error)
        onError?.(new Error('WebSocket request failed: ' + error))
        onEnd?.()
      }
    } else {
      const url = `${options.protocol}://${options.hostname}:${options.port}${options.path}`
      const fetchOptions = {
        method: options.method,
        headers: options.headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      }

      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        throw new Error(`Server responded with status code: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Failed to get a ReadableStream from the response')
      }

      onStart?.(controller)
      
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader()

      await processFetchResponse(reader, onData, signal) // Reusing data processing logic

      controller.abort()
      onEnd?.()
    }
  } catch (error: unknown) {
    controller.abort()
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onEnd?.()
      } else {
        console.error('Fetch/WebSocket error:', error)
        onError?.(error)
      }
    }
  }
}

// Unified processing for WebSocket and fetch responses
async function processStreamResponse(
  response: string, 
  onData: (data: unknown) => void, 
  onError: (error: Error) => void,
  signal: AbortSignal
) {
  let buffer = ''

  try {
    buffer += response
    let position

    // Process lines (if data is newline-delimited)
    while (!signal.aborted && (position = buffer.indexOf('\n')) !== -1) {
      if (signal.aborted) break
      const line = buffer.substring(0, position)
      buffer = buffer.substring(position + 1)
      try {
        const json = safeParseJsonResponse(line) // Safely parse JSON
        if (json) {
          if (Number(json.status) !== 200) {
            const errorJson: {  status: number, response: {error?: string } } = JSON.parse(response)
            throw Error(`Status: ${errorJson.status} Error: ${errorJson.response.error}`)
          }
          onData(json) // Call onData for valid JSON data
        }
      } catch (e) {
        onError(new Error('Error parsing JSON data from event: ' + e))
      }
    }

    // Process any remaining data in the buffer (could be incomplete JSON)
    if (buffer) {
      try {
        const json = safeParseJsonResponse(buffer) // Safely parse JSON
        if (json) {
          if (Number(json.status) !== 200) {
            const errorJson: {  status: number, response: {error?: string } } = JSON.parse(response)
            throw Error(`Status: ${errorJson.status} Error: ${errorJson.response.error}`)
          }
          onData(json)
        }
      } catch (e) {
        onError(new Error((e as Error).message))
      }
    }
  } catch (error) {
    onError(new Error((error as Error).message))
  }
}

// Processing for Fetch reader responses
async function processFetchResponse(
  reader: ReadableStreamDefaultReader<string>, 
  onData: (data: unknown) => void, 
  signal: AbortSignal
) {
  let buffer = ''
  
  try {
    while (!signal.aborted) {
      if (signal.aborted) break
      const { done, value } = await reader.read()
      if (done) break

      buffer += value
      let position
      while ((position = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, position)
        buffer = buffer.substring(position + 1)

        try {
          const json = safeParseJsonResponse(line)
          if (json) onData(json)
        } catch (e) {
          throw new Error('Error parsing JSON data from event')
        }
      }
    }

    if (buffer) {
      try {
        const json = safeParseJsonResponse(buffer)
        onData(json)
      } catch (e) {
        throw new Error('Error parsing remaining buffer data')
      }
    }
  } catch (error) {
    throw new Error('Error processing fetch response.')
  }
}

