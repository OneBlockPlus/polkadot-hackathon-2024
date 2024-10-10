import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    height: 85vh;
    width: 90vw;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 5vh 5vw 10vh 5vw;
    gap: 10px;

    h1 {
        text-align: center;
        color: black;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);

        span {
            color: var(--primary-color);
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }
    }

    h4 {
        text-align: center;
        color: black;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);

        span {
            color: var(--primary-color);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }
    }

    .card-collection {
        display: flex;
        position: relative;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        height: 300px;
        width: 100%;

        .card {
            &:nth-child(1) {
                transform: rotate(-20deg);
            }

            &:nth-child(2) {

                transform: translateY(-50%);
            }

            &:nth-child(3) {
                transform: rotate(20deg);
            }
        }
    }
`;

const ForthSection = ({ children }) => {
    return (
        <Container id='cgdx'>
            {children}
        </Container>
    )
}

export default ForthSection
