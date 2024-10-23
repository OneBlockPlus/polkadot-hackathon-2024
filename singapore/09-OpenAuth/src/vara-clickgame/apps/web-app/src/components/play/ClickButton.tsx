import { useAtom } from 'jotai'

import { clickCountAtom } from '@/store'

export function ClickButton() {
  const [, setCount] = useAtom(clickCountAtom)

  const onClick = useCallback(() => {
    setCount((count) => count + 1)
  }, [setCount])

  return (
    <div className="mt-10 w-full flex-center px-16">
      <button
        onClick={onClick}
        className="h-12 w-full px-6 rounded-1 font-mosaic leading-loose tracking-widest text-black text-5xl flex-center bg-$primary active:bg-$primary/90 shadow-$primary shadow-md transition-colors"
      >
        VARA
      </button>
    </div>
  )
}
