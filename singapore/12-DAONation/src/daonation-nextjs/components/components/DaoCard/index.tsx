import Image from 'next/legacy/image';
import Card from '../Card';
import { Dao } from '../../../data-model/dao';
import { Button } from '@heathmont/moon-core-tw';
import { ArrowsRightShort, ControlsPlus, GenericUsers } from '@heathmont/moon-icons-tw';
import Link from 'next/link';
import { MouseEventHandler, useState } from 'react';

const DAOCard = ({ item, onJoinCommunity, hasJoined, className }: { item: Dao; onJoinCommunity?: MouseEventHandler; hasJoined: boolean; className?: string }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  // Format the duration
  let formattedDuration = '';
  let hasAlreadyPast = true;

  return (
    <Card className={`${className} max-w-[720px] flex flex-col gap-4 relative`}>
      <div className="flex w-full">
        <div className="rounded-moon-s-md overflow-hidden flex justify-center items-center border border-beerus relative w-[80px] h-[80px] sm:w-[180px] sm:h-[180px]">
          {!showPlaceholder && <Image unoptimized={true} layout="fill" objectFit="contain" src={item.logo} onError={() => setShowPlaceholder(true)} alt="" />}
          {showPlaceholder && <GenericUsers className="text-moon-48 text-trunks" />}
        </div>
        <div className="flex flex-1 flex-col gap-2 relative px-5 text-moon-16">
          <p className="font-semibold text-moon-18">{item.Title}</p>
          <p>Subscription of DOT {item.SubsPrice} p/month</p>
          <p className="hidden sm:inline-block">
            Managed by{' '}
            <a href={'/profile/' + item?.user_info?.id?.toString()} className="text-piccolo">
              @{item?.user_info?.fullName.toString()}
            </a>
          </p>
          {!hasAlreadyPast ? <p className="text-hit font-bold">Opens in {formattedDuration}</p> : <p className="text-hit font-bold">Opened</p>}
        </div>
      </div>
      {hasJoined && (
        <Link href={`${location.protocol}//${item.customUrl}.${location.host}/daos/${item.daoId}`}>
          <Button className="sm:absolute sm:bottom-6 sm:right-6 w-full sm:w-auto" iconLeft={<ArrowsRightShort />}>
            Go to charity
          </Button>
        </Link>
      )}
      {!hasJoined && (
        <Button className="sm:absolute sm:bottom-6 sm:right-6" iconLeft={<ControlsPlus />} onClick={onJoinCommunity}>
          Join
        </Button>
      )}
    </Card>
  );
};

export default DAOCard;
