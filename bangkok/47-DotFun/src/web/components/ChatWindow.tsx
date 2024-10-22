import { IconPaperclip, IconArrowNarrowUp, IconLoader } from '@tabler/icons-react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from './chat/chat-bubble'
import { ChatMessageList } from './chat/chat-message-list'
import { useState } from 'react'
import { ChatInput } from './chat/chat-input'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Commit } from '@/utils/types'

export type ChatWindowProps = {
  appId: string
  isGeneratingCode: boolean
  onCommit: (input: { appId: string; prompt: string }) => void
  isSending: boolean
  commits: Commit[]
  pendingCommit: {
    prompt: string
  }
}

export default function ChatWindow({
  appId,
  onCommit,
  isSending,
  isGeneratingCode,
  commits,
  pendingCommit,
}: ChatWindowProps) {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="size-full flex flex-col justify-center px-8">
      <div className="flex flex-grow py-4 w-full overflow-auto">
        <ChatMessageList className="flex h-full w-full flex-col gap-2">
          {commits &&
            commits.map((commit) => (
              <ChatBubble layout={'ai'} key={commit.id}>
                <ChatBubbleAvatar fallback="US" className="size-8 self-start mt-1" />
                <ChatBubbleMessage variant="sent" className="group relative py-1">
                  <div className="text-secondary-foreground">{'You'}</div>
                  <div className={cn('text-sm pb-6 pt-2', 'pb-2')}>{commit.prompt}</div>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
          {isSending && pendingCommit && (
            <ChatBubble layout={'ai'} key={pendingCommit.prompt}>
              <ChatBubbleAvatar fallback="US" className="size-8 self-start mt-1" />
              <ChatBubbleMessage variant="sent" className="group relative py-1">
                <div className="text-secondary-foreground">{'You'}</div>
                <div className={cn('text-sm pb-6 pt-2', 'pb-2')}>{pendingCommit.prompt}</div>
              </ChatBubbleMessage>
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="shrink-0 flex gap-2 items-center flex-col">
        <div className="w-full relative">
          <ChatInput
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here"
            className="h-32"
            disabled={isGeneratingCode}
            onKeyDown={(e) => {
              if (isGeneratingCode) {
                return
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                onCommit({ prompt: prompt, appId })
                setPrompt('')
                e.preventDefault()
              }
            }}
          />
          <Button
            disabled={isGeneratingCode}
            className="absolute right-2 bottom-2  bg-neon/80 hover:bg-neon"
            size={'icon'}
            onClick={() => {
              onCommit({ prompt: prompt, appId })
              setPrompt('')
            }}
          >
            {isGeneratingCode ? (
              <IconLoader className="animate-spin text-background" />
            ) : (
              <IconArrowNarrowUp className="text-background" />
            )}
          </Button>

          <Button className="absolute left-2 bottom-2" variant={'secondary'} size={'icon'}>
            <IconPaperclip className="text-foreground/60" />
          </Button>
        </div>

        <div className="text-foreground/60 text-sm">Version0 can make mistakes. Please use with discretion</div>
      </div>
    </div>
  )
}
