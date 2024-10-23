import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLoading } from '../../context/LoadingContext';
import CognideXLogo from '../../assets/logo/cognidex-logo.svg';

// Keyframes for slide-in and slide-out directions
const slideInTopRight = keyframes`
  from {
    transform: translate(50vw, 0vh);
  }
  to {
    transform: translate(0, 0);
  }
`;

const slideOutTopRight = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(50vw, 0vh);
  }
`;

const slideInTopLeft = keyframes`
  from {
    transform: translate(0, -50vh);
  }
  to {
    transform: translate(0, 0);
  }
`;

const slideOutTopLeft = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(0, -50vh);
  }
`;

const slideInBottomRight = keyframes`
  from {
    transform: translate(0, 50vh);
  }
  to {
    transform: translate(0, 0);
  }
`;

const slideOutBottomRight = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(0, 50vh);
  }
`;

const slideInBottomLeft = keyframes`
  from {
    transform: translate(-50vw, 0);
  }
  to {
    transform: translate(0, 0);
  }
`;

const slideOutBottomLeft = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(-50vw, 0);
  }
`;

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

// Styled components
const BackgroundContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
`;

const BackgroundTopRight = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 50vw;
  height: 50vh;
  background-color: white;
  animation: ${({ isExiting }) => (isExiting ? slideOutTopRight : slideInTopRight)} 0.7s ease-out forwards;
`;

const BackgroundTopLeft = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50vw;
  height: 50vh;
  background-color: white;
  animation: ${({ isExiting }) => (isExiting ? slideOutTopLeft : slideInTopLeft)} 0.7s ease-out forwards;
`;

const BackgroundBottomRight = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50vw;
  height: 50vh;
  background-color: white;
  animation: ${({ isExiting }) => (isExiting ? slideOutBottomRight : slideInBottomRight)} 0.7s ease-out forwards;
`;

const BackgroundBottomLeft = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50vw;
  height: 50vh;
  background-color: white;
  animation: ${({ isExiting }) => (isExiting ? slideOutBottomLeft : slideInBottomLeft)} 0.7s ease-out forwards;
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  height: 300px;
  transform: translate(-50%, -50%);
  animation: ${({ isExiting }) => (isExiting ? fadeOut : fadeIn)} 0.7s ease-in-out forwards;

  .loading-container {
    display: flex;
    flex-direction: column;
    height: 300px;
    justify-content: center;
    align-items: flex-start;

  }

  .img-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    width: 100px;

    img {
        filter: invert(1);
        transform: rotate(-45deg);
        opacity: 0.4;
    }
  }

  h1 {
    font-size: 3rem;
    color: black;
  }

  h2 {
    font-size: 1.8rem;
    color: black;
  }
`;

const FullScreenLoader = () => {
    const { loadingMessage, loadingModalOpen } = useLoading();
    const [isExiting, setIsExiting] = useState(false);
    const [hasOpened, setHasOpened] = useState(false); // Track if modal was ever opened

    // Listen for loadingModalOpen changes and handle exit animation
    useEffect(() => {
        if (loadingModalOpen) {
            setHasOpened(true); // Mark that modal was opened
            setIsExiting(false); // Reset exit state
        } else if (hasOpened) {
            setIsExiting(true); // Start exit animation only if it was opened before
            const timer = setTimeout(() => setIsExiting(false), 1000); // Wait for animation to complete
            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [loadingModalOpen, hasOpened]);

    // Only render if either loadingModalOpen is true or exit animation is in progress
    if (!loadingModalOpen && !isExiting) {
        return null; // Exit gracefully after animations complete
    }

    return (
        <BackgroundContainer>
            <BackgroundTopRight isExiting={isExiting} />
            <BackgroundTopLeft isExiting={isExiting} />
            <BackgroundBottomRight isExiting={isExiting} />
            <BackgroundBottomLeft isExiting={isExiting} />
            <LoadingMessage isExiting={isExiting}>
                <div className='img-container'>
                    <img src={CognideXLogo} alt='CognideX Logo' />
                </div>
                <div className='loading-container'>
                    <h1>{loadingMessage?.loadingHeader}</h1>
                    <h2>{loadingMessage?.loadingMessage}</h2>
                </div>
            </LoadingMessage>
        </BackgroundContainer>
    );
};

export default FullScreenLoader;
