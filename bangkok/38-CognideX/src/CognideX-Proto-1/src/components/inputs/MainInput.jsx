import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 45px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid black;
  position: relative;
  font-size: 20px;
  font-family: 'Modernist', sans-serif;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0);

  /* Focus state for the container */
  &:focus-within {
    border: 2px solid var(--primary-color);
    box-shadow: 0 0 10px rgba(255, 255, 255, 1);
  }

  /* Common styles for both pseudo-elements */
  &::before,
  &::after {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 30px;
    height: 30px;
    background-color: white;
    border-radius: 9px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    transition: all 0.3s ease-in-out;
    font-weight: 600;
    font-size: 18px;
    font-family: 'Modernist', sans-serif;
  }

  /* Initial state for ::before (shows 'A') */
  &::before {
    content: 'A';
    opacity: 1;
    transform: translateY(0);
  }

  /* Initial state for ::after (hidden 'Z') */
  &::after {
    content: 'Z';
    opacity: 0;
    transform: translateY(10px);
  }

  /* Focus state animations */
  &:focus-within::before {
    opacity: 0;
    transform: translateY(-10px);
  }

  &:focus-within::after {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledInput = styled.input`
  width: 90%;
  height: 100%;
  background: transparent;
  border: none;
  color: black;
  outline: none;
  padding: 5px 0 0 10px;
  font-weight: 600;
  font-size: 20px;
  font-family: 'Modernist', sans-serif;
`;

const FloatingLabel = styled.label`
  position: absolute;
  top: ${(props) => (props.focused || props.value ? '7px' : '50%')};
  left: 10px;
  color: black;
  font-size: ${(props) => (props.focused || props.value ? '12px' : '20px')};
  pointer-events: none;
  transition: all 0.3s ease-in-out;
  transform: translateY(-50%);
`;

const MainInput = ({ label, value, onChange, type }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <InputContainer>
            <FloatingLabel focused={isFocused} value={value}>
                {label}
            </FloatingLabel>
            <StyledInput
                value={value}
                onChange={onChange}
                type={type}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </InputContainer>
    );
};

export default MainInput;
