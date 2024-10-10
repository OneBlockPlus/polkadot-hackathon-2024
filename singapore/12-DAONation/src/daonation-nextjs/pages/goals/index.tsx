import { useEffect, useState } from 'react';
import Loader from '../../components/components/Loader';
import GoalCard from '../../components/components/GoalCard';
import EmptyState from '../../components/components/EmptyState';
import { ControlsPlus, SportDarts } from '@heathmont/moon-icons-tw';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import useEnvironment from '../../contexts/EnvironmentContext';
import CreateGoalModal from '../../features/CreateGoalModal';
import { Button, Search } from '@heathmont/moon-core-tw';
import Head from 'next/head';

export default function Goals() {
  const [goalsList, setGoalsList] = useState([]);
  const [daoID, setDaoID] = useState('');
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { api, GetAllIdeas, GetAllGoals } = usePolkadotContext();
  const { getCommunityBranding } = useEnvironment();

  useEffect(() => {
    if (api && getCommunityBranding()?.polkadotReferenceId) {
      loadData();
    }
  }, [api, getCommunityBranding]);

  async function loadData() {
    setLoading(true);

    const daoId = getCommunityBranding().polkadotReferenceId;
    setDaoID(daoId);

    await api._query.daos.daoById(Number(daoId));

    await GetAllIdeas();
    await getGoalsList(daoId);

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

      arr.push(goalElm);
    }

    setGoalsList(arr.reverse());
  }

  function openCreateGoalModal() {
    setShowCreateGoalModal(true);
  }

  function closeCreateGoalModal(event) {
    if (event) {
      setShowCreateGoalModal(false);
    }
  }

  return (
    <>
      <Head>
        <title>DAOnation - Goals</title>
        <meta name="description" content="DAOnation - Feed" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-between items-center container !mt-10 !mb-4">
        <div className="ml-10 w-[240px]">
          <Search className="bg-white" onChangeOpen={() => {}} search={search} isOpen={false} onChangeSearch={setSearch}>
            <Search.Input>
              <Search.Input.Icon className="text-trunks" />
              <Search.Input.Input className="placeholder:text-trunks" placeholder="Search goals" {...({ placeholder: 'Search goals' } as any)} />
            </Search.Input>
          </Search>
        </div>
        <Button className="mr-10" iconLeft={<ControlsPlus />} onClick={openCreateGoalModal}>
          Create goal
        </Button>
      </div>
      <div className="flex flex-col gap-8 container items-center pb-10">
        <Loader element={goalsList.length > 0 ? goalsList.map((listItem, index) => <GoalCard item={listItem} key={index} />) : <EmptyState buttonLabel="Create goal" onButtonClick={openCreateGoalModal} icon={<SportDarts className="text-moon-48" />} label="This charity doesn’t have any goals yet." />} width={720} height={236} many={3} loading={loading} />{' '}
      </div>
      <CreateGoalModal open={showCreateGoalModal} onClose={closeCreateGoalModal} daoId={daoID} />
    </>
  );
}
