import React from 'react'
import styled from 'styled-components'

// Essentially the Hero section
const Container = styled.div`
    height: 90vh;
    width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 10vh 5vw 0 5vw;
    gap: 20px;

    .card-container {
        display: flex;
        width: 90vw;
        flex-direction: row;
        gap: 10px;
        min-height: 100px;
        justify-content: flex-start;
    }

    .upload-container {
        display: flex;
        min-height: 100px;
        width: 90vw;
        justify-content: flex-start;
    }

    .button-container {
        display: flex;
        width: 90vw;
        justify-content: flex-end;
    }
`;

const ContributeSection = ({ children }) => {
    return (
        <Container>
            {children}
        </Container>
    )
}

export default ContributeSection
