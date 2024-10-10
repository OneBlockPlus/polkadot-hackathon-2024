import React, { useState, useRef } from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faUpload } from '@fortawesome/free-solid-svg-icons';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 120px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid black;
  position: relative;
  font-family: 'Modernist', sans-serif;
  transition: all 0.3s ease-in-out;

  &:focus-within {
    border: 2px solid var(--primary-color);
    box-shadow: 0 0 10px rgba(255, 255, 255, 1);
  }

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

  &::before {
    content: '⬆';
    opacity: 1;
    transform: translateY(0);
  }

  &::after {
    content: '✔';
    opacity: 0;
    transform: translateY(10px);
  }

  &:focus-within::before,
  &.has-file::before {
    opacity: 0;
    transform: translateY(-10px);
  }

  &:focus-within::after,
  &.has-file::after {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const StyledButton = styled.div`
    position: relative;
    width: calc(100% - 20px);
    height: calc(100% - 40px);
    background: black;
    padding: 10px;
    border-radius: 8px;
    color: white;
    margin: 10px;
    font-weight: 600;
    font-family: 'Modernist', sans-serif;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const IconContainer = styled.div`
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 40px;
`;

const FileName = styled.div`
  font-size: 20px;
`;

const FileSize = styled.div`
  font-size: 16px;
  margin-top: 5px;
  color: #cccccc;
`;

const MainUpload = ({ label, onChange }) => {
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const fileInputRef = useRef(null);

    const handleClick = () => {
        fileInputRef.current && fileInputRef.current.click();
    };

    const formatFileSize = (size) => {
        if (size >= 1024 * 1024) {
            return (size / (1024 * 1024)).toFixed(1) + ' MB';
        } else if (size >= 1024) {
            return (size / 1024).toFixed(1) + ' KB';
        } else {
            return size + ' bytes';
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFileName(file ? file.name : '');
        setFileSize(file ? formatFileSize(file.size) : '');
        onChange && onChange(event);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleClick();
        }
    };

    return (
        <InputContainer
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className={fileName ? 'has-file' : ''}
        >
            <StyledButton>
                {fileName ? (
                    <>
                        <FileName>Filename: {fileName}</FileName>
                        <FileSize>Filesize: {fileSize}</FileSize>
                    </>
                ) : (
                    <>
                        <FileName>{label}</FileName>
                        <FileSize>Click to upload</FileSize>
                    </>
                )}
                <IconContainer>
                    <FontAwesomeIcon icon={faUpload} />
                </IconContainer>
            </StyledButton>
            <HiddenInput
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </InputContainer>
    );
};

export default MainUpload;
