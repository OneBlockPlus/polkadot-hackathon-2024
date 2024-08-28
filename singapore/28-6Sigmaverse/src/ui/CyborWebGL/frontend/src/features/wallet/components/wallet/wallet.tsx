import { useAccount } from '@gear-js/react-hooks';

import { useModal } from '@/hooks/use-modal';

import { AccountButton } from '../account-button';
import { WalletModal } from '../wallet-modal';

import { VaraBalance } from '../vara-balance';
import { Button } from '@gear-js/vara-ui';

function Wallet() {
  const { account, isAccountReady } = useAccount();
  const [isModalOpen, openModal, closeModal] = useModal();

  return isAccountReady ? (
    <>
      {account ? (
        <>
          <VaraBalance />
          <AccountButton color="border" address={account.address} name={account.meta.name} onClick={openModal} />
        </>
      ) : (
        <Button onClick={openModal}>Connect Wallet</Button>
      )}

      {isModalOpen && <WalletModal close={closeModal} />}
    </>
  ) : null;
}

export { Wallet };
