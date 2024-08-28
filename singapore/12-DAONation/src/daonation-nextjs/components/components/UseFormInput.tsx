import React, { useState } from 'react';
import { TextInput } from '@heathmont/moon-core-tw';

export default function UseFormInput({ defaultValue, type, placeholder, id, className = '' }) {
  const [value, setValue] = useState(defaultValue || '');
  const input = <TextInput value={value || ''} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} type={type} id={id} className={`${className} bg-gohan rounded-moon-i-sm hover:rounded-moon-i-sm focus:rounded-moon-i-sm invalid:rounded-moon-i-sm`} />;
  return [value, input, setValue];
}
