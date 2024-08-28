import TesimonialsCard from "./TesimonialsCard";

const Testmonials = () => {
  return (
    <section className="hidden self-stretch w-full relative py-[50px] sm:flex flex-col bg-[#ECEDFF]">
      <div className="self-stretch flex flex-col gap-[30px] items-center">
        <h1 className="w-full font-karla px-6 md:px-12 text-[27px] tracking-[-0.5px] md:tracking-[-0.78px] leading-[120%] font-bold text-[#003855]">
          What people are saying
        </h1>
        <div className="overflow-x-scroll hide-scroll-bar scrollbar-none w-full h-fit flex flex-row items-start justify-start gap-[18px]">
          <TesimonialsCard
            text={
              "Selling my car used to be a headache, but not anymore. The verification checks reassured me, and handling the paperwork was a breeze with their help."
            }
            name={"Ana, Peru"}
          />
          <TesimonialsCard
            text={`I was skeptical about selling my car online, but this platform
              made everything so transparent and easy. The verification process
              gave me confidence, and I actually got a better price than I
              expected!`}
            name={"Maria, Brazil"}
          />
          <TesimonialsCard
            text={`The step-by-step guidance was perfect. I uploaded my car, set the
              price, and the escrow service made the transaction completely
              secure. Highly recommend`}
            name={"Carlos, Argentina"}
          />
          <TesimonialsCard
            text={`From verifying my car to finalizing the sale, every step was clear
              and straightforward. I felt supported and safe throughout the
              process.`}
            name={"Sofia, Chile"}
          />
          <TesimonialsCard
            text={` Incredible service! The valuation was fair, and I loved how I
              could track each stage of the sale. The escrow system brought
              peace of mind to both me and the buyer.`}
            name={"Juan, Colombia"}
          />
          <TesimonialsCard
            text={`I was skeptical about selling my car online, but this platform
              made everything so transparent and easy. The verification process
              gave me confidence, and I actually got a better price than I
              expected!`}
            name={"Maria, Brazil"}
          />
          <TesimonialsCard
            text={`From verifying my car to finalizing the sale, every step was clear
              and straightforward. I felt supported and safe throughout the
              process.`}
            name={"Sofia, Chile"}
          />
        </div>

        <div className="overflow-x-scroll hide-scroll-bar scrollbar-none w-full h-fit flex flex-row items-start justify-start gap-[18px]">
          <TesimonialsCard
            text={`Selling my car used to be a headache, but not anymore. The
              verification checks reassured me, and handling the paperwork was a
              breeze with their help.`}
            name={"Ana, Peru"}
          />
          <TesimonialsCard
            text={`This platform transformed the way I think about selling cars. It's efficient, secure, and transparent. Plus, the support team was there whenever I had questions.`}
            name={"Luis, Uruguay"}
          />

          <TesimonialsCard
            text={` Incredible service! The valuation was fair, and I loved how I
              could track each stage of the sale. The escrow system brought
              peace of mind to both me and the buyer.`}
            name={"Juan, Colombia"}
          />
          <TesimonialsCard
            text={` Incredible service! The valuation was fair, and I loved how I
              could track each stage of the sale. The escrow system brought
              peace of mind to both me and the buyer.`}
            name={"Juan, Colombia"}
          />

          <TesimonialsCard
            text={`This platform transformed the way I think about selling cars. It's efficient, secure, and transparent. Plus, the support team was there whenever I had questions.`}
            name={"Luis, Uruguay"}
          />
          <TesimonialsCard
            text={`Selling my car used to be a headache, but not anymore. The
              verification checks reassured me, and handling the paperwork was a
              breeze with their help.`}
            name={"Ana, Peru"}
          />
        </div>
      </div>
    </section>
  );
};

export default Testmonials;
