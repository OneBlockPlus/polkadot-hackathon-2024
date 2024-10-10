import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    height: auto;
    background-color: white;
    border-radius: 10px;
    border-left: 2px solid black;
    border-bottom: 2px solid black;
    border-right: 2px solid black;
    border-top: 2px solid black;
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
        background-color: white; 
        border-radius: 9px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        transition: all 0.3s ease-in-out;
        font-size: 20px;
        font-family: 'Modernist', sans-serif;
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
`;

const ButtonInner = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    color: black;
    height: 100%;
    width: auto;
    padding: 10px;

    h4 {
        color: black;
        margin: 0;
    }

    p {
        margin: 0;
        font-size: 16px;
    }
`;

const MainButtonInvert = ({ header, subheader, onClick }) => {
    return (
        <Container onClick={onClick}>
            <ButtonInner>
                <h4>
                    {header}
                </h4>
                <p>
                    {subheader}
                </p>
            </ButtonInner>
        </Container>
    );
};

export default MainButtonInvert;
