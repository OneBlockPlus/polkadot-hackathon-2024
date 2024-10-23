import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import animationData from "@/assets/lottie/animation.json";

export const Generating = ({
  generatingLabel = "Unlocking With ZK Proof.....",
}: {
  generatingLabel?: string;
}) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lottieContainerRef.current) {
      const animation = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData,
      });
      return () => {
        animation.destroy();
      };
    }
  }, []);

  return (
    <div className="relative bg-white rounded flex flex-col flex-nowrap items-center justify-center overflow-hidden shadow-lg w-popup-width h-popup-height">
      <div className="mt-14 rounded-xl flex flex-col overflow-auto w-full h-full">
        <div>
          <div ref={lottieContainerRef} />
          <div className="text-muted-foreground text-center text-base">
            {generatingLabel}
          </div>
        </div>
      </div>
    </div>
  );
};
