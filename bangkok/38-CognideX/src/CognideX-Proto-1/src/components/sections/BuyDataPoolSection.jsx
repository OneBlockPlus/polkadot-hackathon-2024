
import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    position: relative;
    display: flex;
    height: calc(75vh - 20px);
    width: 90vw;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: calc(15vh + 20px) 5vw 10vh 5vw;
    gap: 10px;

    h1 {
        text-align: left;
        font-size: 2.5rem;
        color: ${(props) => props.$profile === 'buy' ? 'black' : 'white'};
    }

    h4 {
        text-align: left;
        color: ${(props) => props.$profile === 'buy' ? 'black' : 'white'};
    }

    .upload-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 10px;
        gap: 10px;
        width: 100%;
        height: auto;
    }
`;

const BuyDataPoolSection = ({ children, role }) => {
    return (
        <Container $profile={role}>
            {children}
        </Container>
    )
}

export default BuyDataPoolSection
