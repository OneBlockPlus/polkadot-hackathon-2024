const Tech = () => {
  return (
    <section className="self-stretch w-full h-auto bg-[#ECEDFF] bg-[url(/images/Group30.svg)] bg-contain bg-no-repeat bg-cover flex flex-col items-start px-6 md:px-12 py-[50px] box-border gap-[10px] max-w-full font-manrope">
      <div className="self-stretch flex flex-col gap-[60px] items-start w-full ">
        <h1 className="self-stretch w-full min-[2000px]:text-4xl font-karla text-[27px] tracking-[-0.5px] md:tracking-[-0.78px] leading-[120%] font-bold text-[#003855]">
          Our Technology
          <p className="text-[#4E7FFF]">
            Unleashing the potential of
            <span className="block "> Web3 in the car industry</span>
          </p>
        </h1>

        <div className="sm:grid grid-cols-2 gap-4 items-stretch h-full w-full max-w-full">
          <div className="sm:p-[16px] py-[16px] px-0 min-w-[280px] flex flex-col items-start sm:gap-[10px] flex-1 sm:min-w-[460px] rounded-[12px] h-fit md:min-w-[unset]">
            <img
              src="/images/tansi.svg"
              alt=""
              loading="lazy"
              className="sm:w-[144px] sm:h-[149px] w-[112px] h-[112px]"
            />
            <div className="self-stretch w-full flex flex-col gap-[8px] sm:gap-[16px] pr-[20px] pb-[16px] items-start h-[157px] sm:h-[193px]">
              <h1 className="w-full h-auto text-[#004EB7] font-karla font-bold sm:tracking-[-0.78] sm:leading-[120%] text-[20px] min-[2000px]:text-4xl">
                Polkadot
              </h1>
              <p className="w-full font-[400] min-[2000px]:text-xl font-karla leading-[130%] sm:text-[16px] text-[#003855] max-w-[500px]">{`We harness Polkadot's groundbreaking technology to fortify our appchain, ensuring that your data, and your vehicle's history, are shielded by next-generation security. Sleep easy knowing your automotive assets are protected.`}</p>
            </div>
          </div>

          <div className="sm:p-[16px] py-[16px] px-0 min-w-[280px] flex flex-col items-start sm:gap-[10px] flex-1 sm:min-w-[460px] rounded-[12px] h-fit md:min-w-[unset]">
            <img
              src="/images/polkadot.svg"
              alt=""
              loading="lazy"
              className="sm:w-[144px] sm:h-[149px] h-[112px]"
            />
            <div className="self-stretch w-full flex flex-col gap-[8px] sm:gap-[16px] pr-[20px] pb-[16px] items-start h-[157px] sm:h-[193px]">
              <h1 className="w-full h-auto min-[2000px]:text-4xl text-[#004EB7] font-karla font-bold sm:tracking-[-0.78] sm:leading-[120%] text-[20px]">
                Tanssi Network
              </h1>
              <p className="w-full font-[400] min-[2000px]:text-xl font-karla leading-[130%] sm:text-[16px] text-[#003855]">{`Tanssi our powerful connector links us directly to Polkadot's ecosystem, allowing us to streamline operations and concentrate on delivering exceptional user experiences.`}</p>
            </div>
          </div>

          <div className="p-[16px] px-0 min-w-[280px] flex flex-col items-start sm:gap-[10px] flex-1 sm:min-w-[460px] rounded-[12px] h-fit md:min-w-[unset]">
            <img
              src="/images/uniquenetwork.svg"
              alt=""
              loading="lazy"
              className="sm:w-[144px] sm:h-[149px] h-[112px]"
            />
            <div className="self-stretch  w-full flex flex-col gap-[8px] sm:gap-[16px] pr-[20px] pb-[16px] items-start h-[157px] sm:h-[193px]">
              <h1 className="w-full h-auto min-[2000px]:text-4xl text-[#004EB7] font-karla font-bold sm:tracking-[-0.78] sm:leading-[120%] text-[20px]">
                Kilt
              </h1>
              <p className="w-full font-[400] min-[2000px]:text-xl font-karla leading-[130%] sm:text-[16px] text-[#003855]">{`Our platform utilizes Kilt to provide you with decetralized identities, putting the power of privacy and verification back into your hands for buyers, seller, and verifier.`}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tech;
