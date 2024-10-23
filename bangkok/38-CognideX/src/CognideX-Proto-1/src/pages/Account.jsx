import React from 'react'
import styled from 'styled-components'

import MainBackground from '../components/backgrounds/MainBackground';

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
`;

const Account = () => {
    return (
        <MainBackground>
            <Container>
                <h1>Account Page</h1>
            </Container>
        </MainBackground>
    )
}

export default Account
