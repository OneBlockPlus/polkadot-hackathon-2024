import { IconArrowsMaximize, IconArrowsMinimize, IconChevronDown } from '@tabler/icons-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { trpc } from '@/utils/trpc'
import { formatDate } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { SandpackLayout, SandpackProvider, SandpackThemeProvider } from '@codesandbox/sandpack-react'
import loadingAnimation from '@/assets/animation/code-building.json'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { comicFont } from '@/utils/fonts'
import { AppPreview } from './AppPreview'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type AppSandboxProps = {
  appId: string
  isEditMode?: boolean
  isCodeGenerating?: boolean
  onDebugApp?: (prompt: string) => void
}

const ErrorCatchScript = `
<script>
  window.onerror = (message, source, lineno, colno, error) => {
    console.error(message);
    return true;
  };
</script>
`

export default function AppSandbox({ appId, isCodeGenerating, isEditMode, onDebugApp }: AppSandboxProps) {
  const { data: commits, isLoading } = trpc.app.getAppCommits.useQuery(
    {
      appId,
    },
    {
      enabled: !!appId,
      select: (data) => [...data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())],
    },
  )
  const utils = trpc.useUtils()

  useEffect(() => {
    utils.app.getAppCommits.invalidate({ appId })
  }, [appId, isCodeGenerating, utils.app.getAppCommits])

  const [showFullScreen, setShowFullScreen] = useState(false)

  const appContent = useMemo(() => {
    if (!commits) {
      return null
    }
    return commits[0]?.code
  }, [commits])

  return (
    <motion.div
      layout
      className={cn('size-full px-2 py-2 bg-secondary rounded-md', showFullScreen && 'fixed inset-x-0 top-24 bottom-0')}
    >
      <motion.div className="flex flex-col gap-2 size-full" layout>
        <div className="flex justify-between py-1 items-center flex-shrink-0 px-4">
          <span className={cn(comicFont.className, 'font-bold text-xl')}>App Preview </span>
          <div className="flex gap-2 items-center">
            <DropdownMenu modal>
              <DropdownMenuTrigger
                className="border px-2 py-2 rounded-md text-sm  border-foreground/20"
                disabled={!commits || commits?.length === 0}
              >
                <div className="flex items-center gap-2">
                  <span className="">Version History</span>
                  <IconChevronDown />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {commits?.map((commit, index) => (
                  <DropdownMenuItem key={commit.id}>
                    <div className="flex items-center gap-2 px-1 max-w-80">
                      <img
                        className="size-20 rounded-md overflow-hidden shrink-0 object-cover"
                        src={commit.snapshot}
                        alt=""
                      />
                      <div className="flex flex-col">
                        <div className="py-1">Version {commits.length - index}</div>
                        <div className="text-xs text-foreground/60 py-1">
                          {formatDate(commit.createdAt, 'MM/dd/yyyy, hh:mm:ss a')}
                        </div>
                        <div className="text-xs line-clamp-3">{commit.prompt}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="border px-2 py-2 rounded-md text-sm  border-foreground/20 "
              onClick={() => setShowFullScreen((prev) => !prev)}
            >
              <div className="flex items-center gap-2">
                {showFullScreen ? <span>Exit Full Screen</span> : <span>View Full Screen</span>}
                {showFullScreen ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
              </div>
            </button>
          </div>
        </div>
        <div className="flex-grow bg-background relative">
          {appContent && (
            <SandpackProvider
              template="static"
              files={{
                '/index.html': {
                  code: `
                    ${appContent}
                    ${ErrorCatchScript}
                  `,
                },
              }}
              className={cn('h-full w-full')}
              options={{
                classes: {
                  'sp-wrapper': '!h-full !w-full',
                  'sp-stack': '!h-full !w-full',
                },
              }}
            >
              <SandpackThemeProvider>
                <SandpackLayout style={{ height: '100%' }}>
                  <AppPreview isEditMode={isEditMode} onDebugApp={onDebugApp} />
                </SandpackLayout>
              </SandpackThemeProvider>
            </SandpackProvider>
          )}

          {(isLoading || isCodeGenerating) && (
            <div className=" inset-0 absolute flex items-center justify-center z-10 bg-background">
              <Lottie animationData={loadingAnimation} className="size-1/2" loop />
            </div>
          )}
          {}
        </div>
      </motion.div>
    </motion.div>
  )
}
