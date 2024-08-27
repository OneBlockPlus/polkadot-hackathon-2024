import { ReactNode } from 'react';

import { cx } from '@/utils';

import styles from './container.module.scss';

type Props = {
  children: ReactNode;
  maxWidth?: 'xl' | 'sm';
  className?: string;
};

function Container({ children, maxWidth = 'xl', className }: Props) {
  return <div className={cx(styles.container, styles[maxWidth], className)}>{children}</div>;
}

export { Container };
