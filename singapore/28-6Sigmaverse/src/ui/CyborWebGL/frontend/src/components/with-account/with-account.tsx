import { useAccount } from '@gear-js/react-hooks';
import { FunctionComponent } from 'react';

function withAccount<T>(Component: FunctionComponent<T>) {
  return function WithAccount(props: T & JSX.IntrinsicAttributes) {
    const { account, isAccountReady } = useAccount();

    return isAccountReady && account ? <Component {...props} /> : null;
  };
}

export { withAccount };
