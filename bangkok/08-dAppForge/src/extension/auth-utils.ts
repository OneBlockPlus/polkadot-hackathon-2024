import { workspace, window, commands, Uri, StatusBarItem } from 'vscode'
import { getContext } from './context'
import { 
    USER_STORAGE_KEY, 
    SERVER_PORT, API_USERNAME, 
    WEBSOCKET_URI_STORAGE_KEY, 
    ACTIVE_FIM_PROVIDER_STORAGE_KEY,
    STATUSBAR_ICON,
    STATUSBAR_NOT_AUTH,
    ACTIVE_CHAT_PROVIDER_STORAGE_KEY
 } from '../common/constants'
import { User, dAppForgeRequestTypes } from '../common/types'
import polka from 'polka'
import { updateGlobalState } from './global-state-manager'
import { Logger } from '../common/logger'
import { DappforgeProvider } from './provider-manager'
import { extractHostAndPort } from './utils'

const logger = new Logger()

export function isAuthenticated(): boolean {
    const user = getStoredUser();
    return user !== null && user !== undefined
}

export function hasTokensLeft(): boolean {
    const user = getStoredUser();
    if (user !== null && user !== undefined && user.tokenCount)
        return user.tokenCount > 0
    else
        return false
}
  
export function getStoredUser(): User | null | undefined {
    const context = getContext()
    let user: User | null | undefined = undefined
    if (context) user = context.globalState.get<User>(USER_STORAGE_KEY)
    return user
}

export function setStoredUser(user: User | undefined | null) {
    // Update using this function as we use it to monitor changes 
    // in globalStatus, we can then trigger a function to update the statusbar etc.
    updateGlobalState(USER_STORAGE_KEY, user)
    return getStoredUser()
}
  
export function getWebSocketUri(requestType: string): string | null | undefined {
    const context = getContext()
    let uri: string | null | undefined = undefined
    if (context) uri = context.globalState.get<string>(`${WEBSOCKET_URI_STORAGE_KEY}-${requestType}`)
    return uri
}

function setWebSocketUri(requestType: string, uri: string | undefined | null): string | null | undefined {
    const context = getContext()
    if (context) context.globalState.update(`${WEBSOCKET_URI_STORAGE_KEY}-${requestType}`, uri)
    return getWebSocketUri(requestType)
}

let app: polka.Polka | null = null
export const authenticate = async (fn?: () => void) => {
    const config = workspace.getConfiguration('dappforge')
    const apiBaseUrl = config.get('apiUri')

    if (app && app.server) { 
        app.server.close() 
    }

    app = polka()

    app.get('/auth/:id/:accessToken/:apiPassword', async (req, res) => {
        const { id, accessToken, apiPassword } = req.params
        if (!accessToken) {
            res.end('<h1>Failed to authenticate, something went wrong</h1>')
            return
        }
        logger.log(`-----> authenticate: received auth info from github id: ${id}`)
        const user: User = {
            id: id,
            accessToken: accessToken,
            apiPassword: apiPassword
        }
        setStoredUser(user)

        if (fn) { fn() }
  
        res.end('<h1>dAppForge authentication was successful, you can close this now</h1>')
  
        if (app && app.server) app.server.close()
        app = null
    })
  
    app.listen(SERVER_PORT, (err: Error) => {
        if (err) {
            window.showErrorMessage(err.message)
            logger.error(err)
        } else {
            commands.executeCommand(
                'vscode.open',
                Uri.parse(`${apiBaseUrl}/auth/github`)
            )
        }
    })
}

// Check github token is still active, retrieve user details as the same time
export const checkAuthenticationStatus = async (fn?: () => void) => {
    const config = workspace.getConfiguration('dappforge')
    const apiBaseUrl = config.get('apiUri')
    logger.log(`~~~~~> checkAuthenticationStatus apiBaseUrl: ${apiBaseUrl}`)
    const user: User | null | undefined = getStoredUser()
    if (!user) {
        if (fn) { fn() }
    } else {
        try {
            const response = await fetch(
                `${apiBaseUrl}/auth/check/${user.id}`,
                {
                    headers: {
                        authorization: `Basic ${getBasicAuthToken(user)}`,
                        'access-token': user.accessToken
                    }
                }
            );
            logger.log(`~~~~~> checkAuthenticationStatus: status: ${response.status}`)
            if (!response.ok || !response.body) {
                throw Error('dAppForge: Unable to connect to API');
            }
            const txt = await response.text()
            const data = JSON.parse(txt)
            logger.log(`<~~~~~ checkAuthenticationStatus json response: ${JSON.stringify(data, undefined, 2)}`)
            if (data && Object.prototype.hasOwnProperty.call(data, 'user') && Object.keys(data['user']).length > 0) {
                user.fullName = data['user']['fullName']
                user.tokenCount = Number(data['user']['tokenCount'])
                user.avatarUrl = data['user']['avatarUrl']
                user.email = data['user']['email']
                setStoredUser(user)
            } else {
                throw Error('dAppForge: Could not obtain user details from API')
            }
            if (data && 
                Object.prototype.hasOwnProperty.call(data, 'completionWebSocketUri') && data['completionWebSocketUri'].length > 0 &&
                Object.prototype.hasOwnProperty.call(data, 'chatWebSocketUri') && data['chatWebSocketUri'].length > 0 && 
                Object.prototype.hasOwnProperty.call(data, 'tokenCountWebSocketUri') && data['tokenCountWebSocketUri'].length > 0) {
                //if (getWebSocketUri() !== data['websocketuri']) {
                setWebSocketUri(dAppForgeRequestTypes.autocompletion, data['completionWebSocketUri'])
                logger.log(`<~~~~~ checkAuthenticationStatus autocompletion uri: ${data['completionWebSocketUri']}`)
                updateProviders(dAppForgeRequestTypes.autocompletion, data['completionWebSocketUri'])
                setWebSocketUri(dAppForgeRequestTypes.chat, data['chatWebSocketUri'])
                logger.log(`<~~~~~ checkAuthenticationStatus chat uri: ${data['chatWebSocketUri']}`)
                updateProviders(dAppForgeRequestTypes.chat, data['chatWebSocketUri'])
                setWebSocketUri(dAppForgeRequestTypes.reduceCount, data['tokenCountWebSocketUri'])
                logger.log(`<~~~~~ checkAuthenticationStatus token count uri: ${data['tokenCountWebSocketUri']}`)
                //}
            } else {
                throw Error('dAppForge: Could not obtain websocket URI from API')
            }
        } catch (e: unknown) {
            setStoredUser(undefined)
            window.showErrorMessage('Please login using GitHub');
            if (e instanceof Error) {
              logger.error(e)
            } else {
              logger.log(`-----> checkAuthenticationStatus: error: ${e}`)
            }
        } finally {
            if (fn) { fn() }
        }
    }
}

export function getBasicAuthToken(user: User): string | null {
    return Buffer.from(API_USERNAME + ':' + user.apiPassword).toString('base64')
}

export function updateStatusBar(statusBar: StatusBarItem) {
    if (isAuthenticated() && hasTokensLeft()) {
        statusBar.text = STATUSBAR_ICON;
        statusBar.tooltip = ''
    } else if (!isAuthenticated()) {
        statusBar.text = STATUSBAR_NOT_AUTH
        statusBar.tooltip = 'Please login via GitHub'
        //statusBar.command = DAPPFORGE_COMMAND_NAME.authenticate
    } else if (!hasTokensLeft()) {
        statusBar.text = STATUSBAR_NOT_AUTH
        statusBar.tooltip = 'You do not have enough AI tokens to make this request'
    }
}

export function updateTokenCount(count: number) {
    const user: User | null | undefined = getStoredUser()
    if (user) {
        user.tokenCount = count
    }
    setStoredUser(user)
}

function updateProviders(requestType: string, uri: string) {
    const context = getContext()
    if (context) {
        const fimProvider = context.globalState.get<DappforgeProvider>(
            ACTIVE_FIM_PROVIDER_STORAGE_KEY
        ) 
        const chatProvider = context.globalState.get<DappforgeProvider>(
            ACTIVE_CHAT_PROVIDER_STORAGE_KEY
        ) 
        const { host, port} = extractHostAndPort(uri)
        if (fimProvider && requestType == dAppForgeRequestTypes.autocompletion) {
            fimProvider.apiPath = uri
            fimProvider.apiHostname = host
            if (port) fimProvider.apiPort = port
            context.globalState.update(ACTIVE_FIM_PROVIDER_STORAGE_KEY, fimProvider)
        }
        if (chatProvider && requestType == dAppForgeRequestTypes.chat) {
            chatProvider.apiPath = uri
            chatProvider.apiHostname = host
            if (port) chatProvider.apiPort = port
            context.globalState.update(ACTIVE_CHAT_PROVIDER_STORAGE_KEY, chatProvider)
        }
    }
  }  