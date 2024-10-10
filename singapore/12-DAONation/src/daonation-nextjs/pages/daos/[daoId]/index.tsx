import { Button } from '@heathmont/moon-core-tw';
import { GenericHome, GenericLightningBolt, GenericPlus } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EmptyState from '../../../components/components/EmptyState';
import GenerateHomepageModal from '../../../features/GenerateHomepageModal';
import { CommunityService } from '../../../services/communityService';

export default function DAO() {
  const [showGenerateHomepageModal, setShowGenerateHomepageModal] = useState(false);

  const [aboutTemplate, setAboutTemplate] = useState('');
  const [daoName, setDaoName] = useState('');
  const [daoID, setDaoID] = useState('');

  const router = useRouter();

  useEffect(() => {
    (async function () {
      const daoId = router.query.daoId as string;
      const { template, name } = await CommunityService.getByPolkadotReferenceId(daoId);

      setDaoName(name);
      setDaoID(daoId);
      setAboutTemplate(template);
    })();
  }, [router]);

  return (
    <>
      <Head>
        <title>Charity - {daoName}</title>
        <meta name="description" content="DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`flex items-center flex-col gap-8 relative`}>
        {!aboutTemplate && (
          <div className="h-full w-full left-0 bg-goku flex flex-col gap-4 justify-center items-center">
            <EmptyState icon={<GenericHome className="text-moon-48" />} label="This charity doesn’t have a homepage yet." />{' '}
            <div className="flex flex-col gap-2">
              <Button className="w-[220px]" iconLeft={<GenericLightningBolt />} onClick={() => setShowGenerateHomepageModal(true)}>
                Generate homepage
              </Button>
              <Link href={`${daoID}/design`}>
                <Button className="w-[220px]" variant="secondary" iconLeft={<GenericPlus />}>
                  Start from scratch
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <div dangerouslySetInnerHTML={{ __html: aboutTemplate }}></div>
      <GenerateHomepageModal open={showGenerateHomepageModal} onClose={() => setShowGenerateHomepageModal(false)} />
    </>
  );
}
