import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

import MainInput from '../inputs/MainInput';
import MainButtonInvert from '../buttons/MainButtonInvert';

import { signIn } from 'aws-amplify/auth';

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
  /* Existing styles */
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

  /* Animation */
  animation: ${(props) =>
    props.animationType === 'in' ? fadeIn : fadeOut}
    0.3s ease-in-out forwards;
`;

const Modal = styled.div`
  /* Existing styles */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: auto;
  min-width: 400px;
  height: auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 0 10px var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: 10px 10px 10px 15px;
  gap: 20px;

  /* Animation */
  animation: ${(props) =>
    props.animationType === 'in' ? scaleIn : scaleOut}
    0.3s ease-in-out forwards;
`;

const ModalHeader = styled.div`
  /* Existing styles */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;

  h3 {
    font-size: 30px;
    font-family: 'Modernist', sans-serif;
    color: black;
    margin: 0;
  }

  p {
    font-size: 20px;
    font-weight: 600;
    font-family: 'Modernist', sans-serif;
    color: black;
    margin: 0;
  }

  span {
    font-size: 20px;
    font-weight: 600;
    font-family: 'Modernist', sans-serif;
    color: var(--primary-color);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    text-decoration: underline;


    &:hover {
      color: var(--secondary-color);
    }
  }
`;

const CloseButton = styled.div`
  /* Existing styles */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: black;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  /* Existing styles */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: calc(100% - 10px);
  height: auto;
  gap: 20px;
  padding-right: 10px;
`;

const ModalEnd = styled.div`
  /* Existing styles */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  width: calc(100% - 10px);
  height: auto;
  gap: 20px;
  padding-right: 10px;
`;

const SignInModal = () => {
  const { signinModalOpen, closeSigninModal, openSignupModal, checkUserAuth } = useAuth();

  const [userInfo, setUserInfo] = useState({
    email: '',
    password: ''
  });

  const [animationType, setAnimationType] = useState('in');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (signinModalOpen) {
      // When the modal should open
      setIsVisible(true);
      setAnimationType('in');
    } else if (!signinModalOpen && isVisible) {
      // When the modal should close
      setAnimationType('out');
      // Wait for the animation to finish before unmounting
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the animation duration
    }
  }, [signinModalOpen, isVisible]);

  if (!isVisible) return null;

  const handleClose = () => {
    setAnimationType('out');
    setTimeout(() => {
      closeSigninModal();
    }, 300); // Match the animation duration
  };

  const handleSignUp = () => {
    handleClose()
    openSignupModal()
  }

  const handleSignIn = async () => {
    if (userInfo.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      await signIn({
        username: userInfo.email,
        password: userInfo.password,
      });
      handleClose();
      checkUserAuth();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <Background animationType={animationType}>
      <Modal animationType={animationType}>
        <ModalHeader>
          <h3>Sign In</h3>
          <CloseButton onClick={handleClose}>
            {/* SVG for close icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71A1 1 0 0 0 5.7 7.12L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z" />
            </svg>
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <ModalHeader>
            <p>Don't have an account? <span onClick={handleSignUp}>Sign Up</span></p>
          </ModalHeader>
          <MainInput
            label="Email"
            type="email"
            value={userInfo.email}
            onChange={(e) =>
              setUserInfo({ ...userInfo, email: e.target.value })
            }
          />
          <MainInput
            label="Password"
            type="password"
            value={userInfo.password}
            onChange={(e) =>
              setUserInfo({ ...userInfo, password: e.target.value })
            }
          />
        </ModalBody>
        <ModalEnd>
          <MainButtonInvert
            header="Sign In"
            subheader="Let's continue here"
            onClick={handleSignIn}
          />
        </ModalEnd>
      </Modal>
    </Background>
  );
};

export default SignInModal;
