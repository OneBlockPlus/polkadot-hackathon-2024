const UnlockFutureCard = ({ img, title, description }) => {
  return (
    <div className="flex flex-col h-fit items-center rounded-[12px] w-[30%] min-w-[280px] md:min-w-[unset] ">
      <img
        src={img}
        alt=""
        className="self-stretch w-full aspect-[4/3] rounded-lg object-cover "
      />
      <div className="self-stretch flex flex-col items-start gap-[16px] py-[16px] sm:py-[16px] px-0 sm:px-[16px] ">
        <h1 className="font-karla leading-[130%] sm:leading-normal sm:tracking-[-0.5px] font-bold text-[20px] min-[2000px]:text-4xl text-[#003855]">
          {title}
        </h1>
        <p className="self-stretch font-karla text-base sm:text-[18px] min-[2000px]:text-xl font-400 leading-normal sm:leading-[130%] text-[#003855]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default UnlockFutureCard;
