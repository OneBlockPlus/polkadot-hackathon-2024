import meta from '@/assets/meta/hamster.meta.txt';

import { useReadState } from '.';
import { ENV } from '../сonsts';
import { useProgramMetadata } from './api';
import { useSendMessage } from '@gear-js/react-hooks';

export const programIdState = ENV.CONTRACT;

export function useHamsterState() {
  const { state } = useReadState<any>({
    programId: programIdState,
    meta,
    payload: '0x',
  });

  return { state };
}


// 读取用户当前拥有的 NFT
export function useCyborState() {
  const { state } = useReadState<any>({
    programId: programIdState,
    meta,
    payload: '0x',
  });

  return { state };
}


export function useStateMessage() {
  const metadata = useProgramMetadata(meta);
  return useSendMessage(programIdState, metadata, {
    disableAlerts: true,
  });
}
