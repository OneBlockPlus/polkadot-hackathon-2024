import { Button, Tabs } from '@heathmont/moon-core-tw';
import { ControlsPlus, GenericIdea } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import IdeaCard from '../../../components/components/IdeaCard';
import Loader from '../../../components/components/Loader';
import CreateIdeaModal from '../../../features/CreateIdeaModal';
import EmptyState from '../../../components/components/EmptyState';
import DonateCoinModal from '../../../features/DonateCoinModal';
import { usePolkadotContext } from '../../../contexts/PolkadotContext';
import Image from 'next/legacy/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useEnvironment from '../../../contexts/EnvironmentContext';
import { toast } from 'react-toastify';
import { Dao } from '../../../data-model/dao';

export default function Goal() {
  //Variables
  const [list, setList] = useState([]);
  const { api, showToast, GetAllJoined, userWalletPolkadot, userSigner, getUserInfoById, GetAllDaos, GetAllGoals, GetAllIdeas, PolkadotLoggedIn } = usePolkadotContext();
  const [GoalURI, setGoalURI] = useState({
    goalId: '',
    daoId: '',
    Title: '',
    Description: '',
    Budget: '',
    End_Date: '',
    StructureLeft: [],
    StructureRight: [],
    user_info: {
      fullName: '',
      id: null
    },
    reached: false,
    wallet: '',
    logo: '',
    isOwner: true
  } as any);
  const [goalId, setGoalID] = useState(-1);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [GoalDAOURI, setGoalDAOURI] = useState({} as Dao);

  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
  const [DonatemodalShow, setDonateModalShow] = useState(false);
  const [selectedIdeasId, setSelectedIdeasId] = useState('');
  const [selectedIdeasWallet, setSelectedIdeasWallet] = useState('');
  const [selectedIdeasRecieveWallet, setSelectedIdeasRecieveWallet] = useState('');
  const { getCurrency } = useEnvironment();

  const router = useRouter();

  useEffect(() => {
    getGoalID();
  }, [api, router]);

  useEffect(() => {
    fetchContractData();
  }, [api, goalId]);

  function getGoalID() {
    const goalIdParam = router.query.goalId as string;

    if (!goalIdParam) {
      return;
    }
    setGoalID(Number(goalIdParam));
  }

  async function fetchContractData() {
    setLoading(true);

    try {
      if (goalId != -1 && api) {
        let allGoals = await GetAllGoals();
        let goalURIFull = allGoals.filter((e) => e?.goalId == goalId.toString())[0];

        let allDaos = await GetAllDaos();
        let goalDAO = allDaos.filter((e) => e.daoId == goalURIFull.daoId)[0];
        setGoalDAOURI(goalDAO);

        let user_info = await getUserInfoById(Number(goalURIFull.UserId));
        goalURIFull.user_info = user_info;
        let allJoined = await GetAllJoined();
        let currentJoined = allJoined.filter((e) => e?.daoId == goalURIFull.daoId.toString());
        let joinedInfo = currentJoined.filter((e) => e?.user_id.toString() == window.userid.toString());
        if (joinedInfo.length > 0) {
          setIsJoined(true);
        } else {
          setIsJoined(false);
        }

        // const totalIdeasWithEmpty = await contract.get_all_ideas_by_goal_id(Number(id)); //Getting total goal (Number)
        // let totalIdeas = totalIdeasWithEmpty.filter((e) => e !== '');
        let arr = [];
        let allIdeas = await GetAllIdeas();
        let GoalIdeas = allIdeas.filter((e) => e.goalId.toString() == goalId.toString());
        arr = GoalIdeas;
        // let total_donated = 0;
        // for (let i = 0; i < Object.keys(totalIdeas).length; i++) {
        //   //total goal number Iteration
        //   const ideasId = await contract.get_ideas_id_by_ideas_uri(totalIdeas[i]);
        //   const AllvotesWithEmpty = await contract.get_ideas_votes_from_goal(Number(id), Number(id)); //Getting all votes
        //   const Allvotes = AllvotesWithEmpty.filter((item, idx) => item !== '');
        //   let isvoted = false;
        //   for (let i = 0; i < Allvotes.length; i++) {
        //     const element = Number(Allvotes[i]);
        //     if (element == Number(window.userid)) isvoted = true;
        //   }
        //   if (totalIdeas[i] == '') continue;
        //   const object = JSON.parse(totalIdeas[i]);
        //   if (object) {
        //     let donation = Number((await contract._ideas_uris(Number(ideasId))).donation) / 1e12;
        //     total_donated += donation;
        //     arr.push({
        //       //Pushing all data into array
        //       ideasId: Number(ideasId),
        //       Title: object.properties.Title.description,
        //       Description: object.properties.Description.description,
        //       wallet: object.properties.wallet.description,
        //       donation: donation,
        //       votes: Object.keys(Allvotes).length,
        //       logo: object.properties.logo.description?.url,
        //       allfiles: object.properties.allfiles,
        //       isOwner: object.properties.user_id.description == Number(window.userid) ? true : false,
        //       isVoted: isvoted
        //     });
        //   }
        // }
        setList(arr);
        setGoalURI(goalURIFull);

        setLoading(false);

        /** TODO: Fix fetch to get completed ones as well */
        if (document.getElementById('Loading')) {
          document.getElementById('Loading').style.display = 'none';
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Could not load contract');
    }
  }

  async function DonateToIdeas(ideasId, wallet, recieveWallet) {
    setDonateModalShow(true);
    setSelectedIdeasId(ideasId);
    setSelectedIdeasWallet(wallet);
    setSelectedIdeasRecieveWallet(recieveWallet);
  }

  function closeCreateIdeaModal(event) {
    if (event) {
      setShowCreateIdeaModal(false);
    }
  }
  function openCreateIdeaModal() {
    setShowCreateIdeaModal(true);
  }

  async function VoteIdea(ideas_id, index) {
    let IdeasURI = list[index];
    // if (IdeasURI.Referenda != 0) {
    //   setVotingShow(true);
    //   return;
    // }
    // setVoting(true);
    const ToastId = toast.loading('Voting ...');
    const showBadgesAmount = [10, 50, 100, 150, 200, 250, 500];
    let shouldAdd = false;

    let feed = JSON.stringify({
      votesAmount: IdeasURI.votesAmount + 1,
      goalTitle: GoalURI.Title,
      ideasid: ideas_id
    });

    if (showBadgesAmount.includes(IdeasURI.votesAmount + 1)) {
      shouldAdd = true;
    }

    function onSuccess() {
      let idealist = list;
      idealist[index].isVoted = !idealist[index].isVoted;
      idealist[index].votes += 1;
      setList(idealist.reverse());

      window.location.reload();
    }
    if (PolkadotLoggedIn) {
      const txs = [api._extrinsics.ideas.createVote(goalId, ideas_id, window.userid)];
      if (shouldAdd) {
        txs.push(api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'vote', new Date().valueOf()));
      }

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Voted successfully!', () => {
          onSuccess();
        });
      });
    } else {
      try {
        toast.update(ToastId, {
          render: 'Voted Successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 1000,
          closeButton: true,
          closeOnClick: true,
          draggable: true
        });
        onSuccess();
      } catch (error) {
        console.error(error);
        // setVoting(false);
        return;
      }
    }
  }

  function closeDonateModal(event) {
    if (event) {
      setDonateModalShow(false);
    }
  }

  return (
    <>
      <Head>
        <title>Goal</title>
        <meta name="description" content="Goal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        <div className="gap-8 flex flex-col w-full bg-gohan pt-10 border-beerus border">
          <div className="container flex w-full justify-between">
            <div className="flex flex-col gap-1 overflow-hidden">
              <Loader
                loading={loading}
                width={300}
                element={
                  <h5 className="font-semibold">
                    <Link className="text-piccolo" href={`../../${router.query.daoId}`}>
                      {GoalDAOURI?.Title}
                    </Link>{' '}
                    &gt; Goals
                  </h5>
                }
              />
              <Loader loading={loading} width={300} element={<h1 className="text-moon-32 font-bold">{GoalURI.Title}</h1>} />
              <Loader
                loading={loading}
                width={770}
                element={
                  <h3 className="flex gap-2 whitespace-nowrap">
                    <div>
                      <span className="text-hit font-semibold">
                        {getCurrency()} {GoalURI.reached}
                      </span>{' '}
                      of {getCurrency()} {GoalURI.Budget}
                    </div>
                    <div>•</div>
                    <div>{list.length} ideas</div>
                    <div>•</div>
                    <div className="flex">
                      Created by &nbsp;
                      <a href={'/profile/' + GoalURI?.user_info?.id} className="truncate text-piccolo max-w-[220px]">
                        {GoalURI?.user_info?.fullName.toString()}
                      </a>
                    </div>
                  </h3>
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {GoalURI.isOwner || isJoined ? (
                <>
                  {' '}
                  <Button iconLeft={<ControlsPlus />} onClick={openCreateIdeaModal}>
                    Create idea
                  </Button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="container">
            <Tabs selectedIndex={tabIndex} onChange={setTabIndex}>
              <Tabs.List>
                <Tabs.Tab>Description</Tabs.Tab>
                <Tabs.Tab>Ideas ({list.length})</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </div>
        </div>
        {tabIndex === 0 && (
          <div className="container flex flex-col gap-6">
            <p>{GoalURI.Description}</p>
            {GoalURI.logo && (
              <div className="relative w-auto max-[w-720px] h-[480px] object-contain">
                <Image unoptimized={true} src={GoalURI.logo} alt="" objectFit="cover" layout="fill" className="object-contain" />
              </div>
            )}
          </div>
        )}
        {tabIndex === 1 && (
          <div className="flex flex-col gap-8 container items-center">
            <Loader
              element={
                list.length > 0 ? (
                  list.map((listItem, index) => (
                    <IdeaCard
                      onClickVote={() => {
                        VoteIdea(listItem.ideasId, index);
                      }}
                      onClickDonate={() => {
                        DonateToIdeas(listItem.ideasId, listItem.wallet, listItem.recieve_wallet);
                      }}
                      item={listItem}
                      key={index}
                    />
                  ))
                ) : (
                  <EmptyState icon={<GenericIdea className="text-moon-48" />} label="This goal doesn’t have any ideas yet." buttonLabel="Create idea" onButtonClick={openCreateIdeaModal} />
                )
              }
              width={768}
              height={236}
              many={3}
              loading={loading}
            />{' '}
          </div>
        )}
      </div>
      <CreateIdeaModal show={showCreateIdeaModal} onClose={closeCreateIdeaModal} goalId={goalId} daoId={GoalURI.daoId} goal={GoalURI} dao={GoalDAOURI} />
      <DonateCoinModal recievetype="" goalId={goalId} ideasid={selectedIdeasId} daoId={router.query.daoId} goalURI={GoalURI} show={DonatemodalShow} onHide={closeDonateModal} address={selectedIdeasWallet} recieveWallet={selectedIdeasRecieveWallet} />
    </>
  );
}
