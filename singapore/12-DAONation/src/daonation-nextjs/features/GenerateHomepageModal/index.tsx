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
import { Dao } from '../../data-model/dao';

export default function GenerateHomepageModal({ open, onClose, item }: { open: boolean; onClose; item: Dao }) {
  const [eventType, setEventType] = useState<'layout1' | 'layout2'>('layout1');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [daoDescription, DaoDescriptionInput] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add Description',
    id: '',
    rows: 4
  });

  async function generateHomepage() {
    const daoId = router.query.daoId as string;
    setIsLoading(true);
    const toastId = toast.loading('Generating homepage...');

    const template = await AiService.generateTemplate(daoDescription).then((res) => res.content);

    await CommunityService.updateByPolkadotReferenceId(daoId, { template });

    toast.update(toastId, { type: 'success', render: 'Homepage generated successfully!', autoClose: 1000, isLoading: false });

    router.push(`${daoId}/design`);
  }

  const isInvalid = () => {
    return !daoDescription || isLoading;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="min-w-[600px] bg-gohan">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Generate homepage</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)] p-6">
          <div className="flex flex-col gap-2">
            <h6>Purpose of your homepage</h6>
            <div className="flex gap-4">
              <EventTypeOption icon={<TextCards height={32} width={32} />} label="Introduce the charity and its mission" selected={eventType === 'layout1'} onClick={() => setEventType('layout1')} />
              <EventTypeOption icon={<TextCards height={32} width={32} />} label="Explain the charity's activities" selected={eventType === 'layout2'} onClick={() => setEventType('layout2')} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h6>
              Describe your charity <Required />
            </h6>
            {DaoDescriptionInput}
          </div>
        </div>
        <div className="flex justify-between border-t border-beerus w-full p-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button iconLeft={<GenericLightningBolt />} onClick={generateHomepage} disabled={isInvalid()}>
            Generate
          </Button>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
