import { GenericLightningBolt } from '@heathmont/moon-icons-tw';
import { IdeaSuggestion } from '../../../data-model/idea-suggestion';

const IdeaSuggestionBox = ({ suggestion, className, onClick }: { suggestion: IdeaSuggestion; className?: string; onClick }) => {
  return (
    <div className={`rounded-moon-i-sm shadow-moon-sm flex border cursor-pointer bg-goku border-beerus gap-1 items-center p-2 flex-1 basis-[calc(33%-8px)] max-w-[33%] ${className}`} onClick={onClick}>
      <GenericLightningBolt className="text-moon-24 text-piccolo min-w-[24px]" />
      <p className="text-moon-14 text-trunks">{suggestion.title}</p>
    </div>
  );
};

export default IdeaSuggestionBox;
