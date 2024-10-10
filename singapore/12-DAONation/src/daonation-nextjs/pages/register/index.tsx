import Head from 'next/head';
import Image from 'next/legacy/image';
import UseFormInput from '../../components/components/UseFormInput';
import { FilesGeneric, GenericUser, SoftwareLogin } from '@heathmont/moon-icons-tw';
import Card from '../../components/components/Card';
import { Avatar, Button, IconButton } from '@heathmont/moon-core-tw';
import { useState } from 'react';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { useIPFSContext } from '../../contexts/IPFSContext';
import { toast } from 'react-toastify';
import validator from 'validator';
import Required from '../../components/components/Required';
import { useRouter } from 'next/router';
import { useConnectWallet } from '@subwallet-connect/react';
import Cookies from 'js-cookie';
import { Bytes, Data, Enum, Null, Option, Struct, U8aFixed, Vec, u128, u32, u8, } from '@polkadot/types';

import { AccountId32 } from '@polkadot/types/interfaces';
import { AnyJson, BareOpts, Codec, Inspect, ITuple } from '@polkadot/types/types';

import PolkadotConfig from '../../contexts/json/polkadot-config.json';
import { HexString } from '@polkadot/util/types';
import { ApiPromise } from '@polkadot/api';

export interface PalletIdentityIdentityInfo extends Struct {
  readonly additional: Vec<ITuple<[Data, Data]>>;
  readonly display: Data;
  readonly legal: Data;
  readonly web: Data;
  readonly riot: Data;
  readonly email: Data;
  readonly pgpFingerprint: Option<U8aFixed>;
  readonly image: Data;
  readonly twitter: Data;
}

export default function Register() {
  const { api, deriveAcc, showToast } = usePolkadotContext();
  const { UploadBlob } = useIPFSContext();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [{ wallet }, connect] = useConnectWallet();

  //Input fields
  const [image, set_Image] = useState({} as File);
  const [Fullname, FullnameInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add name',
    id: ''
  });

  const [Email, EmailInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Add email',
    id: ''
  });

  const [Password, PasswordInput] = UseFormInput({
    defaultValue: '',
    type: 'password',
    placeholder: 'Add password',
    id: ''
  });

  function chooseImage() {
    let input = document.createElement('input');
    input.type = 'file';
    input.removeAttribute('multiple');
    input.setAttribute('accept', 'image/*');
    input.onchange = () => {
      set_Image((input as HTMLInputElement).files[0]);
    };
    input.click();
  }
  function createRawData(api: ApiPromise, data?: string): Data {
    return new Data(api.registry, { raw:  data });
  }
  async function registerAccount() {
    const ToastId = toast.loading('Uploading IPFS ...');
    const metadata:string = image.type ? await UploadBlob(image,true) : '';
    toast.update(ToastId, { render: 'Registering User...', isLoading: true });

    const doAfter = () => {
      
    Cookies.remove('loggedin'); // covers localhost
    Cookies.remove('user_id'); // covers localhost

      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    };
    // const txs = [api._extrinsics.users.registerUser(Fullname, Email, Password, metadata), api._extrinsics.identity.setIdentity([], )];
    let payload :any   = {
      display: createRawData(api, Fullname),
      legal: createRawData(api, Fullname),
      web: createRawData(api, ''),
      riot: createRawData(api, ''),
      email: createRawData(api, Email),
      pgpFingerprint: undefined,
      image: createRawData(api, metadata),
      twitter: createRawData(api, ''),

      eq: function (other?: unknown): boolean {
        throw new Error('Function not implemented.');
      },
      get: function (key: string): Codec | undefined {
        throw new Error('Function not implemented.');
      },
      getAtIndex: function (index: number): Codec {
        throw new Error('Function not implemented.');
      },
      getT: function <T = Codec>(key: string): T {
        throw new Error('Function not implemented.');
      },
      inspect: function (isBare?: BareOpts): Inspect {
        throw new Error('Function not implemented.');
      },
      toArray: function (): Codec[] {
        throw new Error('Function not implemented.');
      },
      toHex: function (): HexString {
        throw new Error('Function not implemented.');
      },
      toHuman: function (isExtended?: boolean, disableAscii?: boolean): Record<string, AnyJson> {
        throw new Error('Function not implemented.');
      },
      toJSON: function (): Record<string, AnyJson> {
        throw new Error('Function not implemented.');
      },
      toPrimitive: function (disableAscii?: boolean): Record<string, AnyJson> {
        throw new Error('Function not implemented.');
      },
      toRawType: function (): string {
        throw new Error('Function not implemented.');
      },
      toU8a: function (isBare?: BareOpts): Uint8Array {
        throw new Error('Function not implemented.');
      },
      clear: function (): void {
        throw new Error('Function not implemented.');
      },
      delete: function (key: string): boolean {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: Codec, key: string, map: Map<string, Codec>) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      },
      has: function (key: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (key: string, value: Codec): PalletIdentityIdentityInfo {
        throw new Error('Function not implemented.');
      },
      size: 0,
      entries: function (): IterableIterator<[string, Codec]> {
        throw new Error('Function not implemented.');
      },
      keys: function (): IterableIterator<string> {
        throw new Error('Function not implemented.');
      },
      values: function (): IterableIterator<Codec> {
        throw new Error('Function not implemented.');
      },
      [Symbol.iterator]: function (): IterableIterator<[string, Codec]> {
        throw new Error('Function not implemented.');
      },
      [Symbol.toStringTag]: '',
      additional: [],
      '#private': undefined,
      registry: undefined,
      defKeys: [],
      isEmpty: false,
      encodedLength: 0,
      hash: undefined,
      Type: undefined
    }
    


    const txs = [api._extrinsics.identity.setIdentity(payload), api._extrinsics.users.registerUser(Fullname, Email, Password, metadata)];

    await api.tx.utility.batch(txs).signAndSend(wallet.accounts[0].address, { signer: wallet.signer }, (status) => {
      showToast(status, ToastId, 'Registered Successfully!', doAfter);
    });

  }

  function isDisabled() {
    return !(Fullname && validator.isEmail(Email) && Password);
  }


  async function onConnectPolkadot() {
    await connect();

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 2);

    setIsConnected(true);
  }
  const ConnectSubWalletButton = () => (
    <Card className="max-w-[480px] w-full">
      <div className="flex w-full flex-col gap-10">
        <div className="flex items-center w-full justify-between">
          <div className="rounded-moon-s-md border border-beerus p-2 mr-6 min-w-[84px]">
            <Image height={64} width={64} src="/images/subwallet.webp" alt="" />
          </div>
          <div className="flex flex-col justify-between xs:flex-row xs:w-full">
            <p className="font-bold text-moon-20 flex-1">Subwallet</p>
            <Button className="min-w-[175px] xs:min-w-0" iconLeft={<SoftwareLogin />} onClick={onConnectPolkadot}>
              Connect
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
  function goToFaucet() {
    return (`https://polkadot.js.org/apps/?rpc=${PolkadotConfig.chain_rpc}#/accounts`);
  }
  return (
    <>
      <Head>
        <title>Register</title>
        <meta name="description" content="DAOnation - Register" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        <div className="gap-8 flex flex-col w-full bg-gohan pt-10 pb-6 border-beerus border">
          <div className="container flex w-full justify-between">
            <div className="flex flex-col gap-1 overflow-hidden">
              <h1 className="text-moon-32 font-bold">{!isConnected ? <>Connect your wallet</> : <>Register your account</>} </h1>
              <h3 className="flex gap-2 whitespace-nowrap">{!isConnected ? <> <a className='text-piccolo' href={goToFaucet()} target='_blank'>Add token to your account</a></> : <>It just takes a couple of clicks</>}</h3>
            </div>
          </div>
        </div>
        {!isConnected ? <>
          {ConnectSubWalletButton()}</> : <>
          <Card className="max-w-[480px] pt-10">
            <div className="flex items-center justify-center flex-col w-full gap-6">
              <div className="flex flex-col gap-6 w-full p-6">
                <div className="upload">
                  <Avatar className="rounded-full border border-beerus bg-gohan text-moon-120 h-32 w-32">{image.type ? <img src={URL.createObjectURL(image)} className="h-full w-full object-cover" /> : <GenericUser className="h-24 w-24 text-trunks" />}</Avatar>
                  <div className="flex items-center justify-center round">
                    <IconButton className="rounded-moon-i-sm" size="xs" icon={<FilesGeneric className="text-gohan" color="#ffff" />} onClick={chooseImage}></IconButton>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-2">
                  <h6>
                    Full Name
                    <Required />
                  </h6>
                  {FullnameInput}
                </div>
                <div className="flex flex-col gap-2">
                  <h6>
                    Email
                    <Required />
                  </h6>
                  {EmailInput}
                </div>
                <div className="flex flex-col gap-2">
                  <h6>
                    Password
                    <Required />
                  </h6>
                  {PasswordInput}
                </div>
              </div>

              <div className="flex w-full justify-end">
                <Button id="RegisterBTN" onClick={registerAccount} disabled={isDisabled()}>
                  Register
                </Button>
              </div>
            </div>
          </Card>
        </>}

      </div>
    </>
  );
}
