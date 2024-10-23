import Image from 'next/legacy/image';
import Card from '../Card';
import { Button } from '@heathmont/moon-core-tw';
import { SoftwareLogin } from '@heathmont/moon-icons-tw';
import UseFormInput from '../UseFormInput';
import { usePolkadotContext } from '../../../contexts/PolkadotContext';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const LoginCard = ({ step, onConnectPolkadot, isConnected, setStep }) => {
  const { api, EasyToast } = usePolkadotContext();

  const [Email, EmailInput] = UseFormInput({
    defaultValue: '',
    type: 'text',
    placeholder: 'Email',
    id: ''
  });

  const [Password, PasswordInput] = UseFormInput({
    defaultValue: '',
    type: 'password',
    placeholder: 'Password',
    id: ''
  });

  async function OnClickLoginStep1() {
    const ToastId = toast.loading('Logging in  ...');
    let totalUserCount = Number(await api._query.users.userIds());
    var found = false;
    for (let i = 0; i < totalUserCount; i++) {
      const element = await api._query.users.userById(i);
      if (element.email.toString() == Email && element.password.toString() == Password) {
        found = true;
        Cookies.set('user_id', i.toString(), { expires: 30, path: '/', sameSite: 'Lax' }); // covers localhost

        Cookies.set('loggedin', 'true', { expires: 30, path: '/', sameSite: 'Lax' }); // covers localhost

        EasyToast('Logged in Successfully!', 'success', true, ToastId.toString());

        setStep(2);
        return;
      } else {
        found = false;
      }
    }
    if (!found) {
      EasyToast('Incorrect email or password!', 'error', true, ToastId.toString());
    }
  }

  function isDisabled() {
    return !(Email && Password);
  }

  const LoginForm = () => (
    <Card className="!max-w-[480px]">
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-1 justify-between items-center relative text-moon-16">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
              <h6>Email</h6>
              {EmailInput}
            </div>
            <div className="flex flex-col gap-2">
              <h6>Password</h6>
              {PasswordInput}
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end">
          <Button onClick={OnClickLoginStep1} disabled={isDisabled()}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );

  const ConnectPolkadotButton = () => (
    <Card className="max-w-[480px] w-full">
      <div className="flex w-full flex-col gap-10">
        <div className="flex items-center w-full justify-between">
          <div className="rounded-moon-s-md border border-beerus p-2 mr-6 min-w-[84px]">
            <Image height={64} width={64} src="/images/polkadot.svg" alt="" />
          </div>
          <div className="flex flex-col justify-between xs:flex-row xs:w-full">
            <p className="font-bold text-moon-20 flex-1">Polkadot JS</p>
            <Button className="min-w-[175px] xs:min-w-0" iconLeft={<SoftwareLogin />} onClick={onConnectPolkadot}>
              Connect
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

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

  return (
    <>
      {step == 1 && LoginForm()}
      {step == 2 && (
        <div className="flex flex-col gap-4 w-full items-center">
          {/* {ConnectPolkadotButton()}
          {'Or'} */}
          {ConnectSubWalletButton()}
        </div>
      )}
    </>
  );
};

export default LoginCard;
