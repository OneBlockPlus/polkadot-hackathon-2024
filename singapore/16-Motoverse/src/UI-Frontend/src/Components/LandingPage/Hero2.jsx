import UnlockFutureCard from "./UnlockFutureCard";

const Hero2 = () => {
  return (
      <section className="self-stretch bg-[url(/images/Frame19.svg)] bg-no-repeat bg-cover flex flex-col items-start px-6 md:px-12 py-[50px] box-border gap-[10px] w-full font-manrope ">
        <div className="self-stretch flex flex-col gap-[60px] items-start w-full ">
          <h1 className="w-full min-[2000px]:text-4xl font-karla text-[27px] tracking-[-0.5px] md:tracking-[-0.78px] leading-[120%] font-bold">
            <p className="">{`Unlock the Future of Car Trading: `}</p>
            <p className=" text-[#4E7FFF]">
              Secure, Transparent, Decentralized
            </p>
          </h1>
          <div className="hide-scroll-bar flex gap-4 xl:justify-between items-stretch h-full overflow-x-auto scrollbar-none w-full max-w-full">
            <UnlockFutureCard
              img={"/images/illustration.svg"}
              title={"Unrivaled Security"}
              description={
                " Enjoy peace of mind with blockchain-secured purchases, ensuring your investment is protected at every step."
              }
            />
            <div className="h-auto border-r border-[#BEC6FF] hidden md:block"></div>
            <UnlockFutureCard
              img={"/images/illustration-1.svg"}
              title={"Transparent Insights"}
              description={
                " Gain access to detailed car histories, authenticity, and peer-to-peer verification, providing transparent insights."
              }
            />
            <div className="h-auto border-r border-[#BEC6FF] hidden md:block"></div>
            <UnlockFutureCard
              img={"/images/illustration-2.svg"}
              title={"Empowering Innovation"}
              description={
                "Be at the forefront of a new era in car purchasing, that blockchain technology pioneers trust and transparency like never before"
              }
            />
            {/* card ends */}
          </div>
        </div>
      </section>
  );
};

export default Hero2;
