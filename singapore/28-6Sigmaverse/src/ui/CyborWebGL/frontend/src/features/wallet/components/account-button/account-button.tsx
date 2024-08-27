import { Button, ButtonProps } from '@gear-js/vara-ui';
import { Identicon } from '@polkadot/react-identicon';

import styles from './account-button.module.scss';

type Props = {
  name: string | undefined;
  address: string;
  color?: ButtonProps['color'];
  size?: ButtonProps['size'];
  block?: ButtonProps['block'];
  onClick: () => void;
};

function AccountButton({ address, name, color, size, block, onClick }: Props) {
  return (
    <Button onClick={onClick} color={color} size={size} block={block} className={styles.button}>
      <Identicon value={address} size={16} theme="polkadot" /> <span>{name || address}</span>
    </Button>
  );
}

export { AccountButton };
