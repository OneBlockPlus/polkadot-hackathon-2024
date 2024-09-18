import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, ControlsPlus, GenericLightningBolt } from '@heathmont/moon-icons-tw';
import { useEffect, useState } from 'react';
import UseFormInput from '../../components/components/UseFormInput';
import UseFormTextArea from '../../components/components/UseFormTextArea';
import AddImageInput from '../../components/components/AddImageInput';
import ImageListDisplay from '../../components/components/ImageListDisplay';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import Required from '../../components/components/Required';

import { toast } from 'react-toastify';
import useEnvironment from '../../contexts/EnvironmentContext';
import { useIPFSContext } from '../../contexts/IPFSContext';
import { AiService } from '../../services/aiService';
import { MediaService } from '../../services/mediaService';
import InfoBox from '../../components/components/InfoBox';
import { UnsplashImage } from '../../data-model/unspash-image';
import SuggestedImage from '../../components/components/SuggestedImage';

let addedDate = false;

export default function CreateGoalModal({ open, onClose, daoId }: { onClose; open; daoId: string }) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [goalImage, setGoalImage] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [suggestedImages, setSuggestedImages] = useState<UnsplashImage[]>([]);
  const { api, userInfo, showToast, userWalletPolkadot, userSigner, PolkadotLoggedIn } = usePolkadotContext();
  const { isServer } = useEnvironment();

  const { UploadBlob } = useIPFSContext();

  //Input fields
  const [GoalTitle, GoalTitleInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add name',
    id: ''
  });

  const [GoalDescription, GoalDescriptionInput] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add Description',
    id: '',
    rows: 4
  });

  const [describeGoal, DescribeGoalInput] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add Description',
    id: '',
    rows: 4
  });

  const [EndDate, EndDateInput, setEndDate] = UseFormInput({
    defaultValue: '',
    type: 'date',
    placeholder: 'End date',
    id: 'enddate'
  });

  const [Budget, BudgetInput] = UseFormInput({
    defaultValue: '',
    type: 'number',
    placeholder: '0.00',
    id: 'goal'
  });

  async function CheckTransaction() {
    let params = new URL(window.location.href).searchParams;
    if (params.get('transactionHashes') !== null) {
      window.location.href = `/daos`;
    }
  }

  if (!isServer()) {
    // All this kinda stuff should be in useEffects()
    CheckTransaction();
  }

  //Function after clicking Create Goal Button
  async function create() {
    setIsCreating(true);

    const ToastId = toast.loading('Uploading IPFS ...');
    let allFiles = [];
    for (let index = 0; index < goalImage.length; index++) {
      //Gathering all files link
      const element = goalImage[index];
      const url = element.type ? await UploadBlob(element) : '';
      const image = {
        url,
        type: element.type
      };
      allFiles.push(image);
    }

    //Creating an object of all information to store in EVM
    const createdObject = {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Title: {
          type: 'string',
          description: GoalTitle
        },
        Description: {
          type: 'string',
          description: GoalDescription
        },
        Budget: {
          type: 'string',
          description: Budget
        },
        End_Date: {
          type: 'string',
          description: EndDate
        },
        user_id: {
          type: 'string',
          description: window.userid
        },
        wallet: {
          type: 'string',
          description: window.signerAddress
        },
        logo: {
          type: 'string',
          description: allFiles[0]
        },
        allFiles
      }
    };
    console.log('======================>Creating Goal', createdObject);
    toast.update(ToastId, { render: 'Creating Goal...', isLoading: true });

    let feed = {
      name: userInfo?.fullName,
      daoId: daoId,
      goalid: null,
      budget: Budget
    };

    async function onSuccess() {
      setIsCreating(false);
      onClose({ success: true });
      window.location.reload();
    }
    if (PolkadotLoggedIn) {
      let goalid = Number(await api._query.goals.goalIds());
      feed.goalid = goalid;

      const txs = [api._extrinsics.goals.createGoal(JSON.stringify(createdObject), daoId, Number(window.userid), JSON.stringify(feed)), api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'goal', new Date().valueOf())];

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Created successfully!', () => {
          onSuccess();
        });
      });
    }
  }

  function filehandleChange(goal) {
    // If user uploaded images/videos
    var allNames = [];
    for (let index = 0; index < goal.target.files.length; index++) {
      const element = goal.target.files[index].name;
      allNames.push(element);
    }
    for (let index2 = 0; index2 < goal.target.files.length; index2++) {
      setGoalImage((pre) => [...pre, goal.target.files[index2]]);
    }
  }

  function addImage() {
    var GoalImagePic = document.getElementById('goalImage');
    GoalImagePic.click();
  }

  function deleteSelectedImages(imageId) {
    //Deleting the selected image
    var newImages = [];
    var allUploadedImages = document.getElementsByName('deleteBTN');
    for (let index = 0; index < goalImage.length; index++) {
      if (index != imageId) {
        const elementDeleteBTN = allUploadedImages[index];
        elementDeleteBTN.setAttribute('id', newImages.length.toString());
        const element = goalImage[index];
        newImages.push(element);
      }
    }
    setGoalImage(newImages);
  }

  async function generateGoal() {
    const toastId = toast.loading('Generating goal');

    const { content } = await AiService.generateGoal(describeGoal, 'charity');

    const { title, description } = JSON.parse(content);

    const { images } = await MediaService.getImages(describeGoal);

    const createdObject = {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Title: {
          type: 'string',
          description: title
        },
        Description: {
          type: 'string',
          description: description
        },
        Budget: {
          type: 'string',
          description: Budget
        },
        End_Date: {
          type: 'string',
          description: EndDate
        },
        user_id: {
          type: 'string',
          description: window.userid
        },
        wallet: {
          type: 'string',
          description: window.signerAddress
        },
        logo: {
          type: 'string',
          description: { url: images[0].urls.regular, type: 'image/jpeg' }
        },
        allFiles: [{ url: images[0].urls.regular, type: 'image/jpeg' }]
      }
    };

    console.log('======================>Creating Goal', createdObject);

    toast.update(toastId, { render: 'Creating Goal...', isLoading: true });

    let feed = {
      name: userInfo?.fullName,
      daoId: daoId,
      goalid: null,
      budget: Budget
    };

    async function onSuccess() {
      setIsCreating(false);
      onClose({ success: true });
      window.location.reload();
    }
    if (PolkadotLoggedIn) {
      let goalid = Number(await api._query.goals.goalIds());
      feed.goalid = goalid;

      const txs = [api._extrinsics.goals.createGoal(JSON.stringify(createdObject), daoId, Number(window.userid), JSON.stringify(feed)), api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'goal', new Date().valueOf())];

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, toastId, 'Created successfully!', () => {
          onSuccess();
        });
      });
    }
  }

  function isInvalid() {
    return !(((GoalTitle && GoalDescription) || describeGoal) && Budget && EndDate);
  }

  async function getImageSuggestions(title: string) {
    if (title.length > 10) {
      const { images } = await MediaService.getImages(title);

      setSuggestedImages(images);
    }
  }

  async function onChooseImage(image: UnsplashImage) {
    const response = await fetch(image.urls.regular);
    const blob = await response.blob();
    const file = new File([blob], 'goal.png', { type: 'image/jpeg' });

    setGoalImage([file]);
  }

  const isGenerating = () => mode === 'ai';
  const isManual = () => mode === 'manual';

  useEffect(() => {
    let dateTime = new Date();
    if (!addedDate) setEndDate(dateTime.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    getImageSuggestions(GoalTitle);
  }, [GoalTitle]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan max-w-none w-screen h-screen absolute left-0 sm:relative sm:h-auto sm:w-[90%] sm:max-w-[600px] sm:max-h-[90vh] !rounded-none sm:!rounded-xl">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            {isManual() && <h1 className="text-moon-20 font-semibold">Create goal</h1>}
            {isGenerating() && <h1 className="text-moon-20 font-semibold">Create goal</h1>}
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full p-6  max-h-[calc(90vh-162px)] overflow-auto">
            {isGenerating() && <InfoBox icon={<GenericLightningBolt />} label="You are generating with AI. Describe your goal as detailed as possible to get the best result." />}

            {isManual() && (
              <div className="flex flex-col gap-2">
                <h6>
                  Goal name
                  <Required />
                </h6>
                {GoalTitleInput}
              </div>
            )}

            {isManual() && (
              <div className="flex flex-col gap-2">
                <h6>
                  Description
                  <Required />
                </h6>
                {GoalDescriptionInput}
              </div>
            )}
            {isGenerating() && (
              <div className="flex flex-col gap-2">
                <h6>
                  Describe your goal
                  <Required />
                </h6>
                {DescribeGoalInput}
              </div>
            )}
            <div className="flex gap-8 w-full">
              <div className="flex flex-col gap-2 w-full">
                <h6>
                  Goal amount in DOT
                  <Required />
                </h6>
                {BudgetInput}
              </div>
            </div>
            <div className="flex gap-8 w-full">
              <div className="flex-1">
                <h6>
                  End Date
                  <Required />
                </h6>
                {EndDateInput}
              </div>
            </div>
            {isManual() && (
              <div className="flex flex-col gap-2">
                <h6>
                  Image
                  <Required />
                </h6>
                <div className="content-start flex flex-row flex-wrap gap-[6px] justify-start overflow-auto relative text-center text-white w-full">
                  <input className="file-input" hidden onChange={filehandleChange} accept="image/*" id="goalImage" name="goalImage" type="file" />
                  <div className="flex flex-col">
                    {goalImage.length < 1 && <AddImageInput onClick={addImage} />}
                    <ImageListDisplay images={goalImage} onDeleteImage={deleteSelectedImages} />
                  </div>
                  {goalImage.length === 0 && suggestedImages.map((image, i) => <SuggestedImage image={image.urls.regular} onClick={() => onChooseImage(image)} key={i} />)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between border-t border-beerus w-full p-6 gap-4 absolute sm:relative bottom-0">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          {isManual() && (
            <Button iconLeft={<ControlsPlus />} animation={isCreating ? 'progress' : false} disabled={isCreating || isInvalid()} onClick={create} className="flex-1 sm:flex-none">
              Create goal
            </Button>
          )}
          {isGenerating() && (
            <div className="flex gap-2">
              <Button variant="secondary" animation={isCreating ? 'progress' : false} disabled={isCreating} onClick={() => setMode('manual')} className="flex-1 sm:flex-none">
                Create from scratch
              </Button>

              <Button iconLeft={<GenericLightningBolt />} animation={isCreating ? 'progress' : false} disabled={isCreating || isInvalid()} onClick={generateGoal} className="flex-1 sm:flex-none">
                Generate
              </Button>
            </div>
          )}
        </div>
      </Modal.Panel>
    </Modal>
  );
}
