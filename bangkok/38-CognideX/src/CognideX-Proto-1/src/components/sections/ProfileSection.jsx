import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    position: relative;
    width: 90vw;
    min-height: calc(90vh - 90px);
    height: auto;
    padding: calc(10vh + 70px) 5vw 20px 5vw;
    display: flex;
    flex-direction: column;
    gap: 20px;

    h5 {
        font-size: 1.2rem;
        font-weight: 300;
        color: white;
        margin: 0;
        line-height: 1.5;
    }

    h2 {
        font-size: 3rem;
    }

    .rewards-container {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 10px;
        gap: 10px;
        width: auto;
        height: auto;
    }

    .no-rewards-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 20px;
        width: auto;
        height: auto;
        color: white;

        p {
            margin: 0;
        }
    }

    .transactions-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 20px;
        width: auto;
        height: auto;
        color: white;
    }
`;


const ProfileSection = ({ children }) => {
    return (
        <Container>
            {children}
        </Container>
    );
};

export default ProfileSection;
