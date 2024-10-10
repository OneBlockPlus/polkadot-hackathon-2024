import { useEffect, useState } from 'react';
import MembersTable from '../../../features/MembersTable';
import { usePolkadotContext } from '../../../contexts/PolkadotContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Members() {
  const [communityMembers, setCommunityMembers] = useState([]);
  const [goalsList, setGoalsList] = useState([]);
  const [loading, setLoading] = useState(true);

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
    await api._query.daos.daoById(Number(daoId));

    await getGoalsList(daoId);
    await getCommunityMembers(daoId);

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
        <title>DAOnation - Members</title>
        <meta name="description" content="DAOnation - Feed" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container !pt-10">
        <div className="flex flex-col gap-8 container items-center pb-10">
          <MembersTable allJoined={communityMembers} goals={goalsList} />
        </div>
      </div>
    </>
  );
}
