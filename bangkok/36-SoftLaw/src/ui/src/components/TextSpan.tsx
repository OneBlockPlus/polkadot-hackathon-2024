"use client"
import { motion, useAnimationControls} from "framer-motion";
import React, { ReactNode } from "react";


interface TextSpanProps {
  children: ReactNode; // Definir el tipo de children
}

const TextSpan: React.FC<TextSpanProps> = ({ children }) => {
  const controls = useAnimationControls();
  

  const [isPlaying, setIsPlaying] = React.useState(false);

  const rubberBand = () => {
    controls.start({
      transform: [
        "scale3d(1, 1, 1)",
        "scale3d(1.4, .55, 1)",
        "scale3d(.75, 1.25, 1)",
        "scale3d(1.25, .85, 1)",
        "scale3d(.9, 1.05, 1)",
        "scale3d(1, 1, 1)",
      ],
    //   transition: {
    //     times: [0, .5, .9, 1.1, 1.5, 2 ]
    //   }
    })
    setIsPlaying(true)
  };

  return (
    <motion.span
      animate={controls}
      onMouseOver={() => {
        if (!isPlaying) rubberBand();
      }}
      onAnimationComplete= { () => setIsPlaying(false)}
    >
      {children}
    </motion.span>
  );
};

export { TextSpan };