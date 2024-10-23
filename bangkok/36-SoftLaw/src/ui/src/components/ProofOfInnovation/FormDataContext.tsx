'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormContextProps {
  IpRegistries: {
    UploadFile: File | null;
    TypeOfIntellectualProperty: string;
    ReferenceNumber: string;
    ReferenceLink: string;
  };
  Identity: {
    TypeOfPatent: string;
    PatentTitle: string;
    FillingDate: Date | null;
    PatentNumber: string;
  };
  LegalContracts: {
    UploadFile: File | null;
    NFTName: string;
    Collection: string;
    TypesOfProtection: string;
    Description: string;
  };
}
// var Date: DateConstructor 
const initialFormData: FormContextProps = {
  IpRegistries: {
    UploadFile: null,
    TypeOfIntellectualProperty: '',
    ReferenceNumber: '',
    ReferenceLink: '',
  },
  Identity: {
    TypeOfPatent: '',
    PatentTitle: '',
    FillingDate: null,
    PatentNumber: '',
  },
  LegalContracts: {
    UploadFile: null,
    NFTName: '',
    Collection: '',
    TypesOfProtection: '',
    Description: '',
  },
};

// Context creation
const FormDataContext = createContext<{
  formData: FormContextProps;
  updateFormData: (page: keyof FormContextProps, data: Partial<FormContextProps[keyof FormContextProps]>) => void;
}>({
  formData: initialFormData,
  updateFormData: () => {},
});

// Provider Component
const FormDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormContextProps>(initialFormData);

  // Function to update form data for specific pages
  const updateFormData = (
    page: keyof FormContextProps,
    data: Partial<FormContextProps[keyof FormContextProps]>
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [page]: {
        ...prevFormData[page], // Maintain other fields
        ...data, // Update only the fields passed in data
      },
    }));
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

// Custom hook for easy context usage
export const useFormContext = () => {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormDataProvider');
  }
  return context;
};

export { FormDataContext, FormDataProvider };
