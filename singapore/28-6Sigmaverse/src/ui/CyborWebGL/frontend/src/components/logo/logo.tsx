import { Link } from 'react-router-dom';

import { ROUTE } from '@/consts';

import SVG from './logo.svg?react';

type Props = {
  large?: boolean;
};

function Logo({ large }: Props) {
  return (
    <Link to={ROUTE.HOME}>
      {/* <SVG width={large ? 100 : 60} height={large ? 28 : 16} /> */}
      {<h1 style={{fontFamily: 'Arial, sans-serif' , color:'#7dfbcf'}}> &Sigma; - 6Sigmaverse</h1>}
    </Link>
  );
}

export { Logo };
