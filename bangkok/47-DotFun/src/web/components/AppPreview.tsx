import { SandpackPreview, useSandpackConsole } from '@codesandbox/sandpack-react'
import { useMemo } from 'react'
import { Button } from './ui/button'

type Props = {
  isEditMode?: boolean
  onDebugApp?: (prompt: string) => void
}
export function AppPreview({ isEditMode, onDebugApp }: Props) {
  const { logs } = useSandpackConsole({
    resetOnPreviewRestart: true,
    showSyntaxError: true,
  })
  const { showErrorOverlay, errorMessage } = useMemo(() => {
    const showErrorOverlay = isEditMode && !!logs.filter((log) => log.method === 'error').length
    const errorMessage = logs
      .filter((log) => log.method === 'error')
      .at(-1)
      ?.data?.join(' ')
    return {
      showErrorOverlay,
      errorMessage,
    }
  }, [logs, isEditMode])
  return (
    <div className="w-full h-full relative">
      {showErrorOverlay && (
        <div className="absolute inset-0 z-10 bg-primary/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-full flex items-center justify-center flex-col gap-2">
            <div className="text-lg">Detected Runtime Exceptions</div>
            <div className=" text-orange-500">{errorMessage}</div>
          </div>
          <Button
            variant={'ghost'}
            className="underline "
            onClick={() => {
              onDebugApp?.('The app throw runtime exception:' + errorMessage)
            }}
          >
            Debug the app
          </Button>
        </div>
      )}
      <SandpackPreview
        className="size-full [&>*:first-child]:h-full"
        showNavigator={false}
        showRestartButton={false}
        showSandpackErrorOverlay
        showOpenInCodeSandbox={true}
        showRefreshButton={false}
        showOpenNewtab={false}
      />
    </div>
  )
}
