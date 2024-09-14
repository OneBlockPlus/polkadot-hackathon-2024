import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, ControlsPlus, GenericLoyalty, MediaMiceAlternative } from '@heathmont/moon-icons-tw';
import { NFTStorage } from 'nft.storage';
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
import EventTypeOption from '../../components/components/EventTypeOption';

declare let window;
export default function CreateEventModal({ open, onClose, daoId }) {
  const [eventImages, setEventImages] = useState([]);
  const [eventType, setEventType] = useState<'auction' | 'livestream'>('auction');
  const [creating, setCreating] = useState(false);
  const { api, userInfo, showToast, userWalletPolkadot, userSigner, PolkadotLoggedIn } = usePolkadotContext();
  const { UploadBlob } = useIPFSContext();

  const { isServer } = useEnvironment();

  //Input fields
  const [EventTitle, EventTitleInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add name',
    id: ''
  });

  const [eventStreamUrl, EventStreamUrlInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add link',
    id: 'eventStream'
  });

  const [EventDescription, EventDescriptionInput] = UseFormTextArea({
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

  const [Time, TimeInput, setTime] = UseFormInput({
    defaultValue: '',
    type: 'time',
    placeholder: '',
    id: 'time'
  });

  const [Budget, BudgetInput] = UseFormInput({
    defaultValue: '',
    type: 'number',
    placeholder: '0.00',
    id: 'event'
  });

  const [ticketPrice, TicketPriceInput] = UseFormInput({
    defaultValue: '',
    type: 'number',
    placeholder: '0.00',
    id: 'ticketPrice'
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

  //Function after clicking Create Event Button
  async function create() {
    setCreating(true);

    const ToastId = toast.loading('Uploading IPFS ...');
    let allFiles = [];
    for (let index = 0; index < eventImages.length; index++) {
      //Gathering all files link
      const element = eventImages[index];
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
          description: EventTitle
        },
        Description: {
          type: 'string',
          description: EventDescription
        },
        Budget: {
          type: 'string',
          description: Budget
        },
        End_Date: {
          type: 'string',
          description: EndDate
        },
        Time: {
          type: 'string',
          description: Time
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
        eventStreamUrl: {
          type: 'string',
          description: eventStreamUrl
        },
        ticketPrice: {
          type: 'string',
          description: ticketPrice
        },
        eventType: {
          type: 'string',
          description: eventType
        },
        allFiles
      }
    };
    console.log('======================>Creating Event');
    toast.update(ToastId, { render: 'Creating Event...', isLoading: true });

    let feed = {
      name: userInfo?.fullName,
      daoId: daoId,
      eventid: null,
      budget: Budget
    };

    async function onSuccess() {
      setCreating(false);
      onClose({ success: true });
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    let eventid = Number(await api._query.events.eventIds());
    feed.eventid = eventid;

    const txs = [api._extrinsics.events.createEvent(JSON.stringify(createdObject), Number(daoId), Number(window.userid)), api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'event', new Date().valueOf())];

    await api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
      showToast(status, ToastId, 'Created Successfully!', onSuccess);
    });
  }

  function filehandleChange(event) {
    // If user uploaded images/videos
    var allNames = [];
    for (let index = 0; index < event.target.files.length; index++) {
      const element = event.target.files[index].name;
      allNames.push(element);
    }
    for (let index2 = 0; index2 < event.target.files.length; index2++) {
      setEventImages((pre) => [...pre, event.target.files[index2]]);
    }
  }

  function addImage(event) {
    //Clicking on +(Add) Function
    var EventImagePic = document.getElementById('EventImage');
    EventImagePic.click();
  }

  function deleteSelectedImages(imageId) {
    //Deleting the selected image
    var newImages = [];
    var allUploadedImages = document.getElementsByName('deleteBTN');
    for (let index = 0; index < eventImages.length; index++) {
      if (index != imageId) {
        const elementDeleteBTN = allUploadedImages[index];
        elementDeleteBTN.setAttribute('id', newImages.length.toString());
        const element = eventImages[index];
        newImages.push(element);
      }
    }
    setEventImages(newImages);
  }

  function isInvalid() {
    return !(EventTitle && EventDescription && (Budget || (ticketPrice && eventStreamUrl)) && EndDate && eventImages.length > 0);
  }

  useEffect(() => {
    console.log(daoId);
    let dateTime = new Date();

    setEndDate(dateTime.toISOString().split('T')[0]);
    setTime('12:00');
  }, [daoId]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan max-w-none w-screen h-screen absolute left-0 sm:relative sm:h-auto sm:w-[90%] sm:max-w-[720px] sm:max-h-[90vh] !rounded-none sm:!rounded-xl">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Create event</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full p-6  max-h-[calc(90vh-162px)] overflow-auto">
            <div className="flex gap-4">
              <EventTypeOption icon={<MediaMiceAlternative height={32} width={32} />} label="Live-streaming event" description="Sell tickets for a live stream" selected={eventType === 'livestream'} onClick={() => setEventType('livestream')} />
              <EventTypeOption icon={<GenericLoyalty height={32} width={32} />} label="Auction event" description="Collect NFTs and auction them" selected={eventType === 'auction'} onClick={() => setEventType('auction')} />
            </div>
            {eventType === 'livestream' && (
              <div className="flex flex-col gap-2">
                <h6>
                  Link to stream
                  <Required />
                </h6>
                {EventStreamUrlInput}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h6>
                Event name
                <Required />
              </h6>
              {EventTitleInput}
            </div>

            <div className="flex flex-col gap-2">
              <h6>
                Description
                <Required />
              </h6>
              {EventDescriptionInput}
            </div>
            {eventType === 'auction' && (
              <div className="flex gap-8 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <h6>
                    Fundraise target (in DOT)
                    <Required />
                  </h6>
                  {BudgetInput}
                </div>
              </div>
            )}
            {eventType === 'livestream' && (
              <div className="flex gap-8 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <h6>
                    Price per ticket (in DOT)
                    <Required />
                  </h6>
                  {TicketPriceInput}
                </div>
              </div>
            )}
            <div className="flex gap-6 w-full">
              <div className="flex-1">
                <h6>
                  {eventType === 'auction' ? 'End date' : 'Start date'}
                  <Required />
                </h6>
                {EndDateInput}
              </div>
              <div className="flex-1">
                <h6>
                  Time
                  <Required />
                </h6>
                {TimeInput}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h6>
                Image
                <Required />
              </h6>
              <div className="content-start flex flex-row flex-wrap gap-4 justify-start overflow-auto relative text-center text-white w-full">
                <input className="file-input" hidden onChange={filehandleChange} accept="image/*" id="EventImage" name="EventImage" type="file" />
                <div className="flex flex-col">
                  {eventImages.length < 1 && <AddImageInput onClick={addImage} />}
                  <ImageListDisplay images={eventImages} onDeleteImage={deleteSelectedImages} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-beerus w-full p-6 gap-4 absolute sm:relative bottom-0">
          <Button variant="ghost" onClick={() => onClose()} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button className="flex-1 sm:flex-none" animation={creating ? 'progress' : false} disabled={creating || isInvalid()} onClick={create}>
            <ControlsPlus className="text-moon-24" />
            Create Event
          </Button>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
