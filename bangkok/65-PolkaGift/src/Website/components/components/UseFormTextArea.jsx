import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';

export default function UseFormTextArea({ defaultValue,  placeholder, id, rows }) {
	const [value, setValue] = useState(defaultValue || '');
	const input = (<>
		<textarea className="form-control" value={value || ''}
			placeholder={placeholder}
			onChange={(e) => setValue(e.target.value)}
			id={id} rows={rows}></textarea>		
	</>

	);
	return [value, input, setValue];
}
