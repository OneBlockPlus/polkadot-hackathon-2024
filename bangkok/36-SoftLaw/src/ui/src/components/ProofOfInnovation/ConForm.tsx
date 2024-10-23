// // forms.ts
// import { useState } from 'react';

// interface FormData {
//   page1: {
//     TypeOfIntellectualProperty: string;
//     ReferenceNumber: string;
//     ReferenceLink: string;
//   };
//   page2: {
//     PatentTitle: string;
//     name: string;
//     PatentNumber: string;
//     FillingDate: string;

//   };
//   page3: {
//     message: string;
//   };
// }

// const initialFormData: FormData = {
//   page1: {
//     TypeOfIntellectualProperty: '',
//     ReferenceNumber: '',
//     ReferenceLink: '',
//   },
//   page2: {
//     PatentTitle: ' ',
//     name: ' ',
//     PatentNumber: ' ',
//     FillingDate: ' ',
//   },
//   page3: {
//     message: '',
//   },
// };

// const useFormData = () => {
//   const [formData, setFormData] = useState(initialFormData);

//   const updateFormData = (pageNumber: number, data: Partial<FormData>) => {
//     setFormData((prevFormData) => ({ ...prevFormData, ...data }));
//   };

//   return { formData, updateFormData };
// };

// export default useFormData;