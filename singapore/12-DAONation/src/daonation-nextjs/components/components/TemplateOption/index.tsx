import { GenericLightningBolt } from '@heathmont/moon-icons-tw';
import { MouseEventHandler } from 'react';

export const TemplateOption = ({ label, selected, className, onClick }: { label: string; selected?: boolean; className?: string; onClick?: MouseEventHandler }) => {
  return (
    <div className={`rounded-moon-i-sm shadow-moon-md bg-goku flex border cursor-pointer ${selected ? 'border-piccolo' : 'border-beerus'} gap-3 items-center p-2 flex-1 basis-[calc(50%-8px)] max-w-[50%] ${className}`} onClick={onClick}>
      <div className="flex gap-2 ">
        <GenericLightningBolt className={`text-moon-24 ${selected ? 'text-piccolo' : 'text-trunks'}`} />
        <h4 className={`${selected ? 'text-bulma' : 'text-trunks'}`}>{label}</h4>
      </div>
    </div>
  );
};

export default TemplateOption;
