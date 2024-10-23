import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieAnimationProps {
  animationData: object;
  speed?: number;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({ animationData, speed = 1 }) => {
  const container = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (container.current) {
      animationRef.current = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });

      animationRef.current.setSpeed(speed);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [animationData, speed]);

  return <div className="sm:w-[6.25rem] w-20 sm:h-[6.25rem] h-20" ref={container}></div>;
};

export default LottieAnimation;