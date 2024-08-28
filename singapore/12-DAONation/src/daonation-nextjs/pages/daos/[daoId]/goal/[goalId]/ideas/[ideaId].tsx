import { Button } from '@heathmont/moon-core-tw';
import { GenericHeart, ShopWallet } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import CommentBox from '../../../../../../components/components/CommentBox';
import SlideShow from '../../../../../../components/components/Slideshow';
import UseFormTextArea from '../../../../../../components/components/UseFormTextArea';
import DonateCoinModal from '../../../../../../features/DonateCoinModal';
import Image from 'next/legacy/image';
import Loader from '../../../../../../components/components/Loader';
import { usePolkadotContext } from '../../../../../../contexts/PolkadotContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useEnvironment from '../../../../../../contexts/EnvironmentContext';
import { toast } from 'react-toastify';
import { Dao } from '../../../../../../data-model/dao';
import { Goal } from '../../../../../../data-model/goal';
import { Idea } from '../../../../../../data-model/idea';

export default function GrantIdeas() {
  const { api, showToast, getUserInfoById, userInfo, userWalletPolkadot, userSigner, GetAllVotes, GetAllDaos, GetAllGoals, GetAllJoined, GetAllIdeas, PolkadotLoggedIn } = usePolkadotContext();
  const [ideaId, setIdeasId] = useState(0);
  const [goalId, setGoalId] = useState(0);
  const [PollIndex, setPollIndex] = useState(-1);
  const [imageList, setimageList] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [CurrentDAO, setCurrentDAO] = useState({} as Dao);

  const [IdeasURI, setIdeasURI] = useState({ ideasId: '', Title: '', Description: '', Referenda: 0, wallet: '', recieve_wallet: '', logo: '', End_Date: '', voted: 0, delegAmount: 0, delegDated: '', recievetype: '', isVoted: true, isOwner: true, allfiles: [], votesAmount: 0, goalURI: {} as Goal, user_info: {} } as Idea & any);
  const [DonatemodalShow, setDonateModalShow] = useState(false);
  const [VotingShow, setVotingShow] = useState(false);
  const [AccountAddress, setAccountAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const { getCurrency } = useEnvironment();

  const router = useRouter();

  const [Comment, CommentInput, setComment] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add a comment',
    id: '',
    name: 'comment',
    rows: 1,
    minHeight: 54
  });
  const [emptydata, setemptydata] = useState([]);

  const [CommentsList, setCommentsList] = useState([
    {
      id: 0,
      comment: '',
      address: '',
      date: '',
      replies: [
        {
          id: 0,
          message: '',
          address: '',
          date: ''
        }
      ]
    }
  ]);

  let id = -1; //Ideas id from url
  let Goalid = -1; //Goal id

  useEffect(() => {
    setGoalId(Number(router.query.goalId as string));
    setIdeasId(Number(router.query.ideaId as string));
    id = Number(router.query.ideaId as string);
    Goalid = Number(router.query.goalId as string);

    fetchContractData();
  }, [api]);

  useEffect(() => {
    DesignSlide();
  });

  async function fetchContractData() {
    setLoading(true);

    try {
      if (id != -1 && Goalid != -1 && api) {
        let allIdeas = await GetAllIdeas();
        let currentIdea = allIdeas.filter((e) => e.ideasId == id)[0];

        let allGoals = await GetAllGoals();
        let currentGoal = allGoals.filter((e) => e.goalId == Goalid)[0];

        currentIdea.End_Date = currentGoal.End_Date;
        currentIdea.goalURI = currentGoal;
        currentIdea.user_info = await getUserInfoById(Number(currentIdea.user_id));

        let allDaos = await GetAllDaos();
        let currentDao = allDaos.filter((e) => e.daoId == currentGoal.daoId)[0];

        setCurrentDAO(currentDao);
        let allJoined = await GetAllJoined();
        let currentJoined = allJoined.filter((e) => Number(e?.daoId) ==Number( currentGoal.daoId));
        let joinedInfo = currentJoined.filter((e) => Number( e?.user_id) ==  Number(window.userid));
        if (joinedInfo.length > 0) {
          setIsJoined(true);
        } else {
          setIsJoined(false);
        }

        let isvoted = false;
        let allVotes = await GetAllVotes();
        let currentIdeasVotes = allVotes.filter((e) => e.ideasId == id);
        for (let i = 0; i < currentIdeasVotes.length; i++) {
          const element = currentIdeasVotes[i];
          if (Number(element.user_id) == Number(window.userid)) isvoted = true;
        }

        currentIdea.votesAmount = currentIdeasVotes.length;
        currentIdea.isVoted = isvoted;

        setAccountAddress(currentIdea.wallet);
        setIdeasURI(currentIdea);

        setimageList(currentIdea.allfiles);
        setLoading(false);

        let totalComments = [];
      }
    } catch (error) {
      console.error(error);
    }
  }

  function DesignSlide() {
    if (document.querySelector('[data-type="prev"]') !== null) {
      document.querySelector('[data-type="prev"]').innerHTML =
        '<div className="undefined nav " data-type="prev" aria-label="Previous Slide" style="width: 45px;margin-right: -50px;cursor: pointer;"><div className="undefined nav " data-type="prev" aria-label="Previous Slide" style="color: black;cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 79"><svg xmlns="http://www.w3.org/2000/svg" width="79" height="79" fill="none"><g filter="url(#filter0_b_48_4254)"><circle cx="39.5" cy="39.5" r="39.5" fill="white"></circle><circle cx="39.5" cy="39.5" r="39.25" stroke="#C4C4C4" stroke-width="0.5"></circle></g><path d="M29.0556 39.9087L42.3821 26.6582C42.8187 26.2244 43.5256 26.2251 43.9615 26.6605C44.3971 27.0958 44.3959 27.801 43.9592 28.2353L31.426 40.6971L43.9597 53.1588C44.3963 53.5931 44.3974 54.2979 43.9619 54.7333C43.7434 54.9515 43.4572 55.0606 43.1709 55.0606C42.8854 55.0606 42.6002 54.9522 42.3821 54.7355L29.0556 41.4854C28.8453 41.2768 28.7273 40.9929 28.7273 40.6971C28.7273 40.4013 28.8456 40.1177 29.0556 39.9087Z" fill="black"></path><defs><filter id="filter0_b_48_4254" x="-4" y="-4" width="87" height="87" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feGaussianBlur in="BackgroundImageFix" stdDeviation="2"></feGaussianBlur><feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_48_4254"></feComposite><feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_48_4254" result="shape"></feBlend></filter></defs></svg></svg></div></div>';
      document.querySelector('[data-type="next"]').innerHTML =
        '<div className="undefined nav " data-type="next" aria-label="Next Slide" style="width: 45px;margin-left: -17px;cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 79" fill="#2e2e2e"><svg width="79" height="79" viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_b_48_4262)"><circle cx="39.5" cy="39.5" r="39.5" fill="white"></circle><circle cx="39.5" cy="39.5" r="39.25" stroke="#C4C4C4" stroke-width="0.5"></circle></g><path d="M43.9596 41.4853L30.6331 54.7358C30.1965 55.1697 29.4896 55.169 29.0537 54.7336C28.6181 54.2982 28.6192 53.593 29.0559 53.1588L41.5892 40.697L29.0555 28.2352C28.6188 27.801 28.6177 27.0962 29.0532 26.6608C29.2717 26.4425 29.558 26.3334 29.8443 26.3334C30.1298 26.3334 30.4149 26.4418 30.633 26.6585L43.9596 39.9087C44.1699 40.1173 44.2879 40.4012 44.2879 40.697C44.2879 40.9928 44.1696 41.2763 43.9596 41.4853Z" fill="black"></path><defs><filter id="filter0_b_48_4262" x="-4" y="-4" width="87" height="87" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feGaussianBlur in="BackgroundImageFix" stdDeviation="2"></feGaussianBlur><feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_48_4262"></feComposite><feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_48_4262" result="shape"></feBlend></filter></defs></svg></svg></div>';
      document.querySelector('.react-slideshow-zoom-wrapper').classList.add('rounded-xl');
      document.querySelector('.react-slideshow-container').classList.add('overflow-hidden');
      document.querySelector('.react-slideshow-container').classList.add('rounded-xl');
      (document.querySelector('.react-slideshow-container') as HTMLElement).style.height = '500px';
    }
  }

  async function VoteIdea() {
   
    setVoting(true);
    const ToastId = toast.loading('Voting ...');
    const showBadgesAmount = [10, 50, 100, 150, 200, 250, 500];
    let shouldAdd = false;

    let feed = JSON.stringify({
      votesAmount: IdeasURI.votesAmount + 1,
      goalTitle: IdeasURI?.goalURI?.Title,
      ideasid: ideaId
    });

    if (showBadgesAmount.includes(IdeasURI.votesAmount + 1)) {
      shouldAdd = true;
    }

    function onSuccess() {
      setIdeasURI({ ...IdeasURI, isVoted: !IdeasURI.isVoted, votesAmount: IdeasURI.votesAmount + 1 });
      setVoting(false);
      window.location.reload();
    }
    if (PolkadotLoggedIn) {
      const txs = [api._extrinsics.ideas.createVote(goalId, ideaId, window.userid)];
      if (shouldAdd) {
        txs.push(api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'vote', new Date().valueOf()));
      }

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Voted successfully!', () => {
          onSuccess();
        });
      });
    }
  }

  async function onClickDonate() {
    setDonateModalShow(true);
  }

  async function removeElementFromArrayBYID(all, specificid, seting) {
    seting([]);
    var storing = [];
    for (let index = 0; index < all.length; index++) {
      const element = all[index];
      if (element.id == specificid) {
        continue;
      }
      storing.push(element);
    }

    seting(storing);
  }

  async function PostComment(e) {
    e.preventDefault();
    setCommenting(true);
    let newComment = {
      userid: Number(window.userid),
      address: window?.signerAddress.toLocaleUpperCase().toString(),
      message: Comment,
      date: new Date().toISOString(),
      id: '',
      replies: [],
      user_info: {}
    };
    await saveMessage(newComment);
    newComment.replies = [];
    newComment.user_info = userInfo;
    setCommentsList([...CommentsList, newComment] as any);
    setComment('');
    setCommenting(false);
    removeElementFromArrayBYID(emptydata, 0, setemptydata);
  }

  async function saveMessage(newComment) {
    removeElementFromArrayBYID(emptydata, 0, setemptydata);
  }

  async function sendReply(replyText, MessageId, MessageIndex) {
    removeElementFromArrayBYID(emptydata, 0, setemptydata);
  }

  const uniqueAndSort = (comments) => Array.from(new Map(comments.map((item) => [item.id, item])).values()).sort((a: { date: number }, b: { date: number }) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function closeDonateModal(event) {
    if (event && event.amount) {
      setIdeasURI({ ...IdeasURI, donation: Number(IdeasURI.donation) + Number(event.amount) });
    }

    setDonateModalShow(false);
  }

  return (
    <>
      <Head>
        <title>{IdeasURI.Title}</title>
        <meta name="description" content={IdeasURI.Title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        <div className={`gap-8 flex flex-col w-full bg-gohan pt-10 pb-6 border-beerus border`}>
          <div className="container flex w-full justify-between relative">
            <div className="flex flex-col gap-1">
              <Loader
                loading={loading}
                width={300}
                element={
                  <h5 className="font-semibold whitespace-nowrap">
                    <Link href={`../../../../${router.query.daoId}`} className="text-piccolo truncate">
                      {CurrentDAO?.Title}
                    </Link>{' '}
                    &gt;{' '}
                    <Link className="text-piccolo truncate max-w-[200px] inline-flex" href={`../../../../${router.query.daoId}/goal/${router.query.goalId}`}>
                      {IdeasURI?.goalURI?.Title}
                    </Link>{' '}
                    &gt; Idea
                  </h5>
                }
              />
              <Loader loading={loading} width={300} element={<h1 className="text-moon-32 font-bold">{IdeasURI.Title}</h1>} />
              <Loader
                loading={loading}
                width={770}
                element={
                  <h3 className="flex gap-2 whitespace-nowrap">
                    <div>
                      Donated{' '}
                      <span className="text-hit font-semibold">
                        {getCurrency()} {IdeasURI.donation}
                      </span>
                    </div>
                    <div>•</div>
                    <div>
                      <span className="text-hit font-semibold">{IdeasURI.votesAmount}</span> votes
                    </div>
                    <div>•</div>
                    <div className="flex">
                      Created by &nbsp;
                      <a href={'/profile/' + IdeasURI?.user_info?.id} className="truncate text-piccolo max-w-[220px]">
                        {IdeasURI?.user_info?.fullName}
                      </a>
                    </div>
                  </h3>
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {isJoined && (
                <Button iconLeft={<ShopWallet />} onClick={onClickDonate}>
                  Donate
                </Button>
              )}
              {!IdeasURI.isOwner &&
                isJoined &&
                (IdeasURI.isVoted ? (
                  <Button iconLeft={<GenericHeart fill="red" color="red" />} variant="secondary" disabled={true}>
                    Voted
                  </Button>
                ) : (
                  <Button iconLeft={<GenericHeart />} variant="secondary" animation={voting ? 'progress' : false} disabled={voting} onClick={VoteIdea}>
                    Vote
                  </Button>
                ))}
            </div>
          </div>
        </div>

        <div className="container flex flex-col gap-6">
          <p>{IdeasURI.Description}</p>
          <div className="flex justify-center">
            <Loader
              element={
                imageList.length > 1 ? (
                  <>
                    <SlideShow images={imageList} />
                  </>
                ) : (
                  <>
                    {imageList[0] && (
                      <div className="h-[480px] max-[w-720px] object-contain overflow-hidden relative rounded-lg w-[calc(100%-32px)]">
                        <Image unoptimized={true} src={imageList[0].url} layout="fill" objectFit="cover" className="object-contain" />
                      </div>
                    )}
                  </>
                )
              }
              loading={loading}
              width={800}
              height={500}
            />
          </div>{' '}
           <div className="full-w">
            <form onSubmit={PostComment} className="full-w flex flex-col gap-2">
              {CommentInput}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button animation={commenting} data-element-id="btn_donate" style={{ width: '135px' }} data-analytic-event-listener="true" type="submit">
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
          <div className="flex flex-col gap-6 pb-8">{uniqueAndSort(CommentsList).map((listItem: any, index) => (listItem.address !== '' ? <CommentBox user_info={listItem.user_info} address={listItem.address} MessageID={listItem.id} MessageIndex={index} date={listItem.date} sendReply={sendReply} message={listItem.message} replies={listItem.replies} key={listItem.id} /> : <></>))}</div> 
        </div>
      </div>

      <DonateCoinModal ideasid={ideaId} daoId={router.query.daoId} goalURI={IdeasURI?.goalURI} show={DonatemodalShow} onHide={closeDonateModal} address={AccountAddress} recieveWallet={IdeasURI.recieve_wallet} recievetype={IdeasURI.recievetype} />
    </>
  );
}
