import { useEffect, useState } from 'react';
import { Button, Dropdown, IconButton, MenuItem, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import UseFormInput from '../../components/components/UseFormInput';
import useEnvironment from '../../contexts/EnvironmentContext';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { toast } from 'react-toastify';

declare let window;
export default function DonateCoinToEventModal({ open, onClose, eventName, eventid, recieveWallet }) {
  const [Balance, setBalance] = useState('');
  const [Coin, setCoin] = useState('DOT');
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, PolkadotLoggedIn, userWalletPolkadot, userSigner, showToast, api } = usePolkadotContext();


  const [Amount, AmountInput] = UseFormInput({
    defaultValue: '',
    type: 'number',
    placeholder: '0.00',
    id: 'amount',
    className: 'max-w-[140px]'
  });

  async function DonateCoinSubmission(e) {
    e.preventDefault();
    console.clear();

    const ToastId = toast.loading('Donating....');

    setIsLoading(true);

    let feed = JSON.stringify({
      donated: Amount,
      eventTitle: eventName,
      eventid: eventid,
      userId: Number(window.userid)
    });

    async function onSuccess() {
      window.location.reload();
      LoadData();
      setIsLoading(false);

      onClose({ success: true });
    }

    toast.update(ToastId, { render: 'Sending Transaction...', isLoading: true });

    const txs = [api.tx.balances.transferAllowDeath(recieveWallet, `${Amount * 1e12}`), api._extrinsics.events.addDonation(eventid, `${Amount * 1e12}`, Number(window.userid)), api._extrinsics.feeds.addFeed(feed, 'donation', new Date().valueOf())];

    const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
      showToast(status, ToastId, 'Donation Successful!', onSuccess);
    });


  }

  async function LoadData() {
    if (!api) return;
    async function setPolkadot() {

      const { nonce, data: balance } = await api.query.system.account(userWalletPolkadot);

      setBalance((Number(balance.free.toString()) / 1e12).toString());
    }

    setPolkadot();
  }

  function isInvalid() {
    return !Amount;
  }


  useEffect(() => {
    LoadData();
  }, [open, api]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="min-w-[480px] bg-gohan">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Donate to {eventName}</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)]">
            <form id="doanteForm" autoComplete="off">
              <div className="flex flex-col gap-2 py-16 px-6">
                <div className="flex items-center ">
                  <span className="font-semibold flex-1">Total</span>
                  <div className="max-w-[140px] mr-4"> {AmountInput}</div>
                  <Dropdown value={Coin} onChange={setCoin} className="max-w-[100px] ">
                    <Dropdown.Select>{Coin}</Dropdown.Select>
                    <Dropdown.Options className="bg-gohan w-48 min-w-0">
                      <Dropdown.Option value="DOT">
                        <MenuItem >DOT</MenuItem>
                      </Dropdown.Option>
                    </Dropdown.Options>
                  </Dropdown>
                </div>
                <>
                  {Number(Balance) - Amount < 1 ? (
                    <>
                      <p className=" w-full text-right text-chichi">Insufficent Balance </p>
                    </>
                  ) : (
                    <>
                      <p className="text-trunks w-full text-right">Your balance will be {Number(Balance) - Amount + ' ' + Coin} </p>
                    </>
                  )}
                </>
              </div>

              <div className="flex justify-between border-t border-beerus w-full p-6">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button animation={isLoading ? 'progress' : false} disabled={isLoading || isInvalid()} onClick={DonateCoinSubmission}>
                  Donate
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
