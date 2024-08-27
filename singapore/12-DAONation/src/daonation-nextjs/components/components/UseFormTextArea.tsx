import React, { useState } from 'react';

export default function UseFormTextArea({ defaultValue, placeholder, id, name = '', rows, minHeight = 88 }) {
  const [value, setValue] = useState(defaultValue || '');
  const input = (
    <>
      <textarea className="block w-full max-w-full p-4 m-0 appearance-none text-[1rem] text-bulma transition-shadow box-border relative z-[0] shadow-input hover:shadow-input-hov focus:shadow-input-focus focus:outline-none bg-gohan h-10 rounded-moon-i-sm hover:rounded-moon-i-sm focus:rounded-moon-i-sm invalid:rounded-moon-i-sm before:box-border after:box-border placeholder:text-beerus placeholder:opacity-100 placeholder:transition-opacity placeholder:delay-75 read-only:outline-0 read-only:border-none read-only:cursor-not-allowed read-only:hover:shadow-input read-only:focus:shadow-input input-dt-shared invalid:shadow-input-err invalid:hover:shadow-input-err invalid:focus:shadow-input-err" value={value || ''} placeholder={placeholder} style={{ minHeight: minHeight }} onChange={(e) => setValue(e.target.value)} id={id} rows={rows} name={name}></textarea>
    </>
  );
  return [value, input, setValue];
}
