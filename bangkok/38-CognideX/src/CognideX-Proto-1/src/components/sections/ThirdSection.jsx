import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;

    h1 {
        text-align: center;
        color: black;

        span {
            color: var(--primary-color);
        }
    }

    h4 {
        text-align: center;
        color: black;
    }

    .card-collection {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100vw;
        height: auto;
        padding: 20px 5vw;

        @media (max-width: 1000px) {
            width: 90vw;
        }

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 12px;
        }
    }
`;

const ThirdSection = ({ children }) => {
    return (
        <Container id='data-pool'>
            {children}
        </Container>
    )
}

export default ThirdSection
