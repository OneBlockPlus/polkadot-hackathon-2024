import { useEffect, useState } from 'react';
import CommunityFeed from '../../../features/CommunityFeed';
import TopCommunityMembers from '../../../features/TopCommunityMembers';
import { useRouter } from 'next/router';
import { usePolkadotContext } from '../../../contexts/PolkadotContext';
import { Dao } from '../../../data-model/dao';
import Head from 'next/head';

export default function Feed() {
  const [loading, setLoading] = useState(true);
  const [daoID, setDaoID] = useState('');
  const [DaoURI, setDaoURI] = useState({ Title: '', Description: '', SubsPrice: null, Start_Date: '', End_Date: '', logo: '', wallet: '', typeimg: '', allFiles: [], isOwner: false, daoId: null, user_id: null, user_info: null, brandingColor: '', customUrl: '' } as Dao);
  const [goalsList, setGoalsList] = useState([]);
  const [communityMembers, setCommunityMembers] = useState([]);

  const { api, GetAllJoined, GetAllGoals, GetAllIdeas, GetAllVotes } = usePolkadotContext();
  const router = useRouter();

  useEffect(() => {
    if (api) {
      loadData();
    }
  }, [api]);

  async function loadData() {
    setLoading(true);

    const daoId = router.query.daoId as string;
    setDaoID(daoId);

    const element = await api._query.daos.daoById(Number(daoId));
    let daoURI = element['__internal__raw'].daoUri.toString();

    console.log(daoURI);

    setDaoURI(daoURI);

    await getGoalsList(daoId);
    await getCommunityMembers(daoId);
    await GetAllIdeas();

    setLoading(false);
  }

  async function getGoalsList(daoId: string) {
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
  }

  async function getCommunityMembers(daoId: string) {
    let allJoined = await GetAllJoined();
    let currentJoined = allJoined.filter((e) => e?.daoId == daoId.toString());

    setCommunityMembers(currentJoined);
  }

  return (
    <>
      <Head>
        <title>DAOnation - Feed</title>
        <meta name="description" content="DAOnation - Feed" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container !pt-10">
        <div className="container flex gap-6">
          {!loading && (
            <>
              <CommunityFeed communityName={DaoURI.Title} daoId={daoID} /> <TopCommunityMembers goals={goalsList} allJoined={communityMembers} daoId={DaoURI.daoId} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
