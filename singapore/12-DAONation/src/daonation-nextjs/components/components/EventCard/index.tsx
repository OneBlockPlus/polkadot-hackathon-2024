import { Button } from '@heathmont/moon-core-tw';
import { ArrowsRightShort, GenericLoyalty, MediaMiceAlternative, ShopWallet, SportDarts } from '@heathmont/moon-icons-tw';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useEnvironment from '../../../contexts/EnvironmentContext';
import { CharityEvent } from '../../../data-model/event';
import Card from '../Card';

const EventCard = ({ item, className = '', openDonateCoinModal, openDonateNFTModal, openBuyTicketModal, preview }: { item: CharityEvent; preview?: boolean; className?: string; openDonateCoinModal?: (eventid, eventName, eventWallet) => void; openDonateNFTModal?: (eventid, eventName, eventWallet) => void; openBuyTicketModal?: (eventid) => void }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const { getCurrency } = useEnvironment();

  const isAuction = () => item.eventType === 'auction';
  const isLivestream = () => item.eventType === 'livestream';

  if (item?.Title == undefined || item?.Title === '') return <></>;

  return (
    <Card className={`max-w-[720px] ${className}`}>
      <div className="flex w-full">
        <div className="rounded-moon-s-md overflow-hidden flex justify-center items-center border border-beerus relative" style={{ position: 'relative', width: '188px', minWidth: '188px', height: '188px' }}>
          {<Image unoptimized={true} layout="fill" objectFit="cover" src={item.logo} onError={() => setShowPlaceholder(true)} alt="" />}
          {showPlaceholder && <SportDarts className="text-moon-48 text-trunks" />}
          <div className={`absolute text-moon-9 top-[6px] left-[6px] ${isAuction() ? 'bg-popo' : 'bg-piccolo'} text-gohan flex gap-1 items-center font-bold pl-1 pr-2 rounded-moon-s-xs`}>
            {isAuction() ? <GenericLoyalty className="text-moon-14" /> : <MediaMiceAlternative className="text-moon-14" />}
            {isAuction() ? 'NFT AUCTION' : 'LIVE'}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 relative px-5 text-moon-16">
          <p className="font-semibold text-moon-18">{item.Title}</p>
          {isAuction() && (
            <>
              <div>
                <p className="font-semibold text-moon-20 text-hit">
                  {getCurrency()} {item?.reached?.toString()}
                </p>
                <p>
                  reached of {getCurrency()} {item.Budget} goal
                </p>
              </div>
              <div>
                <p className="font-semibold text-moon-20 text-hit">{item?.amountOfNFTs}</p>
                <p>NFTs</p>
              </div>
            </>
          )}
          {isLivestream() && (
            <>
              <div>
                <p className="font-semibold text-moon-20 text-hit">{item.participantsCount}</p>
                <p>Participants</p>
              </div>
              <div>
                <p className="font-semibold text-moon-20 text-hit">
                  {item.ticketPrice} {getCurrency()}
                </p>
                <p>Per ticket</p>
              </div>
            </>
          )}
          <div className="absolute bottom-0 right-0 flex gap-2">
            {isAuction() && item.status !== 'ended' && !preview && (
              <>
                {/* <Button
                  variant="secondary"
                  iconLeft={<GenericLoyalty />}
                  onClick={() => {
                    openDonateNFTModal(item.eventId, item.Title, item.wallet);
                  }}
                >
                  Donate NFT
                </Button> */}
                <Button
                  variant="secondary"
                  iconLeft={<ShopWallet />}
                  onClick={() => {
                    openDonateCoinModal(item.eventId, item.Title, item.wallet);
                  }}
                >
                  Donate
                </Button>
              </>
            )}

            {isLivestream() && item.status !== 'ended' &&  (!item.boughtTicket && !item.isOwner ) && !preview && (
              <>
                <Button
                  variant="secondary"
                  iconLeft={<ShopWallet />}
                  onClick={() => {
                    openBuyTicketModal(item.eventId);
                  }}
                >
                  Buy ticket
                </Button>
              </>
            )}

            <Link href={`${location.pathname}/event/${item.eventId}`}>
              <Button iconLeft={<ArrowsRightShort />}>Go to event</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
