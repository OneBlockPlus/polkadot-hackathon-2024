'use client';

import React, { useState, SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id?: string;
  hasDropdown?: boolean;
  children?: React.ReactNode;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className = '', id, children, label, hasDropdown = true, ...props }, ref) => {
    const [error, setError] = useState<string>('');

    const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      if (!value) {
        setError('This field is required');
      } else {
        setError('');
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      if (!value) {
        setError('This field is required');
      } else {
        setError('');
      }
    };

    return (
      <div className="relative w-full">
        <label 
          htmlFor={id} 
          className={`font-Montesarrat text-[16px] font-normal min-[2000px]:text-4xl leading-[145%] tracking-[0.32px] text-[#FFF] ${className}`}
        >
          {label}
        </label>
        
        <div className="relative">
          <select
            id={id}
            ref={ref}
            {...props}
            className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff] p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] appearance-none ${className}`}
            onBlur={handleBlur}
            onChange={handleChange}
          >
            {children}
          </select>

          {error && (
            <div className="absolute inset-y-4 right-0 min-[2000px]:text-2xl flex items-end justify-center pr-3 pointer-events-none">
              <span className="text-red-500">{error}</span>
            </div>
          )}

          {hasDropdown && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon 
                className="h-5 w-5 min-[2000px]:w-8 min-[2000px]:h-8 text-gray-500" 
                aria-hidden="true" 
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;


