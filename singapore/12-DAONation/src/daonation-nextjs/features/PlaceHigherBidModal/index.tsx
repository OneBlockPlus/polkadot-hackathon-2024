import { MouseEventHandler, useEffect, useState } from 'react';
import { Button, Dropdown, IconButton, MenuItem, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import UseFormInput from '../../components/components/UseFormInput';
import useEnvironment from '../../contexts/EnvironmentContext';
import { NFT } from '../../data-model/nft';
import { toast } from 'react-toastify';
import { usePolkadotContext } from '../../contexts/PolkadotContext';

declare let window;
export default function PlaceHigherBidModal({ open, onClose, item, recieveWallet }: { open: boolean; onClose: () => void; item: NFT; recieveWallet: String }) {
  const [BalanceAmount, setBalanceAmount] = useState(0);
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

  async function onSuccess() {
    setIsLoading(false);
    onClose();
    window.location.reload();
  }

  async function placeBidOnNFT() {
    if (item.highest_amount < Amount) {
      setIsLoading(true);

      console.log('======================>Bidding NFT');
      const ToastId = toast.loading('Bidding NFT ...');

      let feed = {
        name: userInfo?.fullName,
        nftid: item.id,
        bidid: null
      };

      try {
        let bidId = Number(await api._query.events.bidIds());
        feed.bidid = bidId;

        const txs = [api.tx.balances.transferAllowDeath(recieveWallet, `${Amount * 1e12}`), api._extrinsics.events.bidToken(`${Amount * 1e12}`, item.id, item.eventid, item.daoid, new Date().toLocaleDateString(), userInfo.fullName?.toString(), window.signerAddress, Number(window.userid)), api._extrinsics.feeds.addFeed(JSON.stringify(feed), 'bid', new Date().valueOf())];

        await api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
          showToast(status, ToastId, 'Bid Successful!', onSuccess);
        });
      } catch (error) {
        setIsLoading(false);
        console.error(error);

        return;
      }
    }
  }

  async function LoadData() {
    if (!api) return;
    async function setPolkadot() {
      const { nonce, data: balance } = await api.query.system.account(userWalletPolkadot);

      setBalanceAmount(Number((Number(balance.free.toString()) / 1e12).toString()));
    }

    setPolkadot();
  }

  function isInvalid() {
    return !Amount || item?.highest_amount >= Amount;
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
            <h1 className="text-moon-20 font-semibold">Place bid on {item?.name}</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)]">
            <form id="doanteForm" autoComplete="off">
              <div className="flex flex-col gap-2 py-16 px-6">
                <div className="flex items-center ">
                  <span className="font-semibold flex-1">Highest Bid Amount</span>
                  <div className="max-w-[140px] mr-4">
                    {Coin} {item?.highest_amount ?? 0}
                  </div>
                </div>
                <div className="flex items-center ">
                  <span className="font-semibold flex-1">Total</span>
                  <div className="max-w-[140px] mr-4"> {AmountInput}</div>
                  {Coin}
                </div>
                {Coin != '' ? (
                  <>
                    {Number(BalanceAmount) - Amount < 1 ? (
                      <>
                        <p className=" w-full text-right text-chichi">Insufficent Balance </p>
                      </>
                    ) : (
                      <>
                        <p className="text-trunks w-full text-right">Your balance will be {Number(BalanceAmount) - Amount + ' ' + Coin} </p>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </div>
            </form>
            <div className="flex justify-between border-t border-beerus w-full p-6">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button animation={isLoading ? 'progress' : false} disabled={isLoading || isInvalid()} onClick={placeBidOnNFT}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
