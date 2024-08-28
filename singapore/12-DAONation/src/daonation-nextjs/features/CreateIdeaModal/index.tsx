import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, ControlsPlus } from '@heathmont/moon-icons-tw';
import React, { useEffect, useState } from 'react';
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
import { Dao } from '../../data-model/dao';
import { Goal } from '../../data-model/goal';
import IdeaSuggestionBox from '../../components/components/IdeaSuggestionBox';
import { IdeaSuggestion } from '../../data-model/idea-suggestion';

export default function CreateIdeaModal({ show, onClose, daoId, goalId, goal, dao }: { show; onClose; daoId; goalId; goal: Goal; dao: Dao }) {
  const [ideaImage, setIdeaImage] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const { userInfo, PolkadotLoggedIn, userWalletPolkadot, showToast, userSigner, api } = usePolkadotContext();
  const { UploadBlob } = useIPFSContext();
  const { isServer } = useEnvironment();
  const [suggestions, setSuggestions] = useState<IdeaSuggestion[]>([]);

  async function getSuggestions() {
    const suggestions = await AiService.generateIdeas(goal.Description, dao.Title);

    setSuggestions(suggestions);
  }

  async function setSuggestedIdea(suggestion: IdeaSuggestion) {
    setTitle(suggestion.title);
    setDescription(suggestion.description);

    const response = await fetch(suggestion.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'idea.png', { type: 'image/jpeg' });

    setIdeaImage([file]);
  }

  useEffect(() => {
    if (goal.goalId !== undefined && dao.daoId !== undefined && goal.Description && dao.Title) {
      getSuggestions();
    }
  }, [goal, dao]);

  if (isServer()) return null;

  //Input fields
  const [IdeasTitle, IdeasTitleInput, setTitle] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Ideas name',
    id: ''
  });

  const [IdeasDescription, IdeasDescriptionInput, setDescription] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Ideas Description',
    id: '',
    rows: 4
  });

  async function create() {
    const ToastId = toast.loading('Uploading IPFS ...');
    setIsCreating(true);

    let allFiles = [];
    for (let index = 0; index < ideaImage.length; index++) {
      const element = ideaImage[index];
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
          description: IdeasTitle
        },
        Description: {
          type: 'string',
          description: IdeasDescription
        },
        wallet: {
          type: 'string',
          description: window.signerAddress
        },
        user_id: {
          type: 'string',
          description: window.userid
        },
        logo: {
          type: 'string',
          description: allFiles[0]
        },
        allFiles
      }
    };
    console.log('======================>Creating Ideas');
    toast.update(ToastId, { render: 'Creating Ideas...', isLoading: true });

    let feed = {
      name: userInfo?.fullName.toString(),
      goalTitle: goal.Title,
      ideasid: null,
      daoId: daoId
    };

    async function onSuccess() {
      setIsCreating(false);
      onClose({ success: true });
      window.location.reload();
    }

    if (PolkadotLoggedIn) {
      let ideasId = Number(await api._query.ideas.ideasIds());
      feed.ideasid = ideasId;

      const txs = [api._extrinsics.ideas.createIdeas(JSON.stringify(createdObject), goalId, daoId, window.userid, JSON.stringify(feed)), api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'idea', new Date().valueOf())];

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Created successfully!', () => {
          onSuccess();
        });
      });
    }
  }

  function filehandleChange(ideas) {
    // If user uploaded images/videos
    var allNames = [];
    for (let index = 0; index < ideas.target.files.length; index++) {
      const element = ideas.target.files[index].name;
      allNames.push(element);
    }
    for (let index2 = 0; index2 < ideas.target.files.length; index2++) {
      setIdeaImage((pre) => [...pre, ideas.target.files[index2]]);
    }
  }

  async function CheckTransaction() {
    let params = new URL(window.location.href).searchParams;
    if (params.get('transactionHashes') !== null) {
      window.location.href = `daos/dao/goal?[${goalId}]`;
    }
  }

  CheckTransaction();

  function addImage() {
    var IdeasImagePic = document.getElementById('ideaImage');
    IdeasImagePic.click();
  }

  function deleteSelectedImages(idImage) {
    var newImages = [];
    var allUploadedImages = document.getElementsByName('deleteBTN');
    for (let index = 0; index < ideaImage.length; index++) {
      if (index != idImage) {
        const elementDeleteBTN = allUploadedImages[index];
        elementDeleteBTN.setAttribute('id', newImages.length.toString());
        const element = ideaImage[index];
        newImages.push(element);
      }
    }
    setIdeaImage(newImages);
  }

  function isInvalid() {
    return !(IdeasTitle && IdeasDescription && ideaImage.length > 0);
  }

  return (
    <Modal open={show} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan max-w-none w-screen h-screen absolute left-0 sm:relative sm:h-auto sm:w-[90%] sm:max-w-[600px] sm:max-h-[90vh] !rounded-none sm:!rounded-xl">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Create idea</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full p-6 max-h-[calc(90vh-162px)] overflow-auto">
            <div className="flex flex-col gap-2">
              <h6>
                Idea name
                <Required />
              </h6>
              {IdeasTitleInput}
              <div className="flex gap-2">
                {suggestions.map((suggestion, i) => (
                  <IdeaSuggestionBox suggestion={suggestion} key={i} onClick={() => setSuggestedIdea(suggestion)} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h6>
                Description
                <Required />
              </h6>
              {IdeasDescriptionInput}
            </div>

            <div className="flex flex-col gap-2">
              <h6>
                Image
                <Required />
              </h6>
              <div className="content-start flex flex-row flex-wrap gap-4 justify-start overflow-auto p-1 relative text-center text-white w-full">
                <input className="file-input" hidden onChange={filehandleChange} accept="image/*" id="ideaImage" name="ideaImage" type="file" multiple />
                <div className="flex flex-col gap-4">
                  {!ideaImage.length && <AddImageInput onClick={addImage} />}
                  <ImageListDisplay images={ideaImage} onDeleteImage={deleteSelectedImages} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-beerus w-full p-6 gap-4 absolute bottom-0 sm:relative">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button animation={isCreating ? 'progress' : false} disabled={isCreating || isInvalid()} onClick={create} className="flex-1 sm:flex-none">
            <ControlsPlus className="text-moon-24" />
            Create idea
          </Button>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
