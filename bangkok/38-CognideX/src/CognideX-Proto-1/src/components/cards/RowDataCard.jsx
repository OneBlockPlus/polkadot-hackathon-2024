import React from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LogoItem = styled.img`
  position: absolute;
  width: 50%;
  height: 50%;
  object-fit: contain;
  transition: transform 0.5s;

  &:nth-child(1) {
    top: 0;
    left: 0;
  }

  &:nth-child(2) {
    top: 0;
    left: 50%;
  }

  &:nth-child(3) {
    top: 50%;
    left: 0;
  }

  &:nth-child(4) {
    top: 50%;
    left: 50%;
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 80px;
  height: 80px;
`;

const Content = styled.div`
  padding: 10px 10px 10px 10px; /* Adjusted to make space for the logo */
  color: white;

  h2 {
    text-align: right;
  }

  p {
    margin: 0;
    font-weight: 400;
    font-size: 16px;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  flex: 1 1 0;
  background-color: black;
  border-radius: 10px;
  border: 2px solid white;
  font-family: 'Modernist', sans-serif;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0);
  height: auto;

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
    font-family: 'Modernist', sans-serif;
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

    // logos swap locations on hover
    ${LogoItem}:nth-child(1) {
        transform: translate(0, 100%);
    }
    
    ${LogoItem}:nth-child(2) {
        transform: translate(-100%, 0);
    }

    ${LogoItem}:nth-child(3) {
        transform: translate(100%, 0);
    }

    ${LogoItem}:nth-child(4) {
        transform: translate(0, -100%);
    }
  }

    ${({ $selected }) => $selected && `
        border-color: var(--primary-color);
        box-shadow: 0 0 10px rgba(255, 255, 255, 1);
    `}
`;

const RowDataCard = ({ logo, icon, uploadHash, time, title, description, onClick, selected }) => (
    <Container onClick={onClick} $selected={selected}>
        {logo && (
            <LogoContainer>
                <LogoItem src={logo} alt="Logo 1" />
                <LogoItem src={logo} alt="Logo 2" />
                <LogoItem src={logo} alt="Logo 3" />
                <LogoItem src={logo} alt="Logo 4" />
            </LogoContainer>
        )}
        {icon &&
            <LogoContainer>
                <FontAwesomeIcon icon={icon} color='white' size='3x' />
            </LogoContainer>
        }
        <Content>
            <p>{uploadHash}</p>
            <p>Time: {time}</p>
            <p>Data Quality: {description}/10</p>
            <h2>{title} CGDX</h2>
        </Content>
    </Container>
);

export default RowDataCard;
