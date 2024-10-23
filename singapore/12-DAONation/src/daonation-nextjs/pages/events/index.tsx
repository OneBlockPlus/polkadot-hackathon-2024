import Head from 'next/head';
import EventCard from '../../components/components/EventCard';
import { CharityEvent } from '../../data-model/event';
import useEnvironment from '../../contexts/EnvironmentContext';
import Loader from '../../components/components/Loader';
import EmptyState from '../../components/components/EmptyState';
import { ControlsPlus, SportDarts } from '@heathmont/moon-icons-tw';
import { useEffect, useState } from 'react';
import CreateEventModal from '../../features/CreateEventModal';
import DonateCoinToEventModal from '../../features/DonateCoinToEventModal';
import BuyTicketModal from '../../features/BuyTicketModal';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { toast } from 'react-toastify';
import { Button, Search } from '@heathmont/moon-core-tw';

export default function Events() {
  const [auctionEvents, setAuctionEvents] = useState<CharityEvent[]>([]);
  const [SelectedEventName, setSelectedEventName] = useState('Event');
  const [SelectedEventId, setSelectedEventId] = useState(0);
  const [SelectedEventRecieveWallet, setSelectedEventReceiveWallet] = useState('');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showDonateCoinModal, setShowDonateCoinModal] = useState(false);
  const [showBuyTicketModal, setShowBuyTicketModal] = useState(false);
  const [search, setSearch] = useState('');
  const [daoID, setDaoID] = useState(-1);
  const [loading, setLoading] = useState(true);

  const { isSubdomain, getCommunityBranding } = useEnvironment();
  const { api, userWalletPolkadot, userSigner, showToast, GetAllEvents } = usePolkadotContext();

  useEffect(() => {
    if (api && getCommunityBranding()?.polkadotReferenceId) {
      loadData();
    }
  }, [api, getCommunityBranding]);

  async function loadData() {
    let allEvents = await GetAllEvents();
    let currentEvents = allEvents.filter((e) => e?.daoId == getCommunityBranding().polkadotReferenceId);
    setDaoID(Number(getCommunityBranding().polkadotReferenceId));

    try {
      let eventArr = [];
      for (let i = 0; i < currentEvents.length; i++) {
        const elmEvent = currentEvents[i];
        eventArr.push(elmEvent);
      }

      setAuctionEvents(eventArr.reverse());
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }

  function openDonateCoinModal(eventid, eventName, eventWallet) {
    setSelectedEventId(eventid);
    setSelectedEventName(eventName);
    setSelectedEventReceiveWallet(eventWallet);

    setShowDonateCoinModal(true);
  }

  async function buyTicketHandle(eventid) {
    console.log('======================>Buying Ticket');
    const ToastId = toast.loading('Buying Ticket ...');

    async function onSuccess() {
      openBuyTicketModal(eventid);
    }

    try {
      const txs = [api._extrinsics.events.buyTicket(Number(window.userid), Number(eventid), Number(daoID), new Date().toLocaleDateString())];

      await api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Bought Ticket Successfully!', () => {
          onSuccess();
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  function openBuyTicketModal(SelectedEventId) {
    setSelectedEventId(SelectedEventId);
    setShowBuyTicketModal(true);
  }

  function openDonateNFTModal(eventid, eventName, eventWallet) {
    setSelectedEventId(eventid);
    setSelectedEventName(eventName);
    setSelectedEventReceiveWallet(eventWallet);
  }

  function openCreateEventModal() {
    setShowCreateEventModal(true);
  }

  function closeCreateEventModal(event) {
    if (event) {
      setShowCreateEventModal(false);
    }
  }

  return (
    <>
      <Head>
        <title>DAOnation - Events</title>
        <meta name="description" content="DAOnation - Events" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        {!isSubdomain() && (
          <div className="gap-8 flex flex-col w-full bg-gohan pt-10 pb-6 border-beerus border">
            <div className="container flex w-full justify-between">
              <div className="flex flex-col gap-1 overflow-hidden text-center w-full">
                <h1 className="text-moon-32 font-bold">All events</h1>
                <h3 className="text-trunks">Here you can find all ongoing charity events</h3>
              </div>
            </div>
          </div>
        )}
        {isSubdomain() && (
          <div className="flex justify-between items-center container !mt-10 !mb-4">
            <div className="ml-10 w-[240px]">
              <Search className="bg-white" onChangeOpen={() => {}} search={search} isOpen={false} onChangeSearch={setSearch}>
                <Search.Input>
                  <Search.Input.Icon className="text-trunks" />
                  <Search.Input.Input className="placeholder:text-trunks" placeholder="Search events" {...({ placeholder: 'Search events' } as any)} />
                </Search.Input>
              </Search>
            </div>
            <Button className="mr-10" iconLeft={<ControlsPlus />} onClick={openCreateEventModal}>
              Create event
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-8 container items-center pb-10">
          <Loader
            element={
              auctionEvents.length > 0 ? (
                auctionEvents.map((event, index) => <EventCard item={event} key={index} openDonateNFTModal={openDonateNFTModal} openDonateCoinModal={openDonateCoinModal} openBuyTicketModal={buyTicketHandle} />)
              ) : (
                <EmptyState buttonLabel="Create event" onButtonClick={openCreateEventModal} icon={<SportDarts className="text-moon-48" />} label="This charity doesn’t have any events yet." />
              )
            }
            width={720}
            height={236}
            many={3}
            loading={loading}
          />{' '}
        </div>{' '}
      </div>
      <CreateEventModal open={showCreateEventModal} onClose={closeCreateEventModal} daoId={daoID} />
      <DonateCoinToEventModal open={!!showDonateCoinModal} onClose={() => setShowDonateCoinModal(null)} eventid={SelectedEventId} eventName={SelectedEventName} recieveWallet={SelectedEventRecieveWallet} />
      <BuyTicketModal open={!!showBuyTicketModal} onClose={() => setShowBuyTicketModal(false)} event={auctionEvents.find((event) => Number(event.id) === Number(SelectedEventId))} />
    </>
  );
}
