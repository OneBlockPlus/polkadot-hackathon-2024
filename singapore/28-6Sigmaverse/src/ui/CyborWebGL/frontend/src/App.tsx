import '@gear-js/vara-ui/dist/style.css';
import { useAccount, useApi } from '@gear-js/react-hooks';

import { withProviders } from './providers';
import { Container, Footer, Header } from './components';
import { useWalletSync } from './features/wallet/hooks/use-wallet';
import { Routing } from './pages';
import { Alert } from '@gear-js/vara-ui';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady, accounts, account } = useAccount();

  useWalletSync();

  const isAppReady = isApiReady && isAccountReady;

  return (
    <main>
      {isAppReady ? (
        <>
          <Header />
          <Routing />
          <Container>
            <Footer />
          </Container>
        </>
      ) : (
        <Container>
          <center>
          <h2 style={{color: '#ecf5fe', padding: 150}}>Please Connect Account ...</h2>
          </center>
        <Footer />
        </Container>
      )}
    </main>
  );
}

export const App = withProviders(Component);
