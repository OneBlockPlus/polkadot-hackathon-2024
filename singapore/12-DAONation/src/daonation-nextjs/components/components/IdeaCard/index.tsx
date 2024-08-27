import Image from 'next/legacy/image';
import { Idea } from '../../../data-model/idea';
import Card from '../Card';
import Link from 'next/link';
import { Button } from '@heathmont/moon-core-tw';
import { ArrowsRightShort, GenericIdea, ShopWallet } from '@heathmont/moon-icons-tw';
import { useState } from 'react';
import useEnvironment from '../../../contexts/EnvironmentContext';

const IdeaCard = ({ item, onClickVote, onClickDonate, preview, hideGoToButton, className }: { item: Idea; onClickVote?; onClickDonate?; preview?: boolean; hideGoToButton?: boolean; className?: string }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const { getCurrency } = useEnvironment();

  return (
    <Card className={`max-w-[720px] ${className}`}>
      <div className="flex w-full">
        <div className="rounded-moon-s-md overflow-hidden flex justify-center items-center border border-beerus" style={{ position: 'relative', width: '188px', minWidth: '188px', height: '188px' }}>
          {<Image unoptimized={true} layout="fill" objectFit="cover" src={item.logo} onError={() => setShowPlaceholder(true)} alt="" />}
          {showPlaceholder && <GenericIdea className="text-moon-48 text-trunks" />}
        </div>
        <div className="flex flex-1 flex-col gap-2 relative px-5 text-moon-16">
          <p className="font-semibold text-moon-18">{item.Title}</p>
          <div>
            <p className="font-semibold text-moon-20 text-hit">
              {getCurrency()} {Number(item.donation)}
            </p>
            <p>in donations</p>
          </div>
          <div>
            <p className="font-semibold text-moon-20 text-hit">{item.votes}</p>
            <p>Votes</p>
          </div>
          <div className="absolute bottom-0 right-0 flex gap-2">
            {/* {!item.isVoted && !preview && !item.isOwner && (
              <Button variant="secondary" iconLeft={<GenericHeart />} onClick={onClickVote}>
                Vote
              </Button>
            )} */}

            {!item.isOwner && !preview && (
              <Button variant="secondary" iconLeft={<ShopWallet />} onClick={onClickDonate}>
                Donate
              </Button>
            )}
            {!hideGoToButton && (
              <Link href={`${location.pathname}/ideas/${item.ideasId}`}>
                <Button iconLeft={<ArrowsRightShort />}>Go to idea</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IdeaCard;
