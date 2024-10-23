import { HexString } from '@gear-js/api';

const ADDRESS = {
  NODE: import.meta.env.VITE_NODE_ADDRESS as string,
  CONTRACT: import.meta.env.VITE_CONTRACT_ADDRESS as HexString,
};

const ROUTE = {
  HOME: '/',
};

export { ADDRESS, ROUTE };
