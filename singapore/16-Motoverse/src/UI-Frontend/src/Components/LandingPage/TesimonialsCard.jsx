const TesimonialsCard = ({ text, name }) => {
  return (
    <div className="self-stretch bg-[#FFF] flex  flex-col w-[320px] items-start justify-between gap-[10px] p-[16px] rounded-xl box-border shrink-0 overflow-hidden">
      <p className="font-karla text-base min-[2000px]:text-xl relative inline-block text-[#003855] font-[400] leading-normal w-[292px] ">
        {text}
      </p>
      <h1 className="text-[#004EB7] min-[2000px]:text-xl font-karla text-base font-[400] leading-normal">
        {name}
      </h1>
    </div>
  );
};

export default TesimonialsCard;
