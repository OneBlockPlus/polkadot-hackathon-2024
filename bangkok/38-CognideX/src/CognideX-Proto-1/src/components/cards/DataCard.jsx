import React from 'react'
import styled from 'styled-components'
import CognideXLogo from '../../assets/logo/cognidex-logo.png';


const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    height: 300px;
    background-color: black;
    border-radius: 10px;
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    border-right: 2px solid white;
    border-top: 2px solid white;
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
    justify-content: spcae-between;

    // align-items: flex-start;
    color: white;
    height: 100%;
    width: auto;
    padding: 10px;
    // background-color: red;

    h4 {
        margin: 0;
    }

    p {
        margin: 0;
        font-size: 16px;
    }
    
    img {
        width: 180px;
        height: 180px;
    }
`;

const DataCard = ({ title, coverPage, onClick }) => {
    return (
        <Container onClick={onClick}>
            <ButtonInner>
                <img src={CognideXLogo} alt="cover" />
                <h4>
                    {title}
                </h4>
            </ButtonInner>
        </Container>
    );
};

export default DataCard;
