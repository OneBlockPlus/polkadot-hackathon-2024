import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom';

import CognideX from '../../assets/logo/cognidex-logo.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';

const Container = styled.div`
    position: relative;
    height: auto;
    width: 90vw;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    padding: 40px 5vw 10px 5vw;
    gap: 20px;
    background: linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,0) 100%);
`;

const LogoContainer = styled(Link)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    width: auto;
    gap: 8px;
    text-decoration: none;

    img {
        width: 100%;
        height: 100%;
        filter: invert(1);
    }

    p {
        font-size: 24px;
        font-weight: bold;
        font-family: 'Modernist', sans-serif;
        color: black;
        margin: 0;
    }

    @media (max-width: 768px) {
        top: 10vh;
        left: 5vw;
        height: 50px;

        p {
            font-size: 20px;
        }
    }
`;

const FooterComponentContainerLogo = styled.div`
    height: auto;
    width: auto;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 30px;
`;

const FooterComponentContainer = styled.div`
    height: auto;
    width: 50vw;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;  

    @media (max-width: 1000px) {
        width: 90vw;
    }


    @media (max-width: 768px) {
        width: 90vw;
        gap: 20px;
    }
`;

const FootComponent = styled.div`
    height: 200px;
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin: 20px 0 0 0;
`;

const FooterInner = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    h2 {
        font-size: 18px;
        font-weight: 1000;
        margin: 0;
        color: #4c4c4c;
    }
`;

const FooterLink = styled(Link)`
    text-decoration: none;
    font-size: 20px;
    font-weight: 1000;
    margin: 30px 0 0 0;
    color: black;
    transition: all 0.3s ease-in-out;

    &:hover {
        color: var(--primary-color);
    }
`;

const FooterIconContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 10px 0 0 0;
    align-items: center;
    gap: 20px;
    width: auto;
    height: 40px;

    svg {
        color: black;
        transition: all 0.3s ease-in-out;
        cursor: pointer;
        font-size: 24px;

        &:hover {
            color: var(--primary-color);
        }
    }
`;


const Footer = () => {
    return (
        <>
            <Container>
                <FooterComponentContainerLogo>
                    <LogoContainer to="/" >
                        <img src={CognideX} alt="CognideX" />
                        <p>CognideX</p>
                    </LogoContainer>
                    <FooterInner>
                        <h2>
                            Follow Us:
                        </h2>
                        <FooterIconContainer>
                            <a href="https://x.com/0xcognidexai" target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faXTwitter} size="2x" />
                            </a>
                            <a href="https://t.me/CognideX" target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faTelegramPlane} size="2x" />
                            </a>
                        </FooterIconContainer>
                    </FooterInner>
                </FooterComponentContainerLogo>
                <FooterComponentContainer>
                    <FootComponent>
                        <FooterInner>
                            <h2>
                                Features
                            </h2>
                            <FooterLink to="/DataPool">
                                Data Pool
                            </FooterLink>
                            <FooterLink to="/D-GPT">
                                D-GPT
                            </FooterLink>
                        </FooterInner>
                    </FootComponent>
                    <FootComponent>
                        <FooterInner>
                            <h2>
                                Documentations
                            </h2>
                            <FooterLink to="https://docs.cognidex.ai" target="_blank" rel="noreferrer">
                                Official Docs
                            </FooterLink>
                            <FooterLink to="https://docs.cognidex.ai/category/white-paper" target="_blank" rel="noreferrer">
                                White Paper
                            </FooterLink>
                            <FooterLink to="https://docs.cognidex.ai/Data-Protection/data-masking" target="_blank" rel="noreferrer">
                                Data Protection
                            </FooterLink>
                        </FooterInner>
                    </FootComponent>
                    <FootComponent>
                        <FooterInner>
                            <h2>
                                Contact Us
                            </h2>
                            <FooterLink>
                                Our Team
                            </FooterLink>
                            <FooterLink to="mailto:info@cognidex.ai" target="_blank" rel="noreferrer">
                                info@cognidex.ai
                            </FooterLink>
                            <FooterLink to="https://forms.office.com/r/aGxEVhcBiG" target="_blank" rel="noreferrer">
                                Feedback
                            </FooterLink>
                        </FooterInner>
                    </FootComponent>
                </FooterComponentContainer>
            </Container>
        </>
    )
}

export default Footer
