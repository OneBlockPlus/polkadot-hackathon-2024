const HowItWorks = () => {
  return (
    <section className="self-stretch w-full h-auto min-[2000px]:h-screen relative items-start px-[50px] sm:px-[80px] py-[50px] flex justify-center bg-[#ECEDFF]">
      <div className="flex-1 self-stretch flex flex-col gap-[45px] items-start w-full">
        <h1 className="w-full min-[2000px]:text-4xl font-karla text-[27px] tracking-[-0.5px] md:tracking-[-0.78px] leading-[120%] font-bold text-[#003855]">
          How it Works
        </h1> 
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex items-center self-stretch flex-1 border-l border-[#4E7FFF] sm:gap-[25px]">
            <div className="bg-[#fff] rounded-full relative right-5 sm:right-6 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] p-[6px] sm:p-[10px] items-center justify-center">
              <h1 className="w-full min-[2000px]:text-xl font-karla sm:font-bold leading-[170%] tracking-[-0.5px] text-[#003855] sm:text-[18px] text-base text-center">
                01
              </h1>
            </div>

            <div className="block sm:flex items-center justify-center gap-[35px] py-[16px] sm:py-0">
              <div>
                <img
                  src="/images/Pictogram-1.png"
                  alt=""
                  className="w-[200px] sm:w-[230px] h-auto"
                />
              </div>

              <div>
                <h1 className="sm:w-full max-w-[440px] w-[200px] min-w-[240px] font-karla text-[18px] sm:text-[20px] font-bold leading-[130%] min-[2000px]:text-xl sm:leading-[120%] text-start tracking-[-0.78px] sm:text-[#004EB7] text-[#003855] self-stretch">
                  Vehicle Valuation & Verification
                  <p className="text-base text-[#003855] font-[400] leading-normal self-stretch pt-[16px]">
                    Upload your car to the marketplace by submitting your
                    vehicle for a quick verification covering legal, mechanical,
                    and aesthetic aspects. Set your price based on our suggested
                    valuation or choose your own.
                  </p>
                </h1>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center self-stretch flex-1 border-l border-[#4E7FFF] sm:gap-[25px]">
            <div className="bg-[#fff] rounded-full relative right-5 sm:right-6 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] p-[6px] sm:p-[10px] items-center justify-center">
              <h1 className="w-full min-[2000px]:text-xl font-karla sm:font-bold leading-[170%] tracking-[-0.5px] text-[#003855] sm:text-[18px] text-base text-center">
                02
              </h1>
            </div>

            <div className="block sm:flex items-center justify-center gap-[35px] py-[16px] sm:py-0">
              <div>
                <img
                  src="/images/Pictogram-2.png"
                  alt=""
                  className="w-[200px] sm:w-[230px] h-auto"
                />
              </div>

              <div>
                <h1 className="sm:w-full min-[2000px]:text-xl max-w-[440px] w-[200px] min-w-[240px] font-karla text-[18px] sm:text-[20px] font-bold leading-[130%] sm:leading-[120%] text-start tracking-[-0.78px] sm:text-[#004EB7] text-[#003855] self-stretch">
                  Escrow Creation
                  <p className="text-base text-[#003855] font-[400] leading-normal self-stretch pt-[16px]">
                    Buyers show interest through a secure escrow smart contract,
                    ensuring safe transaction terms.
                  </p>
                </h1>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center self-stretch flex-1 border-l border-[#4E7FFF] sm:gap-[25px]">
            <div className="bg-[#fff] rounded-full relative right-5 sm:right-6 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] p-[6px] sm:p-[10px] items-center justify-center">
              <h1 className="w-full min-[2000px]:text-xl font-karla sm:font-bold leading-[170%] tracking-[-0.5px] text-[#003855] sm:text-[18px] text-base text-center">
                03
              </h1>
            </div>

            <div className="block sm:flex items-center justify-center gap-[35px] py-[16px] sm:py-0">
              <div>
                <img
                  src="/images/Pictogram-3.png"
                  alt=""
                  className="w-[200px] sm:w-[230px] h-auto"
                />
              </div>

              <div>
                <h1 className="sm:w-full min-[2000px]:text-xl max-w-[440px] w-[200px] min-w-[240px] font-karla text-[18px] sm:text-[20px] font-bold leading-[130%] sm:leading-[120%] text-start tracking-[-0.78px] sm:text-[#004EB7] text-[#003855] self-stretch">
                  Close & Collect
                  <p className="text-base text-[#003855] font-[400] leading-normal self-stretch pt-[16px]">
                    {`We handle the paperwork and delivery. Once everything's finalized, receive your payment seamlessly and securely.`}
                  </p>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
