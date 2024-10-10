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
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);

        span {
            color: var(--primary-color);
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
        }
    }

    h4 {
        text-align: center;
        color: black;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
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
        // background: white;
        // box-shadow: 0 0 10px var(--primary-color);
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
