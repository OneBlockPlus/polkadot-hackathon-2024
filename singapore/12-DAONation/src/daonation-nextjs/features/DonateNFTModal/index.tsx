import { useEffect, useState } from 'react';
import { Button, Dropdown, IconButton, MenuItem, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import UseFormInput from '../../components/components/UseFormInput';
import useEnvironment from '../../contexts/EnvironmentContext';
import UseFormTextArea from '../../components/components/UseFormTextArea';
import Required from '../../components/components/Required';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
declare let window;

export default function DonateNFTModal({ open, onClose, eventName, eventid,daoid }) {
  const { userInfo, PolkadotLoggedIn,userWalletPolkadot,userSigner,showToast, api } = usePolkadotContext();

  const [isLoading, setIsLoading] = useState(false);

  const { getCurrency } = useEnvironment();

  //Input fields
  const [link, LinkInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add link',
    id: 'url',
    className: 'rounded-b-none'
  });

  const [name, NameInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add name',
    id: ''
  });

  const [description, DescriptionInput] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add Description',
    id: 'description',
    rows: 4
  });

  const [price, PriceInput] = UseFormInput({
    defaultValue: '',
    type: 'number',
    placeholder: 'Add amount',
    id: 'price',
    className: 'max-w-[344px]'
  });

  async function DonateNFT() {
    setIsLoading(true);

    console.log('======================>Donating NFT');
    const ToastId = toast.loading('Donating NFT ...');

    //Creating an object of all information to store in EVM
    const createdObject = {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Link: {
          type: 'string',
          description: link
        },
        Name: {
          type: 'string',
          description: name
        },
        Description: {
          type: 'string',
          description: description
        },
        Price: {
          type: 'number',
          description: price
        },
        Date: {
          type: 'date',
          description: new Date().toLocaleDateString()
        },
        wallet: {
          type: 'string',
          description: window.signerAddress
        },
        user_id: {
          type: 'number',
          description: window.userid
        },

      }
    };


    async function onSuccess() {
      setIsLoading(false);
      onClose({ success: true });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }



    if (PolkadotLoggedIn) {

      
      const txs = [api._extrinsics.events.claimToken(Number(daoid),Number(eventid),JSON.stringify(createdObject), `${Number(price)*1e12}`,Number(window.userid),window.signerAddress, userInfo.fullName?.toString(),new Date().toLocaleDateString())];

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Donated successfully!', () => {
          onSuccess();
        });
      });

    }


  }

  async function LoadData() { }

  useEffect(() => {
    LoadData();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan w-[90%] max-w-[760px] max-h-[90vh]">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Donate NFT to {eventName}</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <form autoComplete="off" className="w-full">
            <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)] p-6">
              <div className="flex flex-col gap-2">
                <h6>
                  NFT URL
                  <Required />
                </h6>
                <div className="relative h-[150px] w-full border border-beerus bg-goku -mt-2 border-t-0 rounded-b-lg">{link ? <Image unoptimized={true} src={link} alt="" objectFit="contain" layout="fill" /> : <div className='p-3'>No Image placeholder</div>}</div>
                {LinkInput}
              </div>
              <div className="flex flex-col gap-2">
                <h6>
                  NFT name
                  <Required />
                </h6>
                {NameInput}
              </div>

              <div className="flex flex-col gap-2">
                <h6>
                  Description
                  <Required />
                </h6>
                {DescriptionInput}
              </div>
              <div className="flex flex-col gap-2">
                <h6>
                  Opening price in {getCurrency()}
                  <Required />
                </h6>
                {PriceInput}
              </div>
            </div>
          </form>

          <div className="flex justify-between border-t border-beerus w-full p-6">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button animation={isLoading ? 'progress' : false} disabled={isLoading} onClick={DonateNFT}>
              Donate
            </Button>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
