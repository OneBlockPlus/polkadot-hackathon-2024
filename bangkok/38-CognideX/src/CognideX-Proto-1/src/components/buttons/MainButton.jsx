import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    height: auto;
    background-color: black;
    border-radius: 10px;
    border: 2px solid white;
    position: relative;
    font-size: 20px;
    font-family: 'Modernist', sans-serif;
    transition: all 0.3s ease-in-out;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0);

    /* Common styles for both pseudo-elements */
    &::before, &::after {
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
        font-weight: 600;
    }

    /* Initial state for ::before (shows '0') */
    &::before {
        content: '0';
        opacity: 1;
        transform: translateY(0);
    }

    /* Initial state for ::after (hidden '1') */
    &::after {
        content: '1';
        opacity: 0;
        transform: translateY(10px);
    }

    /* Hover state animations */
    &:hover::before {
        opacity: 0;
        transform: translateY(-10px);
    }

    &:hover::after {
        opacity: 1;
        transform: translateY(0);
    }

    /* Hover state for the container */
    &:hover {
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 10px rgba(255, 255, 255, 1);
        cursor: pointer;
    }

    /* Active state */
    ${({ $active }) => $active && `
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 10px rgba(255, 255, 255, 1);

        /*Switch the colors of the pseudo-elements*/
        &::before {
            content: '1';
            opacity: 1;
            transform: translateY(0);
        }

        &::after {
            content: '2';
            opacity: 0;
            transform: translateY(10px);
        }

        &:hover {
            border: 2px solid white;
            box-shadow: 0 0 0 rgba(255, 255, 255, 1);
            cursor: pointer;
        }
    `}

    /* Media query for smaller screens */
    @media (max-width: 1000px) {
        width: 160px;
        height: auto;
    }
`;

const ButtonInner = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    color: white;
    height: 100%;
    width: auto;
    padding: 10px;

    h5 {
        margin: 0;
        font-size: 1.2rem;
    }

    p {
        margin: 0;
        font-size: 16px;
    }
`;

const MainButton = ({ header, subheader, onClick, active }) => {
    return (
        <Container onClick={onClick} $active={active}>
            <ButtonInner>
                <h5>
                    {header}
                </h5>
                <p>
                    {subheader}
                </p>
            </ButtonInner>
        </Container>
    );
};

export default MainButton;
