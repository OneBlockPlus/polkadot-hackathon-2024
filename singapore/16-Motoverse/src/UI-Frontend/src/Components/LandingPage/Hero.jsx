const Hero = () => {
  return (
    <section className="Hero w-full md:aspect-[721/512] min-[2000px]:bg-cover min-[2000px]:p-[8vw] min-[2000px]:aspect-[16/6] md:h-auto h-[513px] max-h-full bg-[url(/images/Hero.jpg)] bg-no-repeat bg-cover bg-center grid grid-cols-1 md:grid-cols-2 px-6 md:px-12 pt-[31px] sm:pt-[85px] box-border font-karla ">
      <div className="self-stretch flex flex-col items-start gap-[20px] max-w-full">
        <h1 className="self-stretch min-[2000px]:text-[4em] relative w-full font-[inherit] sm:text-[40px] text-[30px] text-[#BEC6FF] font-bold sm:font-[500] tracking-[-0.58px] sm:tracking-[-1px] leading-[120%] sm:leading-[100%]">
          Explore a World of
          <span className="block"> Cars Safely on the </span>
          <span className="block">Blockchain </span>
        </h1>
        <p className="w-full min-[2000px]:text-2xl self-stretch font-karla leading-normal sm:leading-[130%] text-[#FFF] font-[400] text-base sm:text-[18px]">
          Dive into a decentralized shopping experience where every transaction
          is transparent, every car has a story, and every deal is sealed with
          trust.
        </p>

        {/* <div className="self-stretch flex flex-row flex-wrap items-center justify-start mt-[40px] gap-[20px] max-w-full text-base text-green-0 font-manrope">
              <b className="relative inline-block min-w-[62px]">Filter by</b>
              <div className="flex-1 shadow-[0px_4px_16px_rgba(0,_0,_0,_0.05)] rounded-5 bg-green-0 flex flex-row items-center justify-between py-2.5 px-s box-border min-w-[270px] max-w-full gap-[20px] text-black font-karla">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="search by brand, model, year, etc..."
                    className="h-full w-full outline-none border-none"
                    name="search"
                    id=""
                  />
                </div>
                <img
                  className="cursor-pointer h-6 w-6 relative overflow-hidden shrink-0"
                  alt=""
                  src="/images/Vector.svg"
                  loading="lazy"
                />
              </div>
            </div> */}
      </div>
    </section>
  );
};

export default Hero;
