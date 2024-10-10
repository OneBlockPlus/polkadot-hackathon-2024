import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, GenericLightningBolt, TextCards } from '@heathmont/moon-icons-tw';
import UseFormTextArea from '../../components/components/UseFormTextArea';
import EventTypeOption from '../../components/components/EventTypeOption';
import { useState } from 'react';
import Required from '../../components/components/Required';
import { AiService } from '../../services/aiService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { CommunityService } from '../../services/communityService';
import TemplateOption from '../../components/components/TemplateOption';
import GenerateTemplate from '../../components/components/GenerateTemplate';
import { TemplateType } from '../../data-model/template-type';

export default function GenerateHomepageModal({ open, onClose }: { open: boolean; onClose }) {
  const [eventType, setEventType] = useState<'layout1' | 'layout2' | 'layout3' | 'layout4'>('layout1');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [daoDescription, DaoDescriptionInput] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add Description',
    id: '',
    rows: 4
  });

  async function generateHomepage({ daoDescription, templateType }: { daoDescription: string; templateType: TemplateType }) {
    const daoId = router.query.daoId as string;
    setIsLoading(true);
    const toastId = toast.loading('Generating homepage...');

    const template = await AiService.generateTemplate(daoDescription, templateType).then((res) => res.content);

    await CommunityService.updateByPolkadotReferenceId(daoId, { template });

    await toast.update(toastId, { type: 'success', render: 'Homepage generated successfully!', autoClose: 500, isLoading: false });

    router.push(`${daoId}/design`);
  }

  const isInvalid = () => {
    return !daoDescription || isLoading;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="min-w-[600px] bg-gohan">
        <GenerateTemplate isLoading={isLoading} onClose={onClose} onGenerate={generateHomepage} />
      </Modal.Panel>
    </Modal>
  );
}
