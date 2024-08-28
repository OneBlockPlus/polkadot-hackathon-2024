import { ControlsPlus, GenericLightningBolt } from '@heathmont/moon-icons-tw';
import Image from 'next/image';

const SuggestedImage = ({ image, className, onClick }: { image: string; className?: string; onClick }) => {
  return (
    <div className={`rounded-moon-i-xs flex border border-beerus items-center h-[120px] w-[180px] relative overflow-hidden ${className}`} onClick={onClick}>
      <Image src={image} alt="" style={{ objectFit: 'cover' }} fill />
      <div className="bg-piccolo rounded-moon-i-sm h-6 w-6 absolute cursor-pointer shadow-moon-sm flex justify-center items-center bottom-1 right-1">
        <ControlsPlus className="text-moon-20 text-gohan" />
      </div>
      <div className="bg-popo flex items-center gap-1 absolute top-1 left-1 p-1 pr-2 rounded-moon-i-xs">
        <GenericLightningBolt className="text-moon-14" />
        <span className="text-moon-9 font-bold">SUGGESTED</span>
      </div>
    </div>
  );
};

export default SuggestedImage;
