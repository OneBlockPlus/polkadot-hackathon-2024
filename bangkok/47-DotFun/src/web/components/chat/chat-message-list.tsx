import { cn } from '@/lib/utils'
import React from 'react'
import { ScrollArea } from '../ui/scroll-area'

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ children, className, ...props }, ref) => (
    // @ts-ignore
    <ScrollArea className={cn('flex h-full w-full flex-col gap-2', className)} ref={ref} {...props}>
      {children}
    </ScrollArea>
  ),
)

ChatMessageList.displayName = 'ChatMessageList'

export { ChatMessageList }
