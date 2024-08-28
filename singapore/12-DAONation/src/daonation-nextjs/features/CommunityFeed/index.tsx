import ActivityCard from '../../components/components/ActivityCard';
import { useEffect, useState } from 'react';
import { sortDateDesc } from '../../utils/sort-date';
import AddPostCard from '../../components/components/AddPostCard';
import CreatePostModal from '../CreatePostModal';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import Loader from '../../components/components/Loader';
import EmptyState from '../../components/components/EmptyState';
import { SportDarts } from '@heathmont/moon-icons-tw';
import DonateNFTModal from '../DonateNFTModal';
import DonateCoinToEventModal from '../DonateCoinToEventModal';

const CommunityFeed = ({ communityName, daoId }) => {
  const [loading, setLoading] = useState(false);
  const [Items, setItems] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [showDonateNftModal, setShowDonateNFTModal] = useState(false);
  const [showDonateCoinModal, setShowDonateCoinModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const { api, userInfo, GetAllFeeds } = usePolkadotContext();
  const [selectedAuctionEvent,setSelectedAuctionEvent] = useState({eventId:-1,eventName:"",wallet:""});


  async function fetchContractData() {
    setLoading(true);

    try {
      if (api) {
        let allFeeds = await GetAllFeeds();
        let currentFeeds = [];
        try {
          currentFeeds = allFeeds.filter((e) => e.data?.daoId == daoId);
        } catch (e) {
          currentFeeds = [];
        }

        setItems(sortDateDesc(currentFeeds, 'date'));

        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  function closeShowPostModal(event) {
    if (event) {
      setShowPostModal(false);
    }
  }
  function openDonateCoinModal(eventId, title, wallet) {
    let obj = {eventId:eventId,eventName:title,wallet:wallet}
    setSelectedAuctionEvent(obj);
    setShowDonateCoinModal(true)
  }
  function openDonateNFTModal(eventId, title, wallet) {
    let obj = {eventId:eventId,eventName:title,wallet:wallet}
    setSelectedAuctionEvent(obj);
    setShowDonateNFTModal(true);
  }

  function closeDonateNFTModal(event) {
    if (event) {
      setShowDonateNFTModal(false);
    }
  }
  
  function closeDonateCoinModal(event) {
    if (event) {
      setShowDonateCoinModal(false);
    }
  }

  useEffect(() => {
    setAvatarUrl(userInfo.imgIpfs);
    setUserName(userInfo.fullName?.toString());
  }, [userInfo]);

  useEffect(() => {
    fetchContractData();
  }, [api, daoId]);

  return (
    <div className="flex flex-col gap-2 w-full items-center pb-10 min-w-[540px]">
      <AddPostCard avatarUrl={avatarUrl} onClick={() => setShowPostModal(true)} />
      <Loader element={Items.length > 0 ? Items.map((item, index) => <ActivityCard key={index} old_date={item.date} type={item.type} data={item.data} openDonateNFTModal={openDonateNFTModal} openDonateCoinModal={openDonateCoinModal} ></ActivityCard>) : <EmptyState icon={<SportDarts className="text-moon-48" />} label="There are no posts in the feed yet." />} width={540} height={120} many={3} loading={loading} />
      <CreatePostModal onClose={closeShowPostModal} show={showPostModal} avatarUrl={avatarUrl} userName={userName} communityName={communityName} />
      <DonateNFTModal daoid={daoId} open={showDonateNftModal} onClose={closeDonateNFTModal} eventid={selectedAuctionEvent.eventId} eventName={selectedAuctionEvent.eventName} />
      <DonateCoinToEventModal open={showDonateCoinModal} onClose={closeDonateCoinModal} eventName={selectedAuctionEvent.eventName} eventid={selectedAuctionEvent.eventId} recieveWallet={selectedAuctionEvent.wallet} />
  
    </div>
    
  );
};

export default CommunityFeed;
