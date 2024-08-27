import { useBalanceFormat, useApi } from '@gear-js/react-hooks';

import VaraSVG from '@/assets/vara.svg?react';
// import { useAccountDeriveBalancesAll } from '@/hooks';

import styles from './balance.module.scss';

function Balance() {
  const { isApiReady } = useApi();
  const { getFormattedBalance } = useBalanceFormat();

  // const balances = useAccountDeriveBalancesAll();
  // const balance = isApiReady && balances && getFormattedBalance(balances.freeBalance);

  // return balance ? (
  //   <div className={styles.balance}>
  //     <VaraSVG />

  //     <p className={styles.text}>
  //       {/* <span className={styles.value}>{balance.value}</span>
  //       <span className={styles.unit}>{balance.unit}</span> */}
  //     </p>
  //   </div>
  // ) : null;
  return null
}

export { Balance };
