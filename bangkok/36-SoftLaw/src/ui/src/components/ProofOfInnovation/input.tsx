// 'use client';
// import React, { useState,  InputHTMLAttributes, forwardRef } from 'react';
// import { ChevronDownIcon } from '@radix-ui/react-icons';
// import TypesComponent from './TypesProps';
// // import {SlCloudUpload } from "react-icons/sl"

// interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   id?: string;
//   hasDropdown?: boolean;
//   children?: string;
//   style?: string;
//   options?: [];
//   optionText?: string;
//   icon?: boolean;
//   onFileChange?: () => {};
//   value?: any;
//   fileType?: string;
// }

// const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
//   ({ className = '', id, children, label, style, placeholder, type = "text", icon, value, optionText, onFileChange, fileType, hasDropdown = true, options = [], ...rest }, ref) => {

//     const [isFocused, setIsFocused] = useState(false);
//     const [hasValue, setHasValue] = useState(false);
//     const [fileName, setFileName] = useState("");

//     const handleFocus = () => setIsFocused(true);
//     const handleBlur = (e) => {
//       setIsFocused(false);
//       setHasValue(e.target.value !== "");
//     };

//     const [ error, setError ] = useState<string>('');

//     // const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
//     //   const value = event.target.value;
//     //   if (!value) {
//     //     setError('This field is required');
//     //   } else {
//     //     setError ('');
//     //   }
//     // };

//     // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     //   const value = event.target.value;
//     //   if (!value) {
//     //     setError('This field is required');
//     //   } else {
//     //     setError('');
//     //   }
//     // };

//     const getFileName = (e) => {
//       if(type === "file") {
//         const file = e.target.files[0];
  
//         if(file) {
//           setFileName(file.name);
//           if (onFileChange) {
//             onFileChange(file);
//           }
//         }
//       } else {
//         rest.onChange(e);
//       }
//     };
    

//     const renderInput = () => {
//       switch(type) {
//         case "select":
//         if (type === "select" && options.length > 0) {
//           return (
//             <div className='relative '>
//                 <select
//                 id={id}
//                 ref={ref}
//                 className={`block my-3 p-4 min-[2000px]:pb-[5px] w-full h-14 bg-[#27251C] min-[2000px]:text-2xl text-base font-normal text-[#fff] bg-transparent  appearance-none focus:outline-none focus:ring-0 peer ${
//                   error ? "border-red-500" : ""
//                 }`}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 {...rest}
//                 >
//                   <option className='bg-[#27251C]' value="">{optionText ? optionText : "Select an option"}</option>
//                   {options.map((option, index) => (
//                     <option key={index} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               {icon 
//               ? <div className='hidden absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none border border-yellow-500 w-5 h-5 rounded-full sm:flex justify-center items-center'>
//                   <ChevronDownIcon 
//                 className="text-[0.55rem] text-yellow-500"
//                 />
//               </div>  
//               : <ChevronDownIcon 
//               className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-yellow-500"
//               />
//               }
                
//             </div>
//           );
//         }

//         case "description":
//           if (id === "Description") {
//             // Render a textarea for the business description
//             return (
//               <textarea
//                 id={id}
//                 ref={ref}
//                 rows={5} // You can adjust this based on your height needs
//                 className={`block my-3 p-4 w-full ring-0 outline-none bg-[#27251C] text-base font-normal text-[#fff] bg-transparent min-[2000px]:text-2xl  rounded-md appearance-none focus:outline-none focus:ring-0 peer ${
//                   isFocused || hasValue ? "pt-4" : ""
//                 } ${error ? "border-red-500" : ""}`}
//                 placeholder={placeholder}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 {...rest}
//               />
//             );
//           }

//         case "file":
//           return (
//             <div className={`relative my-3 py-[60px] flex h-[250px] items-center rounded-xl  justify-center w-full cursor-pointer appearance-none bg-[#27251C] ${
//               error ? "border-red-500" : ""
//             }`}>
//               <div className="absolute inset-0  flex flex-col items-center  justify-center gap-[16px]">
//                 {/* <SlCloudUpload className="text-2xl text-[#B6AFEB] sm:mr-2"/> */}
//               <div>
//                <p className='flex border border-[#858597] rounded-[60px] items-center py-[10px] px-[16px] text-[#ffff] text-sm font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-2xl min-[2000px]:tracking-[1px]'>Select File</p>   
//                 </div>
                
//                 <p className="text-[#ffff] font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-2xl min-[2000px]:tracking-[1px]">

//                   {fileName || "Select files to upload or drag and drop file(s)  here, or"}
//                   <span className="text-yellow-500"> {fileName ? " change" : " browse"}</span>
//                 </p>
//               <div className='flex flex-col items-center '>
//                  <TypesComponent 
//                 className='text-[#8A8A8A] min-[2000px]:text-[24px] min-[2000px]:leading-[32px]'
//                 text="You may change this after deploying your contract"
//                 />
//                 <TypesComponent
//                 className='text-[#8A8A8A] min-[2000px]:text-[24px] min-[2000px]:leading-[32px]'
//                 text={fileType}
//                 />
//               </div>
               
//               </div>
//               <input 
//                 type="file"
//                 accept="pdf, doc, image/*"
//                 id={id}
//                 ref={ref}
//                 className={`absolute top-0 bottom-0 left-0 right-0 rounded-xl  cursor-pointer opacity-0  outline-none block w-full text-base font-normal text-[#ffff] bg-transparent focus:outline-none focus:ring-0 ${style}  ${error ? "border-red-500" : ""}`}
//                 placeholder={placeholder}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 onChange={getFileName}
//                 {...rest}
//               />
//             </div>
//           )

//           default:
//             return (
//             <input
//             type={type}
//             id={id}
//             ref={ref}
//             className={`block my-3 p-4 w-full h-14 bg-[#27251C] text-base min-[2000px]:text-2xl font-normal text-[#fff] rounded-xl  appearance-none focus:outline-none focus:ring-0 peer  ${style} ${
//               isFocused || hasValue ? "pt-4" : ""
//             } ${error ? "border-red-500" : ""}`}
//             placeholder={placeholder}
//             onFocus={handleFocus}
//             onBlur={handleBlur}
//             {...rest}
//           />
//         );

//       }
     
//     };


//     return (
//       <div className={`relative w-full ${style}`}>
//         <label htmlFor={id} className={`font-Montesarrat text-[16px] font-normal min-[2000px]:text-4xl leading-[145%] tracking-[0.32px] text-[#FFF] ${className}`} onClick={(e) => e.preventDefault()}>
//           <TypesComponent
//           text= {label} 
//           />
       
//         </label>
//         <div className="relative z-0 w-full rounded-xl bg-[#27251C]">
//           {renderInput()}
//         </div>

//         {error && <p className="text-red-500 text-sm -mt-3">{error}</p>}

//         {/* {error && (
//         <div className="absolute inset-y-4 right-0 min-[2000px]:text-2xl flex items-end justify-center pr-3 pointer-events-none">
//         <p className="text-red-500">{error}</p>
//         </div>
//        )} */}

//         {/* <input 
//         type="text" 
//         ref={ref}
//         {...props}
//         className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] ${className}`} onBlur={handleBlur}
//         onChange={handleChange}
//         />  */}
              
      
        
//         {/* Dropdown Icon conditionally rendered */}
//         {/* {hasDropdown && (
//             <div className="absolute inset-y-4 right-0 flex items-end justify-center pr-3 pointer-events-none">
//             <ChevronDownIcon className="h-5 w-5 min-[2000px]:w-8 min-[2000px]:h-8 text-gray-500" aria-hidden="true" />
//           </div>
//         )} */}
     
//       </div>
      
//     );
//   }
// );

// // InputField.displayName = 'InputField';

// export default InputField;
