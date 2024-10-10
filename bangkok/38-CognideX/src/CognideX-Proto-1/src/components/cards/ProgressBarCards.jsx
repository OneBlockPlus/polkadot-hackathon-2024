import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    position: absolute;
    display: ${({ $currentSection }) => $currentSection ? 'flex' : 'none'};
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    height: auto;
    backdrop-filter: blur(10px);
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    border-top-right-radius: 0;
    border-top: 2px solid var(--secondary-color);
    font-size: 20px;
    font-family: 'Modernist', sans-serif;
    transition: all 0.3s ease-in-out;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0);
    right: 25px;
    top: 7px;

    &:hover {
        box-shadow: 0 0 20px var(--primary-color);
        background: black;
        cursor: pointer;
    }
`;

const ProgressInfo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    color: white;
    height: 100%;
    width: auto;
    padding: 10px;

    h4 {
        margin: 0;
    }

    p {
        margin: 0;
        font-size: 16px;
        text-align: right;
    }
`

const ProgressBarCards = ({
    currentSection,
    header,
    subHeader,
    onClick
}) => {
    return (
        <Container $currentSection={currentSection} onClick={onClick}>
            <ProgressInfo>
                <h4>
                    {header}
                </h4>
                <p>
                    {subHeader}
                </p>
            </ProgressInfo>
        </Container>
    )
}

export default ProgressBarCards
