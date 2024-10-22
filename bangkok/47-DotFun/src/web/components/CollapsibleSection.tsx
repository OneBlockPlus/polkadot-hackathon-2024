import { IconChevronRight } from '@tabler/icons-react'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { comicFont } from '@/utils/fonts'

export interface Props extends React.PropsWithChildren<{}> {
  header: string
}

export function CollapsibleSection({ children, header }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(comicFont.className, 'flex justify-between items-center py-2')}>
        <div className="text-xl font-bold">{header}</div>
        <CollapsibleTrigger asChild>
          <Button variant={'ghost'}>
            <IconChevronRight className={cn(' transition-all', isOpen && 'rotate-90')} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
