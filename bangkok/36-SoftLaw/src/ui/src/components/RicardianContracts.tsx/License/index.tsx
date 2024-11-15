'use client'
import { useState } from 'react';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';

interface MintNFTFormValues {
  name: string;
  description: string;
  filingDate: string;
  jurisdiction: string;
}

const MintNFTPage: React.FC = () => {
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // Form validation schema using Yup
  // const validationSchema = Yup.object({
  //   name: Yup.string()
  //     .max(30, 'Name is too long')
  //     .required('NFT Name is required'),
  //   description: Yup.string()
  //     .max(250, 'Description is too long')
  //     .required('Description is required'),
  //   filingDate: Yup.date()
  //     .required('Filing Date is required'),
  //   jurisdiction: Yup.string()
  //     .max(50, 'Jurisdiction is too long')
  //     .required('Jurisdiction is required'),
  // });

  // // Formik form handler
  // const formik = useFormik<MintNFTFormValues>({
  //   initialValues: {
  //     name: '',
  //     description: '',
  //     filingDate: '',
  //     jurisdiction: '',
  //   },
  //   validationSchema,
  //   onSubmit: async (values) => {
  //     try {
  //       // Call the backend mint function
  //       // Replace with actual mint function integration here
  //       console.log('Minting NFT with values:', values);
  //       setSubmissionStatus('NFT successfully minted!');
  //     } catch (error) {
  //       setSubmissionStatus('Failed to mint NFT.');
  //     }
  //   },
  // });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Create a New NFT</h2>
        
        <form
        //  onSubmit={formik.handleSubmit}
          className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">
              NFT Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              // value={formik.values.name}
              // onChange={formik.handleChange}
              // onBlur={formik.handleBlur}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* {formik.touched.name && formik.errors.name ? (
              <p className="text-red-500 text-sm">{formik.errors.name}</p> */}
            {/* ) : null} */}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              // value={formik.values.description}
              // onChange={formik.handleChange}
              // onBlur={formik.handleBlur}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* {formik.touched.description && formik.errors.description ? (
              <p className="text-red-500 text-sm">{formik.errors.description}</p> */}
            {/* ) : null} */}
          </div>

          <div>
            <label htmlFor="filingDate" className="block text-sm font-medium text-gray-600">
              Filing Date
            </label>
            <input
              type="date"
              id="filingDate"
              name="filingDate"
              // value={formik.values.filingDate}
              // onChange={formik.handleChange}
              // onBlur={formik.handleBlur}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* {formik.touched.filingDate && formik.errors.filingDate ? (
              <p className="text-red-500 text-sm">{formik.errors.filingDate}</p>
            ) : null} */}
          </div>

          <div>
            <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-600">
              Jurisdiction
            </label>
            <input
              type="text"
              id="jurisdiction"
              name="jurisdiction"
              // value={formik.values.jurisdiction}
              // onChange={formik.handleChange}
              // onBlur={formik.handleBlur}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* {formik.touched.jurisdiction && formik.errors.jurisdiction ? (
              <p className="text-red-500 text-sm">{formik.errors.jurisdiction}</p>
            ) : null} */}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600 transition-colors"
          >
            Mint NFT
          </button>

          {submissionStatus && (
            <p className={`text-center mt-4 ${submissionStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              {submissionStatus}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default MintNFTPage;















// "use client";
// import MaxWidthWrapper from "@/components/MaxWidhWrapper";
// import ReusableHeading from "../textComponent";
// import TypesComponent from "../TypesProps";
// import InputField from "../input";
// import Link from "next/link";
// import Footer from "@/components/Footer";
// import React, { useEffect, useState } from "react";
// import VariousTypesButton from "../VariousTypesButton";
// import { useContext } from 'react';
// import { FormDataContext } from "../FormDataContext";


// interface LicenseProps {
//   onDataChange?: (data: any) => void;
// }

// export default function License({onDataChange}: LicenseProps) {
//   const {formData, updateFormData} = useContext(FormDataContext);

//   const [activeButton, setActiveButton] = useState<string | null>(null);

//   const handleButtonClick = (buttonName: string) => {
//     setActiveButton(buttonName);
//     updateFormData("Identity", { TypeOfPatent: buttonName })
//   };
  
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     updateFormData('Identity', { PatentTitle: e.target.value });
    
//   };

//   const handlePatentNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
//     updateFormData('Identity', { PatentNumber: e.target.value });
   
//   };

//   const handleFillingDate = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const dateValue = new Date(e.target.value);
//     updateFormData('Identity', { FillingDate: dateValue });
//   };

//   // const callOnDataChange = () => {
//   //   onDataChange && onDataChange(formData);
//   // };

//   // useEffect(() => {
//   //   callOnDataChange();
//   // }, [formData, onDataChange]);
  
//   return (
//     <>
//       <div className="bg-[#1C1A11] flex flex-col w-full justify-center items-center text-white pb-[60px] min-[2000px]:w-[2560px] ">
//         <MaxWidthWrapper className="flex flex-col self-stretch min-[2000px]:min-h-screen pt-[120px] justify-center items-center">
//           <div className="flex flex-col w-full justify-items-center gap-[60px] pb-[120px]">
//             <div>
//               <ReusableHeading
//                 text="License your Intellectual Property"
//                 detail="Please Fill in the Matching Patent Details"
//                 className="text-[#8A8A8A]"
//               />
//             </div>

//             <div className="flex flex-col items-start self-stretch gap-[16px] w-full">
//               <TypesComponent text="Types of Patent" />
//               <div className="flex items-start space-x-4 self-stretch">
//                 <VariousTypesButton
//                   isActive={activeButton === "Utility Patent"}
//                   className={`min-[2000px]:w-[px] w-full h-[auto] ${
//                     activeButton === "Utility Patent"
//                       ? "border-[#FACC15] bg-[#373737]"
//                       : "border-[#8A8A8A]"
//                   } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
//                   width="full"
//                   text="Utility Patent"
//                   detail="Protects new inventions or functional improvements to existing products, processes, or machines. This is the most common type of patent, covering how an invention works."
//                   onClick={() => {
//                     handleButtonClick("Utility Patent");
//                   }}
//                 />

//                 <VariousTypesButton
//                   isActive={activeButton === "Design Patent"}
//                   className={`min-[2000px]:w-[px] w-full h-[auto] ${
//                     activeButton === "Design Patent"
//                       ? "border-[#FACC15] bg-[#373737]"
//                       : "border-[#8A8A8A]"
//                   } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
//                   width="full"
//                   text="Design Patent"
//                   detail="Protects the unique appearance or ornamental design of a product rather than its function. 

//                 For example, the shape of a car or the design of a smartphone."
//                   onClick={() => {
//                     handleButtonClick("Design Patent");
//                   }}
//                 />

//                 <VariousTypesButton
//                   isActive={activeButton === "Provisional Patent"}
//                   className={`min-[2000px]:w-[px] w-full h-[auto] ${
//                     activeButton === "Provisional Patent"
//                       ? "border-[#FACC15] bg-[#373737]"
//                       : "border-[#8A8A8A]"
//                   } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
//                   width="full"
//                   text="Provisional Patent"
//                   detail="A temporary application that gives you an early filing date and up to 12 months to file a full utility patent. This option is useful if your invention is still in development."
//                   onClick={() => {
//                     handleButtonClick("Provisional Patent");
//                   }}
//                 />
//                 <VariousTypesButton
//                   isActive={activeButton === "Plant Patent"}
//                   className={`min-[2000px]:w-[px] w-full h-[auto] ${
//                     activeButton === "Plant Patent"
//                       ? "border-[#FACC15] bg-[#373737]"
//                       : "border-[#8A8A8A]"
//                   } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
//                   width="full"
//                   text="Plant Patent"
//                   detail="Granted for the invention or discovery of a new and distinct plant variety, reproduced through asexual means like grafting or cutting, rather than seeds."
//                   onClick={() => {
//                     handleButtonClick("Plant Patent");
//                   }}
//                 />
//               </div>
//             </div>

//             <form action="" className="flex flex-col gap-[60px]">
//               <div className="flex flex-col items-start self-stretch gap-[8px]">

//                 <InputField
//                 label= "Patent Title"
//                 value={formData.Identity.PatentTitle}
//                 type="text"
//                   hasDropdown={false}
//                   className="min-[2000px]:w-[px] min-w-[280px]"
//                   onChange={handleInputChange}
//                 />
//               </div>

              
//                 <div className="flex items-start gap-[60px]">
//                   <div className="flex flex-col items-start gap-[6px]">
                   
//                     <InputField
//                     label= "Patent Number"
//                     value={formData.Identity.PatentNumber}
//                     onChange={handlePatentNumber}
//                       hasDropdown={true}
//                       className=" min-w-[280px] w-full"
//                     />

//                     <TypesComponent
//                       className="text-[#8A8A8A] "
//                       text={`A unique identifier issued once your patent is officially approved and published to track and reference your patent in legal. ${(
//                         <br />
//                       )} Example: US1234567B1.`}
//                     />
//                   </div>
//                     <InputField
//                     label= "Filling Date"
//                     value={formData.Identity.FillingDate ? formData.Identity.FillingDate.toISOString().substring(0, 10) : ''}
//                     hasDropdown={true}
//                     onChange={handleFillingDate}
//                     type="Date"
//                       className=" w-[280px]"
//                     />         
//                 </div> 
//             </form>

//             <div className="flex items-start justify-between w-full ">
//               <Link
//                 href="/dashboard"
//                 className="bg-transparent rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px]flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none"
//                 children="Back"
//               />
//               <Link
//                 href="/LegalContracts"
//                 className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
//                 children="Next"
//               />
//             </div>
//           </div>
//         </MaxWidthWrapper>
//       </div>
//       <Footer
//         width="py-[60px] min-[2000px]:py-[70px] max-h-[400px]"
//         className="border-t-[1px] border-[#8A8A8A] w-full"
//       />
//     </>
//   );
// }

// // Flor Linda Michelle Anastasya Laura Vanessa
