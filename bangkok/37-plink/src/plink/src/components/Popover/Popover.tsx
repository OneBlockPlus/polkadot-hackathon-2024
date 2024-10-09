import * as Popover from '@radix-ui/react-popover'
import {ReactNode, useState} from 'react'

export default function Dropdown({
                                     children,
                                     content,
                                     className = ''
                                 }: { children: ReactNode, className?: string, content?: (close: any) => ReactNode }) {
    const [open, setOpen] = useState(false)

    return <Popover.Root open={open} onOpenChange={open => {setOpen(open)}}>
        <Popover.Trigger asChild>
            {children}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content
                className={`rounded bg-white shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade ${className}`}
                sideOffset={5}>
                <div>{!!content && content(() => {setOpen(false)})}</div>
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>
}
