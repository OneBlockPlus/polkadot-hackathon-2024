import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    height: 100vh;
    width: 60vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding: 0 5vw 0 35vw;
    gap: 10px;

    h1 {
        text-align: right;
    }

    h4 {
        text-align: right;
    }

    .card-collection {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
`;

const SecondSection = ({ children }) => {
    return (
        <Container id='smart-assistant'>
            {children}
        </Container>
    )
}

export default SecondSection
