import { useEffect, useState } from 'react'
import { Chat } from './chat'
import { ServerMessage } from '../common/types'
import { EVENT_NAME, WEBUI_TABS } from '../common/constants'
import { ConversationHistory } from './conversation-history'
import { Authentication } from './authenticate'
import { useAuthentication } from './hooks'
import { Settings } from './settings'
  
const tabs: Record<string, JSX.Element> = {
  [WEBUI_TABS.authenticate]: <Authentication />,
  [WEBUI_TABS.chat]: <Chat />,
  [WEBUI_TABS.settings]: <Settings />,
  //[WEBUI_TABS.providers]: <Providers />
}

export const Main = () => {  
  const {completed, user} = useAuthentication()
  const [tab, setTab] = useState<string | undefined>(WEBUI_TABS.chat)

  const handler = (event: MessageEvent) => {
    const message: ServerMessage<string | undefined> = event.data
    if (message?.type === EVENT_NAME.dappforgeSetTab) {
      setTab(message?.value.data)
    }
   }

  useEffect(() => {
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (completed && !user && tab !== WEBUI_TABS.authenticate) {
      setTab(WEBUI_TABS.authenticate);
    }
  }, [completed, user, tab]); 

  if (!completed) {
    return <div>Loading...</div>; // Display a loading indicator while checking authentication
  }

  //getUser()
  //if (!user) return tabs[WEBUI_TABS.authenticate]

  if (!tab) {
    return null
  }

  if (tab === WEBUI_TABS.history) {
    return <ConversationHistory onSelect={() => setTab(WEBUI_TABS.chat)} />
  }

  const element: JSX.Element = tabs[tab]

  return element || null
}
