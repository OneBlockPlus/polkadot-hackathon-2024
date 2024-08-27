import Image from 'next/image';
import { Nav } from '../Nav';
import styles from './Header.module.scss';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useEnvironment from '../../../contexts/EnvironmentContext';
import { CommunityService } from '../../../services/communityService';
import { hex2rgb } from '../../../utils/hex-to-rgb';
import { useRouter } from 'next/router';

export const Header = () => {
  const [linkTarget, setLinkTarget] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [communityLogo, setCommunityLogo] = useState('');
  const [communityName, setCommunityName] = useState('');
  const { setCommunityBranding } = useEnvironment();
  const router = useRouter();

  useEffect(() => {
    setLinkTarget(!window.userid ? '/' : '/joined');
  }, []);

  useEffect(() => {
    checkSubdomain();
  }, []);

  async function checkSubdomain() {
    if ((location.host.split('.').length === 2 && location.host.includes('localhost')) || (location.host.split('.').length === 3 && location.host.includes('daonation.org'))) {
      setIsLoading(true);
      const communityBranding = await CommunityService.getBySubdomain(location.host.split('.')[0]);

      setCommunityBranding(communityBranding);
      setCommunityLogo(communityBranding.imageUrl);
      setCommunityName(communityBranding.name);
      setLinkTarget(`/daos/${communityBranding.polkadotReferenceId}`);

      if (communityBranding.brandingColor) {
        document.documentElement.style.setProperty('--piccolo', hex2rgb(communityBranding.brandingColor));
      }

      if (router.pathname === '/daos' || router.pathname === '/joined') {
        router.push(`daos/${communityBranding.polkadotReferenceId}`);
      }

      setIsLoading(false);
    }
  }

  return (
    <header className={`w-full px-8 py-4 gap-4 flex justify-between items-center z-10 ${styles.header}`}>
      <Link href={linkTarget}>
        {!isLoading && !communityLogo && (
          <div>
            <Image height={48} width={119} src="/images/logo.svg" alt="DAOnation" />
          </div>
        )}
        {communityLogo && (
          <div className="w-[120px] h-[48px] relative">
            <Image className="object-contain" fill src={communityLogo} alt={communityName} />
          </div>
        )}
      </Link>
      <Nav />
    </header>
  );
};

export default Header;
