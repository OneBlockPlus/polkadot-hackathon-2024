import { Button, Tabs } from '@heathmont/moon-core-tw';
import { ControlsPlus, GenericEdit, GenericHome, GenericLightningBolt, GenericLogOut, GenericPlus, SportDarts } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EmptyState from '../../../components/components/EmptyState';
import GoalCard from '../../../components/components/GoalCard';
import Loader from '../../../components/components/Loader';
import { usePolkadotContext } from '../../../contexts/PolkadotContext';
import { Dao } from '../../../data-model/dao';
import CommunityFeed from '../../../features/CommunityFeed';
import CreateGoalModal from '../../../features/CreateGoalModal';
import MembersTable from '../../../features/MembersTable';
import TopCommunityMembers from '../../../features/TopCommunityMembers';
import CommunitySwitcher from '../../../features/CommunitySwitcher';
import EventCard from '../../../components/components/EventCard';
import CreateEventModal from '../../../features/CreateEventModal';
import DonateCoinToEventModal from '../../../features/DonateCoinToEventModal';
import DonateNFTModal from '../../../features/DonateNFTModal';
import { CharityEvent } from '../../../data-model/event';
import GenerateHomepageModal from '../../../features/GenerateHomepageModal';
import { CommunityService } from '../../../services/communityService';
import BuyTicketModal from '../../../features/BuyTicketModal';
import useEnvironment from '../../../contexts/EnvironmentContext';
import { toast } from 'react-toastify';

export default function DAO() {
  const [goalsList, setGoalsList] = useState([]);
  const { api, getUserInfoById, GetAllVotes, GetAllIdeas, GetAllJoined, GetAllGoals,userWalletPolkadot,userSigner,showToast, GetAllEvents } = usePolkadotContext();
  const [DaoURI, setDaoURI] = useState({ Title: '', Description: '', SubsPrice: null, Start_Date: '', End_Date: '', logo: '', wallet: '', typeimg: '', allFiles: [], isOwner: false, daoId: null, user_id: null, user_info: null, brandingColor: '', customUrl: '' } as Dao);

  const [daoId, setDaoID] = useState(-1);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showDonateCoinModal, setShowDonateCoinModal] = useState(false);
  const [showDonateNftModal, setShowDonateNFTModal] = useState(false);
  const [showBuyTicketModal, setShowBuyTicketModal] = useState(false);
  const [showGenerateHomepageModal, setShowGenerateHomepageModal] = useState(false);
  const [hasNoTemplate, setHasNoTemplate] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [JoinedID, setJoinedID] = useState(9999);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aboutTemplate, setAboutTemplate] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [AuctionEvents, setAuctionEvents] = useState<CharityEvent[]>([]);
  const [SelectedEventName, setSelectedEventName] = useState('Event');
  const [SelectedEventId, setSelectedEventId] = useState(0);
  const [SelectedEventRecieveWallet, setSelectedEventReceiveWallet] = useState('');

  const router = useRouter();
  const { isSubdomain } = useEnvironment();

  useEffect(() => {
    getDaoID();
    fetchData();
  }, [api, router, daoId]);

  useEffect(() => {
    (async function () {
      if (aboutTemplate != '' && window) {
        const { template } = await CommunityService.getByPolkadotReferenceId(daoId.toString());
        setAboutTemplate(template);
      }
    })();
  }, [aboutTemplate, tabIndex]);

  async function fetchData() {
    fetchDaoData();

    if (router.query.daoId) {
      fetchContractDataFull();
    }
  }

  function getDaoID() {
    const daoIdParam = router.query.daoId as string;

    if (!daoIdParam) {
      return;
    }
    setDaoID(Number(daoIdParam));
  }

  async function leaveCommunity() {
    setLeaving(true);

    try {
      router.push('/joined');

      setLeaving(false);
    } catch (error) {
      setLeaving(false);
    }
  }

  async function updateDaoData(dao_uri, template_html) {
    const daoURI = JSON.parse(dao_uri); //Getting dao URI

    setIsOwner(daoURI.properties?.user_id?.description.toString() === window?.userid?.toString() ? true : false);
    let user_info = await getUserInfoById(daoURI.properties?.user_id?.description);

    let allJoined = await GetAllJoined();
    let currentJoined = allJoined.filter((e) => e?.daoId == daoId.toString());
    let joinedInfo = currentJoined.filter((e) => e?.user_id.toString() == window.userid.toString());

    if (joinedInfo.length > 0) {
      setIsJoined(true);
      setJoinedID(joinedInfo[0].id);
    } else {
      setIsJoined(false);
      setJoinedID(9999);
    }

    setCommunityMembers(currentJoined);
    let daoURIShort = {
      ...daoURI,
      Title: daoURI.properties.Title.description,
      Description: daoURI.properties.Description.description,
      Start_Date: daoURI.properties.Start_Date.description,
      logo: daoURI.properties.logo.description,
      user_info: user_info,
      wallet: daoURI.properties.wallet.description,
      typeimg: daoURI.properties.typeimg.description,
      allFiles: daoURI.properties.allFiles.description,
      SubsPrice: daoURI.properties?.SubsPrice?.description,
      brandingColor: daoURI.properties?.brandingColor?.description,
      customUrl: daoURI.properties?.customUrl?.description,
      isOwner
    };

    setDaoURI(daoURIShort);
  }

  async function fetchDaoData() {
    setLoading(true);

    if (daoId !== undefined && daoId !== null && api && daoId != -1) {
      //Fetching data from Parachain
      if (api) {
        try {
          const element = await api._query.daos.daoById(Number(daoId));
          let daoURI = element['__internal__raw'].daoUri.toString();

          const { template } = await CommunityService.getByPolkadotReferenceId(daoId.toString());

          if (!template || template === '[object Object]') {
            setHasNoTemplate(true);
          } else {
            setAboutTemplate(template);
          }

          updateDaoData(daoURI, template);
        } catch (e) {}
      }
    }

    setLoading(false);
  }

  async function fetchContractDataFull() {
    setLoading(true);
    try {
      if (api && daoId !== undefined && daoId !== null) {
        //Load everything-----------

        let allGoals = await GetAllGoals();

        let currentGoals = allGoals.filter((e) => e?.daoId == daoId.toString());

        const arr = [];
        for (let i = 0; i < currentGoals.length; i++) {
          let goalElm = currentGoals[i];
          //All Ideas Count
          let allIdeas = await GetAllIdeas();
          let goalIdeas = allIdeas.filter((e) => e?.goalId.toString() == goalElm.goalId.toString());
          goalElm.ideasCount = goalIdeas.length;

          //All Votes Count
          let allIdeasVotes = await GetAllVotes();
          let goalvotes = allIdeasVotes.filter((e) => e?.goalId.toString() == goalElm.goalId.toString());
          goalElm.votesCount = goalvotes.length;

          arr.push(goalElm);
        }
        setGoalsList(arr.reverse());

        let allEvents = await GetAllEvents();
        let currentEvents = allEvents.filter((e) => e?.daoId == daoId);

        let eventArr = [];
        for (let i = 0; i < currentEvents.length; i++) {
          const elmEvent = currentEvents[i];
          eventArr.push(elmEvent);
        }
        setAuctionEvents(eventArr.reverse());

        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  function closeCreateGoalModal(event) {
    if (event) {
      setShowCreateGoalModal(false);
    }
  }

  function closeGenerateHomepageModal(event) {
    if (event) {
      setShowGenerateHomepageModal(false);
    }
  }

  function closeCreateEventModal(event) {
    if (event) {
      setShowCreateEventModal(false);
    }
  }

  function openCreateGoalModal() {
    setShowCreateGoalModal(true);
  }

  function openGenerateHomepageModal() {
    setShowGenerateHomepageModal(true);
  }

  function openCreateEventModal() {
    setShowCreateEventModal(true);
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
     
      openBuyTicketModal(eventid)

    }

    try {
      // Buy Ticket

      const txs = [api._extrinsics.events.buyTicket(Number(window.userid), Number(eventid), Number(daoId), new Date().toLocaleDateString())];

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

    setShowDonateNFTModal(true);
  }

  return (
    <>
      <Head>
        <title>Charity - {DaoURI.Title}</title>
        <meta name="description" content="DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`flex items-center flex-col gap-8 relative`}>
        {hasNoTemplate && (
          <div className="absolute h-full w-full top-0 left-0 bg-goku z-5 flex flex-col gap-4 justify-center items-center">
            <EmptyState icon={<GenericHome className="text-moon-48" />} label="This charity doesn’t have a homepage yet." />{' '}
            <div className="flex flex-col gap-2">
              <Button className="w-[220px]" iconLeft={<GenericLightningBolt />} onClick={openGenerateHomepageModal}>
                Generate homepage
              </Button>
              <Link href={`${daoId}/design`}>
                <Button className="w-[220px]" variant="secondary" iconLeft={<GenericPlus />}>
                  Start from scratch
                </Button>
              </Link>
            </div>
          </div>
        )}
        <div className={`gap-8 flex flex-col w-full bg-gohan pt-10 border-beerus border`}>
          <div className="container flex w-full justify-between relative">
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">Charity</h5>
              <CommunitySwitcher title={DaoURI.Title} daoId={daoId} />
              <h3 className="flex gap-2 whitespace-nowrap">
                <div className="flex">
                  Managed by&nbsp;
                  <a href={'/profile/' + DaoURI?.user_info?.id} className="truncate text-piccolo max-w-[220px]">
                    {DaoURI?.user_info?.fullName.toString()}
                  </a>
                </div>
                <div>•</div>
                <div>
                  <span className="text-hit font-semibold">DOT {DaoURI.SubsPrice}</span> p/month
                </div>
              </h3>
            </div>
            {!loading && DaoURI.Title && (
              <div className="flex flex-col gap-2 absolute top-0 right-0">
                {(isOwner || isJoined) && (
                  <>
                    <Button iconLeft={<ControlsPlus />} onClick={openCreateEventModal}>
                      Create event
                    </Button>
                    <Button variant="secondary" iconLeft={<ControlsPlus />} onClick={openCreateGoalModal}>
                      Create goal
                    </Button>
                  </>
                )}

                {isJoined && !isOwner && (
                  <Button onClick={leaveCommunity} iconLeft={<GenericLogOut />} variant="secondary" animation={leaving ? 'progress' : false}>
                    Leave
                  </Button>
                )}
                {isOwner && (
                  <Link href={`${daoId}/design`}>
                    <Button iconLeft={<GenericEdit />} variant="secondary" className="w-full">
                      Edit
                    </Button>
                  </Link>
                )}
                {/* {isOwner && (
                <Button iconLeft={<GenericDelete />} className="bg-dodoria" onClick={deleteDao}>
                  Delete
                </Button>
              )} */}
              </div>
            )}
          </div>
          <div className="container">
            <Tabs selectedIndex={tabIndex} onChange={setTabIndex}>
              <Tabs.List>
                <Tabs.Tab>About</Tabs.Tab>
                <Tabs.Tab>Feed</Tabs.Tab>
                <Tabs.Tab>Events ({AuctionEvents.length})</Tabs.Tab>
                <Tabs.Tab>Goals ({goalsList.length})</Tabs.Tab>
                <Tabs.Tab>Members ({communityMembers.length})</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </div>
        </div>
        {tabIndex === 0 && <div className="template-container container" dangerouslySetInnerHTML={{ __html: aboutTemplate }}></div>}
        {tabIndex === 1 && (
          <div className="container flex gap-6">
            <CommunityFeed communityName={DaoURI.Title} daoId={daoId} /> <TopCommunityMembers goals={goalsList} allJoined={communityMembers} daoId={daoId} />
          </div>
        )}
        {tabIndex === 2 && (
          <div className="flex flex-col gap-8 container items-center pb-10">
            <Loader
              element={
                AuctionEvents.length > 0 ? (
                  AuctionEvents.map((event, index) => <EventCard item={event} key={index} openDonateNFTModal={openDonateNFTModal} openDonateCoinModal={openDonateCoinModal} openBuyTicketModal={buyTicketHandle} />)
                ) : (
                  <EmptyState buttonLabel="Create event" onButtonClick={openCreateEventModal} icon={<SportDarts className="text-moon-48" />} label="This charity doesn’t have any events yet." />
                )
              }
              width={768}
              height={236}
              many={3}
              loading={loading}
            />{' '}
          </div>
        )}
        {tabIndex === 3 && (
          <div className="flex flex-col gap-8 container items-center pb-10">
            <Loader element={goalsList.length > 0 ? goalsList.map((listItem, index) => <GoalCard item={listItem} key={index} />) : <EmptyState buttonLabel="Create goal" onButtonClick={openCreateGoalModal} icon={<SportDarts className="text-moon-48" />} label="This charity doesn’t have any goals yet." />} width={768} height={236} many={3} loading={loading} />{' '}
          </div>
        )}
        {tabIndex === 4 && (
          <div className="flex flex-col gap-8 container items-center pb-10">
            <MembersTable allJoined={communityMembers} goals={goalsList} />
          </div>
        )}
      </div>

      <GenerateHomepageModal open={showGenerateHomepageModal} onClose={closeGenerateHomepageModal} item={DaoURI} />
      <CreateGoalModal open={showCreateGoalModal} onClose={closeCreateGoalModal} item={DaoURI} daoId={daoId.toString()} />
      <CreateEventModal open={showCreateEventModal} onClose={closeCreateEventModal} daoId={daoId} />
      <DonateCoinToEventModal open={!!showDonateCoinModal} onClose={() => setShowDonateCoinModal(null)} eventid={SelectedEventId} eventName={SelectedEventName} recieveWallet={SelectedEventRecieveWallet} />
      <DonateNFTModal daoid={daoId} open={!!showDonateNftModal} onClose={() => setShowDonateNFTModal(null)} eventid={SelectedEventId} eventName={SelectedEventName} />
      <BuyTicketModal open={!!showBuyTicketModal} onClose={() => setShowBuyTicketModal(false)} event={AuctionEvents.find((event) => Number(event.id) === Number(SelectedEventId))} />
    </>
  );
}
