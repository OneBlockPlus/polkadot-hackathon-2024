import React from 'react'
import './NumberInput.css'

const NumberInput = ({
    onInput,
    placeholder,
    value
}) => {
    return (
        <div className="demo-input">
            <textarea placeholder={placeholder} className="demo-input-field" onInput={onInput} value={value} />
        </div>
    )
}

export default NumberInput
