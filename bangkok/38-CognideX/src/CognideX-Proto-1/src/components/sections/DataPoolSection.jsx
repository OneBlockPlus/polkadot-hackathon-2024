import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    position: relative;
    display: flex;
    height: 75vh;
    width: 90vw;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 15vh 5vw 10vh 5vw;
    gap: 10px;

    h1 {
        text-align: left;
        color: ${(props) => props.$profile === 'buy' ? 'black' : 'white'};
    }

    h4 {
        text-align: left;
        color: ${(props) => props.$profile === 'buy' ? 'black' : 'white'};
    }

    .card-collection {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 10px;
        gap: 10px;
        width: auto;
        height: auto;
    }

    .inner-container {
        flex-direction: column;
        gap: 10px;
    }
`;

const DataPoolSection = ({ children, role }) => {
    return (
        <Container $profile={role}>
            {children}
        </Container>
    )
}

export default DataPoolSection
