import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, ControlsPlus } from '@heathmont/moon-icons-tw';
import React, { useEffect, useState } from 'react';
import UseFormInput from '../../components/components/UseFormInput';
import UseFormTextArea from '../../components/components/UseFormTextArea';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { useIPFSContext } from '../../contexts/IPFSContext';

import AddImageInput from '../../components/components/AddImageInput';
import ImageListDisplay from '../../components/components/ImageListDisplay';
import { toast } from 'react-toastify';
import Required from '../../components/components/Required';
import ColorPicker from '../../components/components/ColorPicker';
import { CommunityService } from '../../services/communityService';
import { useRouter } from 'next/router';

let addedDate = false;
export default function CreateDaoModal({ open, onClose }) {
  const [DaoImage, setDaoImage] = useState([]);
  const [creating, setCreating] = useState(false);
  const [brandingColor, setBrandingColor] = useState('');

  const { api, showToast, userWalletPolkadot, userSigner, PolkadotLoggedIn, GetAllDaos } = usePolkadotContext();
  const router = useRouter();

  const { UploadBlob } = useIPFSContext();

  //Input fields
  const [DaoTitle, DaoTitleInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add name',
    id: ''
  });

  const [CustomUrl, CustomUrlInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'your-custom',
    id: ''
  });

  const [StartDate, StartDateInput, setStartDate] = UseFormInput({
    defaultValue: '',
    type: 'date',
    placeholder: 'Start date',
    id: 'startdate'
  });

  const [SubsPrice, SubsPriceInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: '0.00',
    id: 'subs_price'
  });

  //Function after clicking Create Dao Button
  async function createDao() {
    const toastId = toast.loading('Uploading IPFS ...');
    setCreating(true);

    let allFiles = [];
    for (let index = 0; index < DaoImage.length; index++) {
      //Gathering all files link
      const element = DaoImage[index];
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
          description: DaoTitle
        },
        Description: {
          type: 'string',
          description: 'Here goes the DAO description'
        },
        Start_Date: {
          type: 'string',
          description: new Date().toLocaleDateString()
        },
        logo: {
          type: 'string',
          description: allFiles[0]
        },
        wallet: {
          type: 'string',
          description: '5EEeMmY9B37Zwio7Q9t9EizBK5bCX9VgKRSA49zZB8zjsuXd'
        },
        user_id: {
          type: 'string',
          description: window.userid
        },
        SubsPrice: {
          type: 'number',
          description: SubsPrice
        },
        typeimg: {
          type: 'string',
          description: 'Dao'
        },
        Created_Date: {
          type: 'string',
          description: new Date().toLocaleDateString()
        },
        brandingColor: { type: 'string', description: brandingColor },
        customUrl: {
          type: 'string',
          description: CustomUrl
        },
        allFiles
      }
    };
    console.log('======================>Creating Dao');

    toast.update(toastId, { render: 'Creating Dao...', isLoading: true });

    async function onSuccess() {
      setCreating(false);

      const daos = await GetAllDaos();
      const newDao = daos.find((dao) => dao.customUrl === CustomUrl);

      await CommunityService.create({ template: '', polkadotReferenceId: newDao.daoId, name: DaoTitle, imageUrl: newDao.logo, brandingColor, subdomain: CustomUrl, description: '' });

      window.location.href = `${location.protocol}//${newDao.customUrl}.${location.host}/daos/${newDao.daoId}`;
    }
    if (PolkadotLoggedIn) {
      await api._extrinsics.daos.createDao(userWalletPolkadot, JSON.stringify(createdObject), {}).signAndSend(userWalletPolkadot, { signer: userSigner }, async (status) => {
        showToast(status, toastId, 'Created Successfully!', onSuccess);
      });
    }
  }

  function logoHandleChange(dao) {
    var allNames = [];
    for (let index = 0; index < dao.target.files.length; index++) {
      const element = dao.target.files[index].name;
      allNames.push(element);
    }
    for (let index2 = 0; index2 < dao.target.files.length; index2++) {
      setDaoImage((pre) => [...pre, dao.target.files[index2]]);
    }
  }

  function isInvalid() {
    return !(DaoTitle && SubsPrice && brandingColor);
  }

  function addLogo() {
    const charityLogo = document.getElementById('charityLogo') as HTMLElement;
    charityLogo.click();
  }

  function deleteSelectedLogoImages(idImage) {
    var newImages = [];
    var allUploadedImages = document.getElementsByName('deleteBTN');
    for (let index = 0; index < DaoImage.length; index++) {
      if (index != idImage) {
        const elementDeleteBTN = allUploadedImages[index];
        elementDeleteBTN.setAttribute('id', newImages.length.toString());
        const element = DaoImage[index];
        newImages.push(element);
      }
    }
    setDaoImage(newImages);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan max-w-none w-screen h-screen absolute left-0 sm:relative sm:h-auto sm:w-[90%] sm:max-w-[600px] sm:max-h-[90vh] !rounded-none sm:!rounded-xl">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Create charity</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={() => onClose()} />
          </div>
          <div className="flex flex-col gap-6 w-full p-6  max-h-[calc(95vh-220px)] overflow-auto">
            <div className="flex flex-col gap-2">
              <h6>
                Charity name
                <Required />
              </h6>
              {DaoTitleInput}
            </div>

            <div className="flex flex-col gap-2">
              <h6>
                Your custom URL
                <Required />
              </h6>
              <div className="flex gap-4 w-full items-center">
                <span className="flex-1">{CustomUrlInput}</span>
                <span className="flex-1">.daonation.org</span>
              </div>
            </div>

            <div className="flex gap-8 w-full">
              <div className="flex flex-col gap-2 w-full">
                <h6>
                  Subscription Price (in DOT)
                  <Required />
                </h6>
                {SubsPriceInput}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h6>
                Your charity logo
                <Required />
              </h6>
              <div className="content-start flex flex-row flex-wrap gap-4 justify-start overflow-auto relative text-center text-white w-full">
                <input className="file-input" hidden onChange={logoHandleChange} accept="image/*" id="charityLogo" name="charityLogo" type="file" />
                <div className="flex flex-col">
                  {DaoImage.length < 1 && <AddImageInput onClick={addLogo} />}
                  <ImageListDisplay images={DaoImage} onDeleteImage={deleteSelectedLogoImages} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h6>
                Your charity color
                <Required />
              </h6>
              <ColorPicker brandingColor={brandingColor} setBrandingColor={setBrandingColor} />
            </div>

            {/* <div className="flex gap-8 w-full">
              <div className="flex-1">
                <h6>
                  Start Date
                  <Required />
                </h6>
                {StartDateInput}
              </div>
            </div> */}
            {/* <div className="flex flex-col gap-2">
              <h6>
                Image
                <Required />
              </h6>
              <div className="content-start flex flex-row flex-wrap gap-4 justify-start overflow-auto relative text-center text-white w-full">
                <input className="file-input" hidden onChange={filehandleChange} accept="image/*" id="communityImage" name="communityImage" type="file" />
                <div className="flex flex-col">
                  {communityImage.length < 1 && <AddImageInput onClick={addImage} />}
                  <ImageListDisplay images={communityImage} onDeleteImage={deleteSelectedImages} />
                </div>
              </div>
            </div> */}
            <div className="flex flex-col gap-1">
              <h6>Vote power distribution</h6>
              <div className="flex gap-8">
                <div className="bg-white rounded-lg flex flex-1 flex-col">
                  <div className="flex w-full h-12 items-center">
                    <h6 className="text-moon-18 font-semibold flex-1">Level 1 (lowest)</h6>
                    <span className="text-trunks w-[160px]">1</span>
                    <span className="text-trunks">votes</span>
                  </div>
                  <div className="flex w-full h-12 items-center">
                    <h6 className="text-moon-18 font-semibold flex-1">Level 2</h6>
                    <span className="text-trunks w-[160px]">2</span>
                    <span className="text-trunks">votes</span>
                  </div>
                  <div className="flex w-full h-12 items-center">
                    <h6 className="text-moon-18 font-semibold flex-1">Level 3</h6>
                    <span className="text-trunks w-[160px]">3</span>
                    <span className="text-trunks">votes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t border-beerus w-full p-6 gap-4 absolute sm:relative bottom-0">
          <Button variant="ghost" onClick={() => onClose()} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button className="flex-1 sm:flex-none" animation={creating ? 'progress' : false} disabled={creating || isInvalid()} onClick={createDao}>
            <ControlsPlus className="text-moon-24" />
            Create charity
          </Button>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
