import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';

export default function UseFormInput({ defaultValue, type, placeholder, id }) {
	const [value, setValue] = useState(defaultValue || '');
	const input = (
		<Form.Control
			value={value || ''}
			placeholder={placeholder}
			onChange={(e) => setValue(e.target.value)}
			type={type}
			autoComplete='off'
			id={id}
		/>
	);
	return [value, input, setValue];
}
