import { useState, useCallback } from "react";
import Frame from "./Login";
import PortalPopup from "./PortalPopup";

const FrameComponent1 = () => {
  const [isFrameOpen, setFrameOpen] = useState(false);

  const openFrame = useCallback(() => {
    setFrameOpen(true);
  }, []);

  const closeFrame = useCallback(() => {
    setFrameOpen(false);
  }, []);

  return (
    <>
      <div className="self-stretch flex flex-col items-start justify-start gap-[43px] max-w-full text-center text-xl text-black font-text mq750:gap-[21px]">
        <div className="w-[1189px] flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
          <div className="w-[585px] rounded-full bg-gainsboro flex flex-row items-start justify-start gap-[56px] max-w-full">
            <div className="self-stretch w-[585px] relative rounded-4xl bg-gainsboro hidden max-w-full" />
            <div className="h-3 w-[195px] relative rounded-full bg-[#4D28FF] bg-100% z-[1]" />
          </div>
        </div>
      </div>
      {isFrameOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeFrame}
        >
          <Frame onClose={closeFrame} />
        </PortalPopup>
      )}
    </>
  );
};

export default FrameComponent1;
