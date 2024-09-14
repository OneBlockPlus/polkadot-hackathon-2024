import { Popover } from '@heathmont/moon-core-tw';
import Card from '../Card';
import { OtherRocket } from '@heathmont/moon-icons-tw';
import GenerateTemplate from '../GenerateTemplate';
import Image from 'next/image';

const AiEnhanceButton = ({ isLoading, onGenerate }: { isLoading: boolean; onGenerate }) => (
  <Popover data-testid="popover" className="absolute top-1/2 right-[280px] z-10" position="left">
    <div className="flex">
      <Popover.Trigger data-testid="popover-trigger">
        <div className=" border border-beerus shadow-moon-md rounded-moon-i-xs bg-piccolo text-moon-40 p-2 text-white cursor-pointer">
          <Image src="/magic_wand.svg" height={40} width={40} alt="" />
        </div>
      </Popover.Trigger>
    </div>
    <Popover.Panel className="bg-none min-w-[460px]" data-testid="popover-panel">
      <Card className="w-full bg-gohan flex flex-col !p-0">
        <GenerateTemplate showClose={false} isLoading={isLoading} onGenerate={onGenerate} />
      </Card>
    </Popover.Panel>
  </Popover>
);

export default AiEnhanceButton;
