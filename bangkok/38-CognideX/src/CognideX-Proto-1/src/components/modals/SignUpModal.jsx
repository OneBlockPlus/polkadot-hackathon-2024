import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

import MainInput from '../inputs/MainInput';
import MainButtonInvert from '../buttons/MainButtonInvert';

import { signUp, confirmSignUp } from 'aws-amplify/auth';

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
    font-family: 'Modernist', sans-serif;
    color: black;
    margin: 0;
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

const SignUpModal = () => {
  const { signupModalOpen, closeSignupModal } = useAuth();

  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [verificationCode, setVerificationCode] = useState();

  const [animationType, setAnimationType] = useState('in');
  const [isVisible, setIsVisible] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (signupModalOpen) {
      // When the modal should open
      setIsVisible(true);
      setAnimationType('in');
    } else if (!signupModalOpen && isVisible) {
      // When the modal should close
      setAnimationType('out');
      // Wait for the animation to finish before unmounting
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the animation duration
    }
  }, [signupModalOpen, isVisible]);

  if (!isVisible) return null;

  const handleClose = () => {
    setAnimationType('out');
    setTimeout(() => {
      closeSignupModal();
    }, 300); // Match the animation duration
  };

  const handleSignUp = async () => {
    if (userInfo.password !== userInfo.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (userInfo.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    if (userInfo.phoneNumber.length < 8) {
      alert('Phone number must more than 10 digit');
      return;
    }

    try {
      await signUp({
        username: userInfo.email,
        password: userInfo.password,
        options: {
          userAttributes: {
            email: userInfo.email,
            phone_number: userInfo.phoneNumber,
          },
          autoSignIn: true
        },
      });

      setIsSigningUp(true);

    } catch (e) {
      alert(e.message);
    }
  };

  const handleVerification = async () => {
    try {
      if (verificationCode.length !== 6) {
        alert('Verification code must be 6 digits');
        return;
      }

      await confirmSignUp({
        username: userInfo.email,
        confirmationCode: verificationCode,
      });

      alert('User created successfully');
      setIsSigningUp(false);
      closeSignupModal();

    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Background animationType={animationType}>
      <Modal animationType={animationType}>
        {!isSigningUp && (
          <>
            <ModalHeader>
              <h3>Sign Up</h3>
              <CloseButton onClick={handleClose}>
                {/* SVG for close icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71A1 1 0 0 0 5.7 7.12L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z" />
                </svg>
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <ModalHeader>
                <p>Sign Up to start your Data Journey</p>
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
              <MainInput
                label="Confirm Password"
                type="password"
                value={userInfo.confirmPassword}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, confirmPassword: e.target.value })
                }
              />
              <MainInput
                label="Phone Number with Country Code"
                type="tel"
                value={userInfo.phoneNumber}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, phoneNumber: e.target.value })
                }
              />
            </ModalBody>
            <ModalEnd>
              <MainButtonInvert
                header="Sign Up"
                subheader="Create Account"
                onClick={handleSignUp}
              />
            </ModalEnd>
          </>
        )}
        {isSigningUp && (
          <>
            <ModalHeader>
              <h3>Verification</h3>
              <CloseButton onClick={handleClose}>
                {/* SVG for close icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71A1 1 0 0 0 5.7 7.12L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z" />
                </svg>
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <ModalHeader>
                <p>Verification code sent to your email</p>
              </ModalHeader>
              <MainInput
                label="Verification Code"
                type="number"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </ModalBody>
            <ModalEnd>
              <MainButtonInvert
                header="Verify"
                subheader="Confirm Account"
                onClick={handleVerification}
              />
            </ModalEnd>
          </>
        )}
      </Modal>
    </Background>
  );
};

export default SignUpModal;
