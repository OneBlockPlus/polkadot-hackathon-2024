import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { Link } from 'react-router-dom';

import CognideXLogo from '../../assets/logo/cognidex-logo.svg';
import MainButtonInvert from '../buttons/MainButtonInvert';

import { useAuth } from '../../context/AuthContext';

import { Outlet } from 'react-router-dom';

/* Keyframes for modal animations */
const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: auto;
`;

const Container = styled.div`
    position: fixed;
    display: flex;
    flex-direction: row;
    background: white;
    width: 90vw;
    height: 40px;
    padding: 10px 5vw;
    gap: 20px;
    z-index: 100;
`;

const NavigationComponent = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 100%;
  border-radius: 30px;
  gap: 20px;
  font-size: 22px;
  font-family: 'Modernist', sans-serif;
  color: black;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  position: relative; /* For positioning the modal */

  &:hover {
    /* Additional hover styles if needed */
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: auto;
  height: auto;
  margin-left: 10px;
  gap: 5px;
  text-decoration: none;

  img {
    width: 100%;
    height: 100%;
    filter: invert(1);
  }

  p {
    font-size: 24px;
    font-weight: bold;
    font-family: 'Modernist', sans-serif;
    color: black;
    margin: 0;
  }
`;

const NavigationComponentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  gap: 20px;
`;

/* Modal Styles */
const AccountModal = styled.div`
  position: absolute;
  top: 100%; /* Position below the Account component */
  right: 0%; /* Position to the right of the Account component */
  display: ${(props) => (props.isVisible ? 'flex' : 'none')};
  flex-direction: column;
  background: white;
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  padding: 10px 10px 5px 5px;
  gap: 10px;
  width: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 200;
   animation: ${(props) => (props.isVisible ? slideDown : slideUp)} 0.3s forwards;
  pointer-events: ${(props) => (props.isVisible ? 'auto' : 'none')};

  a {
    font-size: 18px;
    color: black;
    text-decoration: none;
    padding: 8px 0;
    font-family: 'Modernist', sans-serif;

    &:hover {
      color: var(--primary-color);
    }
  }
`;

const NavigationBar = () => {
  const { openSignupModal, openSigninModal } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <AppContainer>
      <Container>
        <LogoContainer
          to="/"
        >
          <img src={CognideXLogo} alt='CognideX Logo' />
          <p>CognideX</p>
        </LogoContainer>
        <NavigationComponentContainer>
          <NavigationComponent to="/D-GPT">
            <p>D-GPT</p>
          </NavigationComponent>
          <NavigationComponent to="/datapool">
            <p>DataPool</p>
          </NavigationComponent>
          <NavigationComponent
            to="/account"
            onMouseEnter={() => setIsModalVisible(true)}
            onMouseLeave={() => setIsModalVisible(false)}
          >
            <p>Account</p>
            <AccountModal isVisible={isModalVisible}>
              <MainButtonInvert header='Get Started' subheader='Create an account!' onClick={openSignupModal} />
              <MainButtonInvert header='Sign In' subheader='Already have one?' onClick={openSigninModal} />
            </AccountModal>
          </NavigationComponent>
        </NavigationComponentContainer>
      </Container>
      <Outlet />
    </AppContainer>
  );
};

export default NavigationBar;
