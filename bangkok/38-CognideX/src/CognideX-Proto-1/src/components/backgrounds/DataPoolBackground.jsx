import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const GradientContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const GradientCircle = styled.div`
    position: absolute;
    top: 50%; /* Center vertically */
    left: 50%; /* Center horizontally */
    width: ${(props) => props.$size}px;
    height: ${(props) => props.$size}px;
    background: ${(props) => (props.$invert ? 'radial-gradient(circle, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 45%, rgba(255, 255, 255, 0.9) 100%)' : 'radial-gradient(circle, white 0%, rgba(0, 0, 0, 0) 70%)')};
    transform: translate(-50%, -50%);
    border-radius: 50%;
    transition: width 0.5s ease-out, height 0.5s ease-out;
`;

const ChildrenContainer = styled.div`
    position: relative;
    z-index: 1;
    width: 100vw;
    height: auto;
    min-height: 200vh;
`;

const DataPoolBackground = ({ children }) => {
    const [gradientSize, setGradientSize] = useState(0); // Initial size in pixels
    const [invertGradient, setInvertGradient] = useState(false);

    useEffect(() => {
        const targetBDP = document.getElementById('buy-data-pool');
        const targetCDP = document.getElementById('contribute-data-pool');

        const targets = [targetBDP, targetCDP].filter(Boolean);
        if (targets.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };

        let isBuyDataPoolIntersecting = false;
        let isContributeDataPoolIntersecting = false;

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                const isIntersecting = entry.isIntersecting;

                if (entry.target.id === 'buy-data-pool') {
                    isBuyDataPoolIntersecting = isIntersecting;
                } else if (entry.target.id === 'contribute-data-pool') {
                    isContributeDataPoolIntersecting = isIntersecting;
                }

                // Update gradient size based on which element is intersecting
                if (isBuyDataPoolIntersecting) {
                    // Expand the gradient
                    setInvertGradient(false);
                    setGradientSize(3000); // Adjust to desired expanded size
                } else if (isContributeDataPoolIntersecting) {
                    // Set gradient to a medium size
                    setInvertGradient(true);
                    setGradientSize(1900);
                } else {
                    // Reset gradient size to default
                    setGradientSize(0);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        targets.forEach((target) => observer.observe(target));

        // Cleanup on component unmount
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div>
            <GradientContainer>
                <GradientCircle $size={gradientSize} $invert={invertGradient} />
            </GradientContainer>
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
        </div>
    );
};

export default DataPoolBackground;
