const Team = () => {
  return (
    <section className="self-stretch w-full px-6 md:px-12 py-[50px] flex flex-col items-start bg-[#ECEDFF]">
      <div className="w-full sm:flex flex-1 sm:flex-col items-start gap-[60px]">
        <h1 className="self-stretch w-full font-karla min-[2000px]:text-4xl text-[27px] tracking-[-0.5px] md:tracking-[-0.78px] leading-[120%] font-bold text-[#003855] mb-[60px] sm:mb-[0px]">
          Meet the team
        </h1>

        <div className="w-full h-fit block sm:grid grid-cols-3 gap-[60px]">
          <div className="flex flex-col h-fit sm:gap-4 pb-[30px]">
            <div className="h-auto border-t border-[#BEC6FF] md:flex p-[8px] sm:p-0"></div>
            <h1 className="self-stretch flex flex-col gap-[8px] font-[700] font-karla sm:text-[#004EB7] text-[#003855] min-[2000px]:text-xl sm:text-[22px] text-[18px] sm:leading-[120%] leading-[130%] tracking-[-0.1px]">
              Mario Andrade
              <span className="font-[400] sm:font-[700] text-[#4E7FFF] sm:text-[18px] text-[16px] leading-normal tracking-[-0.5px]">
                Founder, Polkadot Dev
              </span>
            </h1>
          </div>

          {/* <div className="flex flex-col h-fit sm:gap-4 pb-[30px]">
            <div className="h-auto border-t border-[#BEC6FF] md:flex p-[8px] sm:p-0"></div>
            <h1 className="self-stretch flex flex-col gap-[8px] font-[700] font-karla sm:text-[#004EB7] text-[#003855] sm:text-[22px] min-[2000px]:text-xl text-[18px] sm:leading-[120%] leading-[130%] tracking-[-0.1px]">
              Nagra Rohit
              <span className="font-[400] sm:font-[700] text-[#4E7FFF] sm:text-[18px] text-[16px] leading-normal tracking-[-0.5px]">
                Smart Contract Developer
              </span>
            </h1>
          </div> */}

          <div className="flex flex-col h-fit sm:gap-4 pb-[30px]">
            <div className="h-auto border-t border-[#BEC6FF] md:flex p-[8px] sm:p-0"></div>
            <h1 className="self-stretch flex flex-col gap-[8px] font-[700] font-karla sm:text-[#004EB7] text-[#003855] sm:text-[22px] min-[2000px]:text-xl text-[18px] sm:leading-[120%] leading-[130%] tracking-[-0.1px]">
              Pat Sinma
              <span className="font-[400] sm:font-[700] text-[#4E7FFF] sm:text-[18px] text-[16px] leading-normal tracking-[-0.5px]">
                Product Designer
              </span>
            </h1>
          </div>


          <div className="flex flex-col h-fit sm:gap-4">
            <div className="h-auto border-t border-[#BEC6FF] md:flex p-[8px] sm:p-0"></div>
            <h1 className="self-stretch flex flex-col gap-[8px] font-[700] font-karla sm:text-[#004EB7] text-[#003855] sm:text-[22px] min-[2000px]:text-xl text-[18px] sm:leading-[120%] leading-[130%] tracking-[-0.1px]">
              Favour Chikezie
              <span className="font-[400] sm:font-[700] text-[#4E7FFF] sm:text-[18px] text-[16px] leading-normal tracking-[-0.5px]">
                Front-End Developer
              </span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
