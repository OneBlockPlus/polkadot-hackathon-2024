import { useEffect, useState } from 'react';

import { Avatar, Button, IconButton, Tabs } from '@heathmont/moon-core-tw';
import { ControlsExpandAlt, FilesGeneric, SoftwareLogOut } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import SummaryPanel from '../../features/SummaryPanel';
import PolkadotConfig from '../../contexts/json/polkadot-config.json';
import { useRouter } from 'next/router';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { ProfileStats } from '../../features/SummaryPanel/Stats';
import TransactionsPanel from '../../features/TransactionsPanel';
import BadgesPanel from '../../features/BadgesPanel';
import CollectiblesPanel from '../../features/CollectiblesPanel';

export default function Profile() {
  const { api, getUserInfoById, GetAllDaos, GetAllIdeas, GetAllNfts, GetAllGoals, GetAllFeeds, GetAllComments, GetAllJoined, GetAllVotes, GetAllUserDonations, PolkadotLoggedIn } = usePolkadotContext();
  const [Goals, setGoals] = useState([]);
  const [Ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Daos, setDaos] = useState([]);
  const [Nfts, setNfts] = useState([]);
  const [AllTransactions, setAllTransactions] = useState([]);

  const [UserBadges, setUserBadges] = useState({
    dao: false,
    joined: false,
    goal: false,
    ideas: false,
    vote: false,
    donation: false,
    comment: false
  });

  const [UserInfo, setUserInfo] = useState({ fullName: '', imgIpfs: [] });
  const [tabIndex, setTabIndex] = useState(0);
  const [loggedUser, setLoggedUser] = useState(false);
  const [signerAddress, setSignerAddress] = useState('');
  const [stats, setStats] = useState({} as ProfileStats);

  const router = useRouter();

  useEffect(() => {
    fetchContractData();
  }, [api, router]);

  async function fetchContractData() {
    let user_id = router.query.address;
    setSignerAddress(window.signerAddress);

    if (!api) return false;
    setLoading(true);
    if (user_id == window.userid) setLoggedUser(true);
    let user_info = (await getUserInfoById(user_id)) as any;
    setUserInfo(user_info);
    //Fetching data from Smart contract
    let allDaos = await GetAllDaos();
    let allJoined = await GetAllJoined();
    let allGoals = await GetAllGoals(true);
    let allVotes = await GetAllVotes(true);
    let allDonations = await GetAllUserDonations(true);
    let allIdeas = await GetAllIdeas(true);
    let allNfts = await GetAllNfts(true);
    let allUserNfts = allNfts.filter((e) => e.owner === Number(user_id));
    setNfts(allUserNfts);

    // let donated = Number(await contract._donated(Number(user_id))) / 1e12;
    let allBadges = UserBadges;

    let founddao = [];
    for (let i = 0; i < allDaos.length; i++) {
      let dao_info = allDaos[i];
      if (dao_info.user_id == user_id) {
        dao_info.id = i;
        let goal = allGoals.filter((e) => e.daoId == dao_info.daoId);
        dao_info.goals = goal;

        founddao.push(dao_info);
      }
    }
    founddao.sort(function (a, b) {
      return b.goals.length - a.goals.length;
    });

    let foundidea = allIdeas.filter((e) => Number(e.user_id) == Number(user_id));

    foundidea.sort(function (a, b) {
      return b.votes - a.votes;
    });

    let foundGoals = allGoals.filter((e) => Number(e.UserId) == Number(user_id));
    let donated = allDonations[user_id.toString()];
    let foundJoined = allJoined.filter((e) => Number(e.user_id) == Number(user_id))

    allBadges['dao'] = founddao.length > 0 ? true : false;
    allBadges['joined'] = foundJoined.length > 0 ? true : false;
    allBadges['goal'] = foundGoals.length > 0 ? true : false;
    allBadges['ideas'] = foundidea.length > 0 ? true : false;
    allBadges['vote'] = allVotes.filter((e) => Number(e.user_id) == Number(user_id)).length > 0 ? true : false;
    allBadges['donation'] = donated > 0 ? true : false;

    let totalDonationsRecieved = 0;
    foundidea.forEach((e) => (totalDonationsRecieved += e.donation));


    let allComments = await GetAllComments();
    let allUserCommentsCreated = allComments.filter((item) => item.userid == Number(user_id));
    let AllCommentsRecieved = allComments.filter((item) => {
      for (let i = 0; i < foundidea.length; i++) {
        const element = foundidea[i];
        if (element.ideasId === item.ideasId) {
          return true
        }
      }
      return false;
    });
    let allFeeds = await GetAllFeeds()
    let allUserRelatedFeeds = allFeeds.filter((item) => item.data.userId == Number(user_id))
    let AllTransactionArray = []
    for (let i = 0; i < allUserRelatedFeeds.length; i++) {
      const element = allUserRelatedFeeds[i];
      if (element.type === 'join') {
        let feed = {
          subTitle: "Monthly subscription for ",
          Title: element.data.daoTitle,
          Id: element.data.daoId,
          Amount: element.data.donated,
          date:element.date,
          url:"/daos/"+element.data.daoId
        }
        AllTransactionArray.push(feed)
      }
      if (element.type === 'donation') {
        if (element.data.eventid != null) {
          let feed = {
            subTitle: "Donated to ",
            Title: element.data.eventTitle,
            Id: element.data.eventid,
            Amount: element.data.donated,
            date:element.date,
            url:"/events/"+element.data.eventid
          }
          AllTransactionArray.push(feed)
        }else{
          let feed = {
            subTitle: "Donated to ",
            Title: allIdeas.filter((item)=>item.ideasId == element.data.ideasid)[0].Title,
            Id: element.data.ideasid,
            Amount: element.data.donated,
            date:element.date.toLocaleString(),
            url:`/goals/${element.data.goalId}/ideas/${element.data.ideasid}`
          }
          AllTransactionArray.push(feed)
        }

      }


    }
    setAllTransactions(AllTransactionArray)
    console.log(allFeeds)


    setDaos(founddao);
    setGoals(foundGoals);
    setIdeas(foundidea);

    setUserBadges(allBadges);

    setStats({
      daosCreated: founddao.length,
      goalsCreated: foundGoals.length,
      ideasCreated: foundidea.length,
      commentsCreated: allUserCommentsCreated.length,
      donated: donated,
      donationsReceived: totalDonationsRecieved,
      commentsReceived: AllCommentsRecieved.length
    });
    setLoading(false);
  }

  function goToFaucet() {
    window.open(`https://polkadot.js.org/apps/?rpc=${PolkadotConfig.chain_rpc}#/accounts`, '_ blank');
  }

  function logout() {
    router.push('/logout');
  }

  return (
    <>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`gap-8 flex flex-col w-full bg-gohan pt-10 border-beerus border`}>
        <div className="container flex w-full justify-between relative">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Avatar className="rounded-full border border-beerus bg-gohan text-moon-80 h-20 w-20" imageUrl={UserInfo?.imgIpfs?.toString()} />
              <IconButton className="absolute right-0 bottom-0 rounded-moon-i-sm" size="xs" icon={<FilesGeneric className="text-gohan" color="#ffff" />} onClick={null}></IconButton>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-moon-32 text-piccolo">{UserInfo?.fullName?.toString()}</h1>
              <h3 className="text-trunks">{signerAddress}</h3>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {loggedUser && (
              <Button iconLeft={<ControlsExpandAlt />} onClick={goToFaucet}>
                Add coin
              </Button>
            )}

            {loggedUser && (
              <Button variant="secondary" iconLeft={<SoftwareLogOut />} onClick={logout}>
                Log out
              </Button>
            )}
          </div>
        </div>
        <div className="container">
          <Tabs selectedIndex={tabIndex} onChange={setTabIndex}>
            <Tabs.List>
              <Tabs.Tab>Summary</Tabs.Tab>
              <Tabs.Tab>Collectibles</Tabs.Tab>
              <Tabs.Tab>Badges</Tabs.Tab>
              <Tabs.Tab>Transactions</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </div>
      </div>
      <div className="container !py-10">
        {tabIndex === 0 && <SummaryPanel Daos={Daos} Goals={Goals} Ideas={Ideas} loggedUser={loggedUser} loading={loading} stats={stats} />}
        {tabIndex === 1 && <CollectiblesPanel nfts={Nfts} />}
        {tabIndex === 2 && <BadgesPanel badges={UserBadges} />}
        {tabIndex === 3 && <TransactionsPanel transactions={AllTransactions} />}
      </div>
    </>
  );
}
