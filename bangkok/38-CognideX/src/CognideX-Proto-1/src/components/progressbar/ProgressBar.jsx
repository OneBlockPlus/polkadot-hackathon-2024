import React from 'react'
import styled from 'styled-components'
import ProgressBarCards from '../cards/ProgressBarCards';

const Container = styled.div`
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    top: 50%;
    transform: translateY(-50%);
    right: 10vw;
    width: 4px;
    height: 60%;
    background-color: var(--primary-color);
`;

const Checkpoint = styled.div`
    display: flex;
    position: relative;
    aspect-ratio: 1;
    width: 15px;
    height: 15px;
    background-color: var(--primary-color);
    border-radius: 5px;
`;

const ProgressBar = ({ children }) => {
    return (
        <Container>
            <Checkpoint>
                <ProgressBarCards currentSection={true} header='Intro' subHeader='CognideX in 30 seconds' />
            </Checkpoint>
            <Checkpoint>
                <ProgressBarCards currentSection={true} header='AI Assistant' subHeader='Find the "Perfect" dataset you need' />
            </Checkpoint>
            <Checkpoint>
                <ProgressBarCards currentSection={true} header='Datasets' subHeader='Access to 22,000 Datasets' />
            </Checkpoint>
            <Checkpoint>
                <ProgressBarCards currentSection={true} header='Data Pools' subHeader='Contribute and Earn from Your Data' />
            </Checkpoint>
        </Container>
    )
}

export default ProgressBar
