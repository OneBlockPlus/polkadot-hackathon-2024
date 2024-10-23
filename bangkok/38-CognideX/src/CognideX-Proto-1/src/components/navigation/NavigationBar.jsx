import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, Outlet } from 'react-router-dom';
import CognideXLogo from '../../assets/logo/cognidex-logo.svg';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

/* Keyframes for slide-in animations */
const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

/* Keyframes for slide-out animations */
const slideOutToLeft = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-100%);
  }
`;

const slideOutToRight = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
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
  flex-direction: column;
  background: transparent;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
`;

const HamburgerMenu = styled.div`
  position: fixed;
  top: 5vw;
  left: 5vw;
  display: flex;
  align-items: center;
  background: transparent;
  width: 60px;
  height: 60px;
  gap: 10px;
  z-index: 101;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  img {
    width: 100%;
    height: 100%;
    transition: filter 0.3s ease-in-out, transform 0.3s ease-in-out;
  }

   @media (max-width: 1000px) {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    top: 10vh;
    left: 5vw;
  }

  .explore-text {
    font-size: 1.2rem;
    color: white;
    opacity: 0;
    font-weight: 800;
    transform: translateX(-50%);
    white-space: nowrap;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;

    @media (min-width: 1000px) {
      font-size: 1.1rem;
    }
  }

  .menu-text {
    font-size: 1.2rem;
    color: white;
    font-weight: 800;
    transform: translateX(-140%) scale(1.2);
    white-space: nowrap;
    opacity: 1;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out, scale 0.3s ease-in-out;
  
    @media (min-width: 1000px) {
      font-size: 1.1rem;
    }
  }

  &:hover {
    transform: rotate(-45deg) scale(1.3);

    img {
      filter: drop-shadow(5px 5px 10px rgba(255, 255, 255, 0.8));
    }

    .explore-text {
      opacity: 1;
      transform: translateX(30%) rotate(45deg) translateY(270%) scale(1);
    }

    .menu-text {
      opacity: 0;
      transform: translateX(-160%) rotate(45deg) translateY(30%) scale(1);
    }
  }


`;

const NavigationComponent = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 20px;
  font-size: 22px;
  font-family: 'Modernist', sans-serif;
  color: black;
  background: white;
  text-decoration: none;
  font-weight: bold;
  position: relative;
  opacity: ${(props) => (props.isClosing ? 1 : 0)};
  animation: ${(props) =>
    props.isClosing
      ? props.animationType === 'left'
        ? slideOutToLeft
        : slideOutToRight
      : props.animationType === 'left'
        ? slideInFromLeft
        : slideInFromRight}
    0.5s ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: ${(props) => props.delay}s;

  p {
    color: black;
    font-size: 5vw;
    font-weight: bold;
  }

  &:before,
  &:after {
    content: "";
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    font-size: 5vw;
  }

  &:before {
    content: "{";
    margin-right: 10px;
  }

  &:after {
    content: "}";
    margin-left: 10px;
  }

  &:hover::before,
  &:hover::after {
    opacity: 1;
    transform: scale(1);
  }
`;

const LogoContainer = styled(Link)`
  position: absolute;
  top: 5vw;
  left: 5vw;
  display: ${(props) => (props.$isClosing ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: auto;
  height: 60px;
  gap: 8px;
  text-decoration: none;
  z-index: 100;

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

  @media (max-width: 768px) {
    top: 10vh;
    left: 5vw;
    height: 50px;

    p {
      font-size: 20px;
    }
  }
`;

const CloseContainer = styled.div`
  position: absolute;
  top: 5vw;
  right: 5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease-in-out;

  svg {
    color: black;
  }

  &:hover {
    transform: scale(1.1) rotate(90deg);
  }

  // onclick scale smaller
  &:active {
    transform: scale(0.9) rotate(90deg);
  }

  @media (max-width: 768px) {
    top: 10vh;
    right: 5vw;
    width: 50px;
    height: 50px;
  }
`;

const NavigationComponentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const NavigationBar = () => {
  const { user, openSigninModal } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle opening the modal
  const openModal = () => {
    setIsModalVisible(true);
  };

  // Handle closing the modal with animation
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalVisible(false);
      setIsClosing(false);
    }, 900); // Adjusted to match total animation time
  };

  const toggleModal = () => {
    if (isModalVisible) closeModal();
    else openModal();
  };

  const toggleModalAndSignin = () => {
    openSigninModal();
    toggleModal();
  }

  return (
    <AppContainer>
      <HamburgerMenu onClick={toggleModal}>
        <img src={CognideXLogo} alt="CognideX Logo" />
        <p className="explore-text">Explore</p>
        <p className="menu-text">Menu</p>
      </HamburgerMenu>
      {isModalVisible && (
        <Container>
          <LogoContainer to="/" onClick={toggleModal} $isClosing={isClosing}>
            <img src={CognideXLogo} alt="CognideX Logo" />
            <p>CognideX</p>
          </LogoContainer>
          <CloseContainer onClick={toggleModal}>
            <FontAwesomeIcon icon={faTimes} size="2x" />
          </CloseContainer>
          <NavigationComponentContainer>
            <NavigationComponent
              to="/D-GPT"
              onClick={toggleModal}
              animationType="left"
              delay={0}
              isClosing={isClosing}
            >
              <p>D-GPT</p>
            </NavigationComponent>
            <NavigationComponent
              to="/datapool"
              onClick={toggleModal}
              animationType="right"
              delay={0.2}
              isClosing={isClosing}
            >
              <p>DataPool</p>
            </NavigationComponent>
            <NavigationComponent
              to={user ? '/account' : ''}
              onClick={user ? toggleModal : toggleModalAndSignin}
              animationType="left"
              delay={0.4}
              isClosing={isClosing}
            >
              <p>
                {user ? 'Account' : 'Sign In/Up'}
              </p>
            </NavigationComponent>
          </NavigationComponentContainer>
        </Container>
      )}
      <Outlet />
    </AppContainer>
  );
};

export default NavigationBar;
