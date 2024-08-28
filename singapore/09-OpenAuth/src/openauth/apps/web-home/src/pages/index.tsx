import { Flow } from '@/components/home/Flow'
import GridPattern from '@/components/magicui/grid-pattern'
import { cn } from '@/utils/css'

export default function () {
  return (
    <div className="relative mx-auto max-w-6xl min-h-80vh flex-col-center gap-10">
      <div className="relative flex-col-center gap-8 text-center">
        <div className="text-6xl">Web3 Auth Service</div>
        <div className="text-xl">
          A free and open-source solution to add web2 & web3 authentication to your applications.
        </div>
      </div>
      <Flow />
      <GridPattern
        width={60}
        height={60}
        x={-1}
        y={-1}
        className={cn('[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-60')}
      />
    </div>
  )
}
