import { useState, useCallback } from "react";
import Frame from "./Login";
import PortalPopup from "./PortalPopup";
import { useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import Navbar from "./LandingPage/Navbar";

const Password = () => {
  const [isFrameOpen, setFrameOpen] = useState(false);
  const navigate = useNavigate();

  const closeFrame = useCallback(() => {
    setFrameOpen(false);
  }, []);

  const onFrameContainerClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const onFrameContainerClick1 = useCallback(() => {
    navigate("/Home");
  }, [navigate]);

  return (
    <>
      <div className="w-[1440px] h-[1024px] max-w-full flex flex-col bg-[#F3F3F6] bg-100%">
        <Navbar/>
        <div className="w-[1200px] self-stretch flex flex-col items-center justify-center pt-[43px] max-w-full font-manrope text-center text-20xl text-green-900 font-text mq675:gap-[21px] bg-[#F3F3F6]">
          <div className="w-[585] h-[351px] flex flex-row items-center justify-center pt-[43px] px-5 box-border max-w-full">
            <div className="w-[585px] flex flex-col items-start justify-start pt-0 px-0 pb-10 box-border gap-[60px] max-w-full mq675:gap-[30px]">
              {/* progress line starts */}
              <div className="self-stretch h-3 rounded-full bg-gainsboro flex flex-row items-start justify-start gap-[43px] max-w-full mq450:gap-[28px]">
                <div className="self-stretch w-[585px] relative rounded-full bg-gainsboro hidden max-w-full" />
                <div className="self-stretch w-[390px] relative rounded-full bg-[#4D28FF] bg-100% max-w-full z-[1]" />
              </div>
              {/* progress line ends */}

              <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
                <div className="self-stretch flex flex-row items-start justify-center py-0 px-5">
                  <h1 className="m-0 relative text-inherit leading-[47px] font-bold font-inherit mq450:text-4xl mq450:leading-[28px] mq750:text-12xl mq750:leading-[37px]">
                    Enter your Pasword
                  </h1>
                </div>
                <div className="self-stretch h-11 relative text-base inline-block">
                  <p className="m-0">{`You need a secure password for every Identity. `}</p>
                  <p className="m-0">
                    A strong password looks like this: House 12! small DOGS
                  </p>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-center justify-start max-w-full text-left text-base mq675:gap-[20px]">
                <div className="self-stretch flex flex-col items-start justify-start gap-[6px] max-w-full">
                  <div className="w-[335px] flex flex-col items-start justify-start max-w-full">
                    <b className="self-stretch relative">Password</b>
                  </div>
                  <div className="self-stretch w-[585px] rounded-xl bg-[#E7E7F1] bg-100% flex flex-row flex-wrap items-start justify-start py-3 pr-6 pl-3 box-border gap-[10px] max-w-full text-grey-500">
                    <Form className="flex flex-row items-center justify-end w-[585px]">
                      <div className="relative w-full">
                        <input
                          type="password"
                          placeholder="Input password"
                          className=" whitespace-pre-wrap w-full outline-none border-none bg-transparent"
                          name="password"
                          id=""
                        />
                      </div>
                      <div className="">
                        <img
                          className="cursor-pointer h-6 w-6 relative overflow-hidden shrink-0"
                          alt=""
                          src="/images/Eye.svg"
                          loading="lazy"
                        />
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="bg-[#F3F3F6] self-stretch flex flex-row items-start justify-between mt-[466px] px-[124px] py-[20px] gap-[20px] text-left text-base text-green-900 font-text border-t-[1px] border-solid border-green-200 mq450:pl-5 mq450:pr-5 mq450:box-border mq675:flex-wrap mq675:justify-center mq750:pl-[62px] mq750:pr-[62px] mq750:box-border">
            <div
              className="rounded-full  flex flex-row items-start justify-start py-2.5 px-[54.5px] cursor-pointer border-[1px] border-solid border-[#3D6470]  whitespace-nowrap"
              onClick={onFrameContainerClick1}
            >
              <Link to="/Home" className="" target="blanc">
                <p className="relative inline-block min-w-[52px]">Cancel</p>
              </Link>
            </div>

            <div
              className="rounded-full bg-green-100 flex flex-row items-start justify-start py-2.5 px-[54.5px] cursor-pointer border-[1px] border-solid border-[#3D6470] whitespace-nowrap"
              onClick={onFrameContainerClick}
            >
              <Link to="/dashboard" className="" target="blanc">
                <p className="relative inline-block min-w-[51px]">Unlock</p>
              </Link>
            </div>
          </footer>
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

export default Password;
