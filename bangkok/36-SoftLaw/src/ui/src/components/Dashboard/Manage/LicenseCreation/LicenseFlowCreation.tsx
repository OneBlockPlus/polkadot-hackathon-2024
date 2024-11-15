import { useState } from 'react';
import { LicenseCreationForm } from './LicenseCreationForm';
import { LicenseSampleForm } from './LicenseSampleForm';
import type { LicenseFormData } from './types';
import NavBar from '@/components/NavBar';

interface LicenseCreationFlowProps {
  onComplete: (data: LicenseFormData) => void;
  onCancel: () => void;
}

export function LicenseCreationFlow({ onComplete, onCancel }: LicenseCreationFlowProps) {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState<LicenseFormData>({
    nftId: '',
    royaltyrate: 0,
    price: {
      amount: 0,
      currency: ''
    },
    licenseType: 'Exclusive',
    durationType: 'Permanent',
    paymentType: 'OneTime'
  });

  const handleFormChange = (newData: LicenseFormData) => {
    setFormData(newData);
  };

  const handleFormSubmit = (data: LicenseFormData) => {
    // Handle form submission
    console.log('Form submitted:', data);
    // Navigate to next page or process form
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      onCancel();
    }else {
      setStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };



  return (
    <div className=''>
    {/* <NavBar/> */}
    <div className="w-full">

      {step === 1 && (
        <LicenseCreationForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={() =>  handleNext()}
          onBack={handleBack}
        />
      )}

      {step === 2 && (
        <LicenseSampleForm 
        formData={formData}
        onSubmit={handleComplete}
        onBack={handleBack}
        onChange={handleFormChange}
        />
      )}
    </div>
    </div>
  );
}