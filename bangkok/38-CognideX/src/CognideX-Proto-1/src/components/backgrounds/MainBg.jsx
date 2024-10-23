import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const height = window.innerHeight;
// Keyframes for upward animation
const moveUpwards = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(${height}px); }
`;

// Styled component for the animated character
const AnimatedChar = styled.div`
    position: absolute;
    bottom: ${(props) => props.left}%;
    left: 0;
    color: white;
    font-size: 20px;
    animation: ${moveUpwards} ${(props) => props.duration}s linear infinite;
`;

const BgContainer = styled.div`
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
`;

const ChildrenContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const MainBg = ({ children }) => {
    const [chars, setChars] = useState([]);

    const getRandomChar = () => {
        // write in arabic, korean, chinese, japanese, etc.
        const characters = '01';
        return characters.charAt(Math.floor(Math.random() * characters.length));
    };

    const addChar = useCallback(() => {
        const charId = Math.random().toString(36).substr(2, 9); // Unique ID
        const duration = 5 + Math.random() * 5; // Duration in seconds
        const expiry = Date.now() + duration * 1000; // Expiry time in milliseconds

        const newChar = {
            id: charId,
            char: getRandomChar(),
            left: Math.random() * 100,
            duration: duration,
            expiry: expiry
        };

        setChars(prevChars => [...prevChars, newChar]);
    }, []);

    // Cleanup function to remove expired characters
    const cleanupChars = useCallback(() => {
        const currentTime = Date.now();
        setChars(prevChars => prevChars.filter(char => char.expiry > currentTime));
    }, []);

    useEffect(() => {
        const charInterval = setInterval(addChar, 200);
        const cleanupInterval = setInterval(cleanupChars, 1000); // Cleanup every second

        return () => {
            clearInterval(charInterval);
            clearInterval(cleanupInterval);
        };
    }, [addChar, cleanupChars]);

    return (
        <BgContainer>
            {chars.map((item) => (
                <AnimatedChar key={item.id} left={item.left} duration={item.duration}>
                    {item.char}
                </AnimatedChar>
            ))}
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
        </BgContainer>
    );
};

export default MainBg;