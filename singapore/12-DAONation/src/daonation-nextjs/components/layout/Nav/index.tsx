import { Avatar, Button, Dropdown, MenuItem } from '@heathmont/moon-core-tw';
import { useEffect, useState } from 'react';
import NavItem from '../../components/NavItem';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CreateDaoModal from '../../../features/CreateDaoModal';
import { usePolkadotContext } from '../../../contexts/PolkadotContext';
import useEnvironment from '../../../contexts/EnvironmentContext';
import { GenericLogOut, GenericUser, ShopWallet } from '@heathmont/moon-icons-tw';
import { ApiCommunity } from '../../../data-model/api-community';
import Cookies from 'js-cookie';
import PolkadotConfig from '../../../contexts/json/polkadot-config.json';

let running = false;
let changedPath = true;

export function Nav(): JSX.Element {
  const { api, userInfo, userWalletPolkadot } = usePolkadotContext();
  const [acc, setAcc] = useState('');
  const [logo, setLogo] = useState('');
  const [user_id, setUser_id] = useState('-1');
  const [Balance, setBalance] = useState('');
  const [count, setCount] = useState(0);
  const [isSigned, setSigned] = useState(false);
  const [communityBranding, setCommunityBranding] = useState<ApiCommunity>(null);
  const [showCreateDaoModal, setShowCreateDaoModal] = useState(false);
  const [hasJoinedCommunities, setHasJoinedCommunities] = useState(true);
  const { getCurrency, setCurrency, isServer, getCommunityBranding } = useEnvironment();

  const router = useRouter();

  async function fetchInfo() {
    if (Cookies.get('loggedin') === 'true') {
      try {
        if (userWalletPolkadot && api && userInfo?.fullName) {
          const { nonce, data: balance } = await api.query.system.account(userWalletPolkadot);

          setCurrency('DOT');

          setBalance(Number(balance.free.toString()) / 1e12 + ' DOT');
          if (!isSigned) setSigned(true);

          setAcc(userInfo?.fullName?.toString());
          setLogo(userInfo?.imgIpfs?.toString());
          setUser_id(window.userid);

          window.document.getElementById('withoutSign').style.display = 'none';
          window.document.getElementById('withSign').style.display = '';
          running = false;
          changedPath = false;
          return;
        } else {
          running = false;
          changedPath = false;
          return;
        }
      } catch (e) {
        running = false;
        changedPath = false;
        return;
      }
    } else {
      if (location.pathname !== '/' && location.pathname !== '/add-data' && location.pathname !== '/login' && location.pathname !== '/register') {
        window.location.href = '/';
      }
    }
  }
  useEffect(() => {
    if (!running) {
      if (!isSigned || acc === '' || changedPath) {
        running = true;
        fetchInfo();
      }
    }
    if (acc !== '') {
      running = false;
    }
  }, [count,api,userInfo, router.pathname]);

  useEffect(() => {
    changedPath = true;
  }, [router.pathname]);

  useEffect(() => {
    setCommunityBranding(getCommunityBranding());
  }, [getCommunityBranding()]);

  setInterval(() => {
    if (!isServer()) {
      if (document.readyState === 'complete' && !running) {
        setCount(count + 1);
      }
    }
  }, 1000);

  function onClickDisConnect() {
    router.push('/logout');
  }

  function closeModal() {
    setShowCreateDaoModal(false);
  }
  function openModal() {
    setShowCreateDaoModal(true);
  }

  return (
    <>
      <nav className="main-nav w-full flex justify-between items-center">
        <ul className="flex justify-between items-center w-full">
          {isSigned && !communityBranding && (
            <span className="hidden sm:inline-flex">
              {hasJoinedCommunities && <NavItem highlight={router.pathname === '/joined'} link="/joined" label="Joined charities" />}
              <NavItem highlight={router.pathname === '/daos'} link="/daos" label="Charities" />
              <NavItem label="Create Your Charity" onClick={openModal} />
              <NavItem highlight={router.pathname === '/events'} link="/events" label="All events" />
            </span>
          )}

          <li className="Nav walletstatus flex flex-1 justify-end">
            <div className="flex flex-col gap-2 items-center sm:flex-row" id="withoutSign">
              <Link href="/register">
                <Button variant="secondary" className="!bg-transparent w-32">
                  Register
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-dodoria w-32">Log in</Button>
              </Link>
            </div>

            <div id="withSign" className="wallets" style={{ display: 'none' }}>
              <div className="wallet" style={{ height: 48, display: 'flex', alignItems: 'center' }}>
                <div className="wallet__wrapper gap-4 flex items-center">
                  <div className="wallet__info flex flex-col items-end">
                    <Link href={'/profile/' + user_id} rel="noreferrer" className="max-w-[250px]">
                      <div className="font-medium text-piccolo truncate">{acc}</div>
                    </Link>
                    <div className="font-semibold truncate">{Balance}</div>
                  </div>
                  <Dropdown value={null} onChange={null}>
                    <Dropdown.Trigger>
                      {logo ? (
                        <Avatar imageUrl={logo} size="lg" className="rounded-full border-2 border-piccolo"></Avatar>
                      ) : (
                        <Avatar size="lg" className="rounded-full border-2 border-piccolo">
                          {' '}
                          <GenericUser className="text-moon-24" />
                        </Avatar>
                      )}
                    </Dropdown.Trigger>

                    <Dropdown.Options className="bg-gohan w-48 min-w-0">
                      <Dropdown.Option>
                        <Link href={`/profile/${user_id}`} passHref>
                          <MenuItem>
                            <GenericUser className="text-moon-24" />
                            <MenuItem.Title>Go to my profile</MenuItem.Title>
                          </MenuItem>
                        </Link>
                      </Dropdown.Option>
                      <Dropdown.Option>
                        <Link href={`https://polkadot.js.org/apps/?rpc=${PolkadotConfig.chain_rpc}#/accounts`} passHref target="_blank">
                          <MenuItem>
                            <ShopWallet className="text-moon-24" />
                            <MenuItem.Title>Top up your account</MenuItem.Title>
                          </MenuItem>
                        </Link>
                      </Dropdown.Option>
                      <Dropdown.Option>
                        <MenuItem>
                          <GenericLogOut className="text-moon-24" />
                          <MenuItem.Title>Leave this charity</MenuItem.Title>
                        </MenuItem>
                      </Dropdown.Option>
                      <Dropdown.Option>
                        <MenuItem onClick={onClickDisConnect}>
                          <GenericLogOut className="text-moon-24" />
                          <MenuItem.Title>Log out</MenuItem.Title>
                        </MenuItem>
                      </Dropdown.Option>
                    </Dropdown.Options>
                  </Dropdown>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <CreateDaoModal open={showCreateDaoModal} onClose={closeModal} />
    </>
  );
}
