import React, { useState, useEffect } from 'react';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { Button, IconButton, Dropdown, MenuItem, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

declare let window;

export default function JoinCommunityModal({ SubsPrice, show, onHide, address, recieveWallet, recievetype, title, daoId,customUrl }) {
  const [Balance, setBalance] = useState(0);
  const [Token, setToken] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [Amount, setAmount] = useState(0);
  const [Coin, setCoin] = useState('');
  const router = useRouter();


  const { userInfo, PolkadotLoggedIn, userWalletPolkadot, userSigner, showToast, api } = usePolkadotContext();


  async function JoinSubmission(e) {
    e.preventDefault();
    console.clear();


    setisLoading(true);
    const ToastId = toast.loading('Joining charity ...');
    let feed = JSON.stringify({
      daoId: daoId,
      name: userInfo?.fullName?.toString()
    });
    async function onSuccess() {
      router.push(`${location.protocol}//${customUrl}.${location.host}/daos/${daoId}`);
      LoadData();
      setisLoading(false);
      onHide({ success: true });
    }
    if (Coin == 'DOT') {
      toast.update(ToastId, {
        render: 'Joining charity....'
      });
      let recipient = recievetype == 'Polkadot' ? recieveWallet : address;
      const txs = [api.tx.balances.transferAllowDeath(recipient, `${Amount * 1e12}`), api._extrinsics.daos.joinCommunity(daoId, Number(window.userid), new Date().toLocaleDateString(), feed), api._extrinsics.feeds.addFeed(feed, 'join', new Date().valueOf())];

      const transfer =  await api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, ToastId, 'Joined successfully!', () => {
          onSuccess();
        });
      });
    }
  }

  async function LoadData(currencyChanged = false) {
    async function setPolkadot() {
      setToken('DOT');
      setCoin('DOT');

      const { nonce, data: balance } = await api.query.system.account(userWalletPolkadot);
      setBalance(Number(balance.free.toString()) / 1e12);
    }

    if (PolkadotLoggedIn && currencyChanged == false) {
      setPolkadot();
    } else if (currencyChanged == true && Coin == 'DOT') {
      setPolkadot();
    }
  }
  useEffect(() => {
    if (Coin !== '') LoadData(true);
  }, [Coin]);

  useEffect(() => {
    LoadData();
  }, [show]);

  return (
    <Modal open={show} onClose={onHide} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan w-[90%] max-w-[480px]">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Join charity "{title}"</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onHide} />
          </div>
          {/* <div name="alertbox" hidden>
            <Alert variant="filled" sx={{ my: 1 }} name="pendingAlert" severity="info">
              Pending....
            </Alert>
            <Alert variant="filled" sx={{ my: 1 }} name="successAlert" severity="success">
              Success....
            </Alert>
            <Alert variant="filled" sx={{ my: 1 }} name="errorAlert" severity="error">
              Error....
            </Alert>
          </div> */}

          <div className="flex flex-col gap-3 w-full p-8">
            <div className="flex justify-between pt-8">
              <h4 className="font-semibold text-moon-18">Price</h4>
              <h4 className="font-semibold text-moon-18">{SubsPrice} DOT</h4>
            </div>

            <>
                  {Number(Balance) - SubsPrice < 1 ? (
                    <>
                      <p className=" w-full text-right text-chichi">Insufficent Balance </p>
                    </>
                  ) : (
                    <>
                      <p className="text-trunks w-full text-right">Your balance will be {Number(Balance) - SubsPrice + ' ' + Coin} </p>
                    </>
                  )}
            </>

           
          </div>

          <div className="flex justify-between border-t border-beerus w-full p-6">
            <Button variant="ghost" onClick={onHide}>
              Cancel
            </Button>
            <Button id="CreateGoalBTN" type="submit" onClick={JoinSubmission} animation={isLoading ? 'progress' : false}>
              Join
            </Button>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
