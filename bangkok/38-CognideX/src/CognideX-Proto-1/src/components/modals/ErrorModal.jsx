import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useError } from '../../context/ErrorContext';
import MainButtonInvert from '../buttons/MainButtonInvert';

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

// Styled components with animations
const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 101;
  animation: ${(props) =>
    props.animationType === 'in' ? fadeIn : fadeOut} 0.3s ease-in-out forwards;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 0 10px red;
  border: 2px solid red;
  padding: 10px;
  gap: 10px;
  animation: ${(props) =>
    props.animationType === 'in' ? scaleIn : scaleOut} 0.3s ease-in-out forwards;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  h3 {
    font-size: 30px;
    font-family: 'Modernist', sans-serif;
    color: black;
    margin: 0;
  }
`;

const CloseButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  height: auto;
  max-width: 400px;
  text-align: left;

  p {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: red;
  }
`;

const ModalEnd = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  min-height: 50px;
  margin-top: 20px;
`;

// Error Modal Component
const ErrorModal = () => {
  const [animationType, setAnimationType] = useState('in');
  const [isVisible, setIsVisible] = useState(false);
  const { errorMessage, errorModalOpen, closeErrorModal, } = useError();

  useEffect(() => {
    if (errorModalOpen) {
      setIsVisible(true);
      setAnimationType('in');
    } else if (!errorModalOpen && isVisible) {
      setAnimationType('out');
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [errorModalOpen, isVisible]);

  if (!isVisible) return null;

  const handleClose = () => {
    setAnimationType('out');
    setTimeout(() => {
      closeErrorModal();
    }, 300);
  };

  return (
    <Background animationType={animationType}>
      <Modal animationType={animationType}>
        <ModalHeader>
          <h3>{errorMessage?.errorHeader}</h3>
          <CloseButton onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71A1 1 0 0 0 5.7 7.12L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z" />
            </svg>
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <p>{errorMessage?.errorMessage || 'An unexpected error occurred. Please try again.'}</p>
        </ModalBody>
        <ModalEnd>
          <MainButtonInvert onClick={handleClose} header="Dismiss" subheader="Try again soon" />
        </ModalEnd>
      </Modal>
    </Background>
  );
};

export default ErrorModal;
