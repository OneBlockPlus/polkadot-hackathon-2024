import React from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LogoContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
`;

const Content = styled.div`
  padding: 10px 10px 50px 10px; /* Adjusted to make space for the logo */
  color: white;

  h2 {
    text-align: left;
  }

  p {
    margin: 0;
    font-weight: 600;
    font-size: 16px;
    text-align: left;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 0;
  min-width: 300px;
  background-color: black;
  border-radius: 10px;
  border: 2px solid white;
  font-family: 'Modernist', sans-serif;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0);
  height: 100%;
  min-height: 250px;
  max-height: 300px;

  &::before,
  &::after {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 30px;
    height: 30px;
    background-color: black;
    border-radius: 9px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    transition: all 0.3s ease-in-out;
    font-size: 20px;
  }

  &::before {
    content: 'X';
    opacity: 1;
    transform: translateY(0);
  }

  &::after {
    content: 'Y';
    opacity: 0;
    transform: translateY(10px);
  }

  &:hover::before {
    opacity: 0;
    transform: translateY(-10px);
  }

  &:hover::after {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(255, 255, 255, 1);
    cursor: pointer;
  }

  .file-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 10px;
      border: 2px solid var(--primary-color);
      padding: 5px;
      border-radius: 5px;
  }

  .process-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 10px;
      border-radius: 5px;
  }

  .score-info {
      display: flex;
      flex-direction: row;
      gap: 5px;
      margin-top: 10px;
      border: 2px solid var(--primary-color);
      padding: 5px;
      border-radius: 5px;
  }

  @media (max-width: 1000px) {
  
    height: auto;
  }
`;

const Panel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
`;

const UploadCard = ({ icon, title, description, active, children }) => (
  <Container>
    {!active && <Panel />}
    {icon &&
      <LogoContainer>
        <FontAwesomeIcon icon={icon} color='white' size='2x' />
      </LogoContainer>
    }
    <Content>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </Content>
  </Container>
);

export default UploadCard;
