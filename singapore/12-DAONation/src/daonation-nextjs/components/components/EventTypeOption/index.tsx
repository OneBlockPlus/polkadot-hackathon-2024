import { MouseEventHandler } from 'react';

export const EventTypeOption = ({ icon, label, description, selected, className, onClick }: { icon: JSX.Element; label: string; description?: string; selected?: boolean; className?: string; onClick?: MouseEventHandler }) => {
  return (
    <div className={`rounded-moon-i-xs shadow-moon-sm flex border cursor-pointer ${selected ? 'border-piccolo' : 'border-beerus'} gap-3 items-center px-4 py-6 flex-1 basis-[calc(50%-8px)] max-w-[50%] ${className}`} onClick={onClick}>
      <div className={`relative flex items-center justify-center min-w-[16px] w-4 h-4 aspect-square m-1 rounded-full border transition-colors ${selected ? 'after:absolute after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:transition-all after:w-2 after:h-2 border-piccolo after:bg-piccolo' : 'border-trunks'}`}></div>
      <div className="flex flex-col">
        <h4>{label}</h4>
        <p className="text-moon-14 text-trunks">{description}</p>
      </div>
      <div className={selected ? 'text-piccolo' : 'text-trunks'}>{icon}</div>
    </div>
  );
};

export default EventTypeOption;
