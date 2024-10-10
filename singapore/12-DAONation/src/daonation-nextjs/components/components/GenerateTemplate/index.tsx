import { Button, IconButton } from '@heathmont/moon-core-tw';
import { ControlsClose, GenericLightningBolt } from '@heathmont/moon-icons-tw';
import UseFormTextArea from '../UseFormTextArea';
import { useEffect, useState } from 'react';
import Required from '../Required';
import TemplateOption from '..//TemplateOption';
import { TemplateType } from '../../../data-model/template-type';

export default function GenerateTemplate({ onClose, onGenerate, isLoading, showClose = true }: { onClose?; onGenerate; isLoading: boolean; showClose?: boolean }) {
  const [templateType, TemplateTypeInput, setTemplateType] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'What would you like to generate?',
    id: '',
    rows: 4
  });

  const [daoDescription, DaoDescriptionInput, setDaoDescription] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'This is used to generate content tailored to your charity',
    id: '',
    rows: 4
  });

  const isInvalid = () => {
    return !daoDescription || isLoading;
  };

  useEffect(() => {
    const description = localStorage.getItem('__daonation__daoDescription');

    setDaoDescription(description);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center flex-col">
        <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
          <h1 className="text-moon-20 font-semibold">Generate homepage {!showClose && 'content'}</h1>
          {showClose && <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />}
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)] p-6">
        <div className="flex flex-col gap-2">
          {TemplateTypeInput}
          <div className="flex gap-2 flex-wrap">
            <TemplateOption label="Mission statement" selected={templateType === 'Mission statement'} onClick={() => setTemplateType('Mission statement')} />
            <TemplateOption label="Impact stories" selected={templateType === 'Impact stories'} onClick={() => setTemplateType('Impact stories')} />
            <TemplateOption label="Charity activities" selected={templateType === 'Charity activities'} onClick={() => setTemplateType('Charity activities')} />
            <TemplateOption label="Contact information" selected={templateType === 'Contact information'} onClick={() => setTemplateType('Contact information')} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h6>
            Charity description <Required />
          </h6>
          {DaoDescriptionInput}
        </div>
      </div>
      <div className="flex justify-between border-t border-beerus w-full p-6">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button iconLeft={<GenericLightningBolt />} onClick={() => onGenerate({ templateType, daoDescription })} disabled={isInvalid()}>
          Generate
        </Button>
      </div>
    </>
  );
}
