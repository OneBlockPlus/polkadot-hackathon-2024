import React from 'react';
import styled, { keyframes } from 'styled-components';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useData } from '../../context/DataContext';

// Keyframes for the shopping cart animation
const moveCart = keyframes`
    0% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(50px); /* Move it out of view */
        opacity: 0; /* Make it invisible when leaving */
    }
    51% {
        transform: translateX(-50px); /* Bring it back from the left */
        opacity: 0;
    }
    100% {
        transform: translateX(0); /* Reset the position */
        opacity: 1; /* Make it visible again */
    }
`;

const SecondSvg = styled(FontAwesomeIcon)`
    font-size: 1.2rem;
    transition: all 0.5s ease-in-out;
    display: none;
`;

const PopOutContainer = styled.div`
    position: fixed;
    display: flex;
    flex-direction: row;
    bottom: 5vw;
    right: 4vw;
    align-items: center;
    width: auto;
    height: auto;
    padding: 10px;
    background-color: white;
    border-radius: 10px;
    border: 2px solid var(--primary-color);
    box-shadow: 0 0 10px var(--primary-color);
    z-index: 1000;
    overflow: hidden;
    transition: all 0.5s ease-in-out;

    svg {
        position: absolute;
        font-size: 1.2rem;
        opacity: 1;
        right: 10px;
        transition: all 0.3s ease-in-out;
    }

    p {
        font-size: 1.2rem;
        color: black;
        margin: 0 30px 0 0;
        text-align: center;
        line-height: 1;
        font-family: 'Modernist', sans-serif;
        font-weight: 600;
    }

    &:hover {
        cursor: pointer;
        
        svg {
            animation: ${moveCart} 0.3s forwards; /* Start the animation on hover */
        }

        ${SecondSvg} {
            display: block;
        }
    }

    &:active {
        transform: scale(0.9);
    }
`;

const DataPopOut = ({ uploads }) => {
    const { openDataModal } = useData();

    const handleOpenDataModal = () => {
        openDataModal(uploads);
    }

    return (
        <PopOutContainer onClick={handleOpenDataModal}>
            <p>{uploads?.length}</p>
            <FontAwesomeIcon icon={faShoppingCart} size="1x" />
            <SecondSvg icon={faShoppingCart} size="1x" />
        </PopOutContainer>
    );
};

export default DataPopOut;
