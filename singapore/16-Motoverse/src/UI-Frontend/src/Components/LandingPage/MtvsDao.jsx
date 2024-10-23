import { Link } from "react-router-dom";

const MtvsDao = () => {
  return (
    <section className="self-stretch w-full h-auto px-6 md:px-12 py-[50px] flex gap-[10px] bg-[#004EB7]">
      <div className="block sm:flex items-center justify-center sm:justify-between gap-[60px] ">
        <img
          className="w-[300px] sm:w-[280px] h-auto"
          loading="lazy"
          alt=""
          src="/images/MotoverseDAO.svg"
        />

        <div className="flex flex-col items-start gap-[16px] w-full font-karla">
          <h1 className="font-[700] sm:font-[500] leading-[97%] text-[25px] sm:text-[30px]  text-[#F1F7F5]">
            {`Join Motoverse's`}
            <span className="block">DAO Partnership</span>
          </h1>
          <p className="self-stretch font-[400] min-[2000px]:text-xl text-[18px] leading-[130%] text-[#F1F7F5] font-karla">
            As a verifier, securely receive your service fee. As a seller, start
            selling your car your way—promote globally, sell quickly. We manage
            paperwork and delivery.
          </p>

          <Link
            to="/welcome"
            className="bg-[#4E7FFF] rounded-full py-[5px] px-[15px] text-[12px] text-[#FFF] font-[400] leading-normal font-manrope items-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MtvsDao;
