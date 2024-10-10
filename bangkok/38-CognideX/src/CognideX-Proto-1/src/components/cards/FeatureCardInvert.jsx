import React from 'react';
import styled from 'styled-components';

const LogoItem = styled.img`
  position: absolute;
  width: 50%;
  height: 50%;
  object-fit: contain;
  transition: transform 0.5s;
  filter: invert(1);

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
  padding: 70px 10px 10px 10px; /* Adjusted to make space for the logo */
  color: white;

  h2 {
    text-align: right;
    color: black;
  }

  p {
    margin: 0;
    font-size: 16px;
    text-align: right;
    color: black;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 300px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid black;
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
    background-color: white;
    border-radius: 9px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
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
`;

const FeatureCardInvert = ({ logo, title, description, onClick }) => (
    <Container onClick={onClick}>
        <LogoContainer>
            <LogoItem src={logo} alt="Logo 1" />
            <LogoItem src={logo} alt="Logo 2" />
            <LogoItem src={logo} alt="Logo 3" />
            <LogoItem src={logo} alt="Logo 4" />
        </LogoContainer>
        <Content>
            <h2>{title}</h2>
            <p>{description}</p>
        </Content>
    </Container>
);

export default FeatureCardInvert;
