import { Button } from '@heathmont/moon-core-tw';
import { ControlsPlus } from '@heathmont/moon-icons-tw';
import { MouseEventHandler, ReactNode } from 'react';

const EmptyState = ({ icon, label, buttonLabel, onButtonClick }: { icon: ReactNode; label: string; buttonLabel?: string; onButtonClick?: MouseEventHandler }) => (
  <div className="flex flex-col mt-[126px] gap-5 text-trunks items-center">
    {icon}
    <p>{label}</p>
    {buttonLabel && (
      <Button iconLeft={<ControlsPlus />} onClick={onButtonClick}>
        {buttonLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
