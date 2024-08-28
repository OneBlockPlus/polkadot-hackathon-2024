import { useAccount } from '@gear-js/react-hooks';

import { ROUTE } from '@/consts';
import { Wallet, Balance } from '@/features/wallet';
import { Container } from '../container';
import { Logo } from '../logo';

import styles from './header.module.scss';

function Header() {
  const { account } = useAccount();

  return (
    <header className={styles.header}>
      <Container className={styles.container}>
        <Logo large />

        <div className={styles.wallet}>
          <div className={styles.buttons}>
            <Wallet />
          </div>
        </div>
      </Container>
    </header>
  );
}

export { Header };
