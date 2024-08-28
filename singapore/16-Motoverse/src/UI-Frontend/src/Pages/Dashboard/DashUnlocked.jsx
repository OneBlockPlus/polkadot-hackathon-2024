// import DashNav from "./DashNav";
// import { Button } from "react-bootstrap";
import { DropdownMenu } from "@radix-ui/themes";
import { Link } from "react-router-dom";

const DashUnlocked = () => {
  return (
    <div className="w-[1440px] h-[1023px] max-w-full flex items-start bg-[#F3F3F6] bg-100%">
      <div className="w-[1440px] h-[1533px] max-w-full flex flex-col items-start flex-1">
        {/* <DashNav /> */}
        <div className="self-stretch w-[1440px] h-[1533px] max-w-full flex flex-col items-start gap-[40px] font-manrope ">
          <main className="self-stretch w-[1440px] max-w-full flex font-inherit items-start bg-[#F3F3F6] bg-100% box-border shrink-0 mq1050:pl-5 mq1050:pr-5 mq1050:box-border">
            {/* Sidebar starts */}
            <div className="self-stretch w-[240px] max-w-full box-border flex flex-col items-start bg-[#F3F3F6] bg-100% pt-12 pb-s gap-[40px] border-r-[1px] border-solid border-[#B2CBD3] mq1050:hidden">
              <div className="self-stretch w-[240px] h-[184px] max-w-full items-start flex flex-col px-s font-manrope text-base gap-[8px] bg-[#F3F3F6] bg-100%">
                <div className="self-stretch w-full bg-[#1F353C] bg-100% rounded-[41px] py-[8px] px-[20px] ">
                  <Link
                    to=""
                    className="self-stretch w-[160px] h-[24px] flex max-w-full items-center gap-[8px]"
                    target=""
                  >
                    <img
                      src="/images/house.svg"
                      className=""
                      loading="lazy"
                      alt="Logo"
                    />
                    <p className="text-inherit font-inherit leading-normal text-center text-[#ffffff]">
                      Overview
                    </p>
                  </Link>
                </div>

                <div className="self-stretch w-full bg-transparent bg-100% rounded-[41px] py-[8px] px-[20px]">
                  <Link
                    to="Garade"
                    className="self-stretch flex items-center w-[160px] h-[24px] max-w-full gap-[8px]  "
                    target=""
                  >
                    <img
                      src="/images/MyGarage.svg"
                      className="flex flex-col w-[24px] h-[24px]"
                      loading="lazy"
                      alt="Logo"
                    />
                    <p className="text-inherit font-inherit leading-normal text-center text-[#1F353C]">
                      My Garage
                    </p>
                  </Link>
                </div>
                <div className="self-stretch max-w-full bg-transparent bg-100% py-[8px] px-[20px] rounded-[41px] ">
                  <Link
                    to="Garade"
                    className="self-stretch w-[160px] h-[24px] max-w-full flex items-center gap-[8px] "
                    target=""
                  >
                    <img
                      src="/images/VerificationCheck.svg"
                      className="items-center justify-center flex flex-col w-[24px] h-[24px] max-w-full"
                      loading="lazy"
                      alt="Logo"
                    />
                    <p className="text-inherit font-inherit leading-normal text-center text-[#1F353C]">
                      Verification
                    </p>
                  </Link>
                </div>
                <div className="self-stretch max-w-full py-[8px] px-[20px] bg-transparent bg-100% rounded-[41px]">
                  <Link
                    to="Garade"
                    className="flex items-center w-[160px] h-[24px] max-w-full gap-[8px]  "
                    target=""
                  >
                    <img
                      src="/images/Settings.svg"
                      className="flex flex-col w-[24px] h-[24px]"
                      loading="lazy"
                      alt="Logo"
                    />
                    <p className="text-inherit font-inherit leading-normal text-center text-[#1F353C]">
                      Setting
                    </p>
                  </Link>
                </div>
              </div>
            </div>
            {/* Sidebar ends */}

            <section className="self-stretch w-[1200px] max-w-full p-[40px] flex flex-col items-start gap-[40px] flex-1 box-border font-manrope text-center bg-[#F3F3F6] bg-100%">
              {/* ----------------------------HERO-ONE Starts------------------------------ */}

              <div className="self-stretch w-[1120px] h-[236px] flex flex-col max-w-full items-start gap-[12px]">
                <div className="self-stretch w-[1120px] h-[120px] max-w-full flex flex-col items-start py-[4px] text-[#1F353C] font-manrope">
                  <h3 className="leading-[47px] text-20xl font-inherit font-bold mq1050:text-12xl mq1050:leading-[37px] mq450:text-4xl mq450:leading-[28px]">
                    Hello, John Smith
                  </h3>
                  <p className="self-stretch items-start text-left text-inherit max-w-full">
                    Welcome to your dashboard, this is your space to view and
                    manage all the moving parts of your account.
                  </p>
                  <p className="pt-[8px] text-[#4D28FF] gap-[12px] flex flex-row">
                    Tier 1: <span className="font-bold">Observer</span>
                    <img
                      src="/images/InfoIcon.svg"
                      loading="Lazy"
                      alt=""
                      className=""
                    />
                  </p>
                </div>

                {/* ---------------------------notice section STARTS--------------------- */}
                <div className="self-stretch w-[1120px] h-[115px] text-[#1F353C] flex flex-col items-center mt-[12px] rounded-2xl max-w-full font-inherit px-[20px] py-[20px] box-border bg-[#F0ECFF] bg-100%">
                  <div className="self-stretch w-[1080px] h-[275px] max-w-full">
                    {/* box shadow: 0px 5px 23.1px 0px */}

                    {/* -------------------notice Heading starts ---------------*/}
                    <div className="flex-1 flex items-start justify-between max-w-full lg:flex-wrap font-inherit ">
                      <p className="text-xl max-w-full font-inherit text-inherit leading-normal mq450:text-base">
                        Update your information to unlock other features
                      </p>
                      <p className="text-base relative inline-block min-w-[33px]">
                        hide
                      </p>
                    </div>
                    {/* --------------------notice Heading ends-------------------- */}

                    {/* -----------------------notice body content STARTS-------------- */}
                    <div className="self-stretch w-[1080px] flex flex-col items-end gap-[20px] max-w-full text-base text-[#4D28FF]">
                    
                      <div className="self-stretch flex flex-col items-center h-px border-t-[1px] border-solid border-[#D0DFE4] mt-[12px]" />

                      {/* ------------------------Tier 3 starts------------------- */}
                      <div className="self-stretch w-[1080px] h-[24px] font-inherit flex items-center justify-between max-w-full pb-[20px] box-border mq1050:flex-wrap ">
                        {/* ---------------------Left hand side -------------------*/}
                        <div className="max-w-full flex items-center">
                          <p className="flex gap-[12px]">
                            Tier 3:
                            <span className="font-bold text-center">
                              Vehicle Verifier
                            </span>
                          </p>
                        </div>
                        {/* -------------------Left hand side ends ----------------*/}

                        {/*----------------- Right hand side starts--------------- */}
                        <div className="w-[472px] h-[24px] flex items-center justify-end gap-[40px] max-w-full text-[#1F353C] mq750:flex-wrap mq750:gap-[10px]">
                          <div className="w-[408px] h-[15px] flex items-center gap-[20px] max-w-full relative">
                            <div className="w-[359px] h-[8px] flex flex-1 flex-col items-start gap-[56px] max-w-full rounded-full bg-[#FBFBFB]" />
                            <div className="absolute h-2 w-2 rounded-full bg-[#43C705] z-[1]" />
                            <h6 className="font-bold font-inherit text-inherit leading-normal">
                              0%
                            </h6>
                          </div>

                          <Link to="" className="">
                            <img
                              className="w-[24px] h-[24px] relative object-contain"
                              loading="lazy"
                              alt=""
                              src="/images/downArrowIcon.svg"
                            />
                          </Link>
                        </div>
                        {/* ----------------------Right hand side ends ---------------*/}
                      </div>
                      {/* ---------------------Tier 3 ends----------------------- */}
                    </div>
                    {/* -----------------------notice body content ENDS-------------- */}
                  </div>
                </div>
              </div>
              {/* ----------------------------HERO-ONE ENDS -------------------------------------------*/}

              {/* ----------------------------GARAGE STARTS -------------------------------------------*/}
              <div className="self-stretch w-[1120px] h-[547px] max-w-full flex flex-col p-s items-center gap-[20px] rounded-2xl bg-[#FFF] bg-100% font-manrope font-[400px] text-center  box-border">
                <div className="self-stretch w-[1080px] h-[90px] max-w-full flex flex-col items-start gap-[20px] ">
                  <div className="self-stretch w-[1080px] h-[30px] max-w-full flex items-start justify-between gap-[auto] mq750:flex-wrap">
                    <h3 className="font-inherit text-xl leading-normal text-[#1F353C]">
                      My Garage
                    </h3>
                    <div className="w-[248px] h-[30px] max-w-full flex items-center justify-end gap-[20px]">
                      <button className="w-[160px] h-[30px] max-w-full flex py-[4px] px-s items-center justify-center gap-[10px] rounded-full bg-[#3D6470]  bg-100%">
                        <h6 className="leading-normal text-base font-inherit text-[#fff]">
                          Add my car
                        </h6>
                      </button>
                      <div className="flex items-center justify-center gap-s">
                        <button className="flex flex-col items-center justify-center gap-[10px] p-[5px] box-border">
                          <img
                            className="shrink-0 w-6 h-6 max-w-full "
                            loading="lazy"
                            alt=""
                            src="/images/Menu.svg"
                          />
                        </button>

                        <button className="flex flex-col items-center justify-center gap-[10px] p-[5px] box-border">
                          <img
                            className="shrink-0 w-6 h-6 max-w-full "
                            loading="lazy"
                            alt=""
                            src="/images/hamburger.svg"
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="self-stretch flex items-center justify-center w-[1080px] h-[40px] max-w-full box-border gap-s pr-s">
                    <div className="w-[160px] h-[auto] flex flex-col items-start max-w-full gap-[10px] rounded-xl py-[8px] px-[12px] border-[1px] border-solid border-[#B2CBD3]">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <div className="self-stretch w-[136px] h-[24px] max-w-full flex gap-[10px] items-start justify-between">
                            <h6 className="h-[24px]  font-inherit max-w-full text-base text-[#1F353C]">
                              Status
                            </h6>
                            <div className="w-[24px] h-[24px] max-w-full flex flex-col items-center justify-center gap-[10px]">
                              <DropdownMenu.TriggerIcon />
                            </div>
                          </div>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="mt-[10px]">
                          <div className="bg-[#00000000]">Beginner</div>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </div>

                    <div className="w-[660px] h-[40px] max-w-full flex items-start flex-1 border-[1px] border-solid border-[#B2CBD3] rounded-xl gap-[10px] px-[12px] py-[8px]">
                      <input
                        type="text"
                        placeholder="Search by name"
                        className="h-[24px] flex-1 text-base text-[#1F353C] font-inherit whitespace-pre-wrap w-full outline-none border-none bg-transparent"
                        name="text"
                        id=""
                      />
                      <button onClick={open}>
                        <img src="/images/Eye.svg" alt="" />
                      </button>
                    </div>

                    <div className="w-[200px] h-[40px] max-w-full flex flex-col items-start gap-[10px] border-[1px] border-solid border-[#B2CBD3] rounded-xl px-[12px] py-[8px]">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <div className="self-stretch flex items-start w-[176px] h-[24px] max-w-full justify-between gap-[10px]">
                            <div>
                              <h6 className="h-[24px] flex-1  font-inherit max-w-full text-base text-[#1F353C]">
                                Recently received
                              </h6>
                            </div>
                            <div className="flex flex-col w-[24px] h-[24px] max-w-full justify-center items-center gap-[10px]">
                              <DropdownMenu.TriggerIcon />
                            </div>
                          </div>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content className="mt-[10px]">
                          <div className="text-[#00000]">Beginner</div>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </div>
                  </div>
                </div>

                {/* product cards starts */}
                <div className="self-stretch w-[1080px] h-[397px] max-w-full flex items-center justify-center gap-s box-border font-manrope">
                  {/* Left Card starts */}
                  <div className="card w-[347px] h-[397px]  max-w-full flex flex-col items-center flex-1 rounded-xl border-[1px] border-solid border-[#E7E7F1] bg-[#FFF] bg-100% shadow-[0px 5px 10.1px 0px rgba(0, 0, 0, 0.04)]">
                    <div className="w-[347px] h-[236px] max-w-full">
                      <img src="images/car1.svg" className="self-stretch w-[400px] h-[300px] max-w-full" loading="Lazy" alt="" />
                    </div>
                    <div className="self-stretch w-[347px] h-[161px] max-w-full items-start flex flex-col p-s gap-s font-manrope">
                      <div className="self-stretch w-[307px] h-[57px] max-w-full flex flex-col items-start gap-[8px]">
                        <div className="self-stretch h-[22px] max-w-full items-start flex gap-[8px]">
                          <div className="max-w-full flex items-start justify-start gap-[8px] flex-wrap">
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD] font-[700px]">2021</h3>
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD] font-[700px]">BMW -Series 8</h3>
                          </div>
                        </div>
                        <div className=" h-[27px] max-w-full flex items-start font-manrope justify-center gap-[4px]">
                          <h3 className="font-inherit leading-normal text-xl font-[400px] text-[#1F353C]">25,093 USDC</h3>
                          <h3 className="font-inherit leading-normal text-xl font-[400px] text-[#1F353C]">.</h3>
                          <h3 className="font-inherit leading-normal text-xl font-[400px] text-[#1F353C]">6k mi</h3>
                        </div>
                      </div>

                      {/* line starts */}
                      <div className="w-[307px] h-[1px] max-w-full bg-[#B2CBD3] bg-100%" />
                      {/* line ends */}

                      <div className="self-stretch w-[307px] h-[24px] max-w-full flex justify-between items-start font-manrope">
                        <div className="w-[85px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="/images/listing.svg" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]">Listing</h3>
                        </div>
                        <div className="w-[107px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="/images/OpenEye.svg" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]">1,324 view</h3>
                        </div>
                      </div>
                    </div>
                    <img src="" className="icon" alt="" />
                  </div>
                  {/* Left Card ends */}

                  {/* middle starts*/}
                  <div className="w-[188px] h-[42px] max-w-full ">
                    <h3 className="text-base font-inherit font-[400px] leading-normal text-[#4D28FF]">
                      Tier 2{" "}
                      <span className="text-[#7CA1AD]">
                        is required to unlock the feature
                      </span>{" "}
                    </h3>
                  </div>
                  {/* middle ends*/}

                  {/* right card starts */}
                  <div className="card w-[426px] h-[397px] max-w-full flex flex-col items-center flex-1 rounded-xl border-[1px] border-solid border-[#E7E7F1] bg-[#FFF] bg-100% shadow-[0px 5px 10.1px 0px rgba(0, 0, 0, 0.04)]">
                    <div className="self-stretch h-[236px] max-w-full">
                      <img src="" className="shrink-0" loading="Lazy" alt="" />
                    </div>
                    <div className="self-stretch w-[426px] h-[161px] max-w-full items-start flex flex-col p-s ">
                      <div className="self-stretch w-[386px] h-[57px] max-w-full flex flex-col items-start gap-[8px]">
                        <div className="self-stretch w-[386px] h-[22px] max-w-full items-start gap-[8px]">
                          <div className="w-[160px] h-[22px] max-w-full flex items-start justify-start gap-[8px] flex-wrap">
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD font-[700px]"></h3>
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD font-[700px]"></h3>
                          </div>
                        </div>
                        <div className="w-[192px] h-[27px] max-w-full flex items-start  justify-center gap-[4px]">
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                        </div>
                      </div>

                      {/* line starts */}
                      <div className="w-[386px] h-[1px] max-w-full bg-[#B2CBD3] bg-100%" />
                      {/* line ends */}

                      <div className="self-stretch w-[386px] h-[24px] max-w-full flex justify-between items-start font-manrope">
                        <div className="w-[85px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]"></h3>
                        </div>
                        <div className="w-[107px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]"></h3>
                        </div>
                      </div>
                    </div>
                    <img src="" className="icon" alt="" />
                  </div>
                  {/* right card starts */}
                </div>

                  {/* next section */}
                <div className="">
                  {/* Left Card starts */}
                  {/* <div className="card w-[426px] h-[397px] max-w-full flex flex-col items-center flex-1 rounded-xl border-[1px] border-solid border-[#E7E7F1] bg-[#FFF] bg-100% shadow-[0px 5px 10.1px 0px rgba(0, 0, 0, 0.04)]">
                    <div className="self-stretch h-[236px] max-w-full">
                      <img src="" className="shrink-0" loading="Lazy" alt="" />
                    </div>
                    <div className="self-stretch w-[426px] h-[161px] max-w-full items-start flex flex-col p-s ">
                      <div className="self-stretch w-[386px] h-[57px] max-w-full flex flex-col items-start gap-[8px]">
                        <div className="self-stretch w-[386px] h-[22px] max-w-full items-start gap-[8px]">
                          <div className="w-[160px] h-[22px] max-w-full flex items-start justify-start gap-[8px] flex-wrap">
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD font-[700px]"></h3>
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD font-[700px]"></h3>
                          </div>
                        </div>
                        <div className="w-[192px] h-[27px] max-w-full flex items-start  justify-center gap-[4px]">
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                        </div>
                      </div>

                  
                      <div className="w-[386px] h-[1px] max-w-full bg-[#B2CBD3] bg-100%" />
                     

                      <div className="self-stretch w-[386px] h-[24px] max-w-full flex justify-between items-start font-manrope">
                        <div className="w-[85px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]"></h3>
                        </div>
                        <div className="w-[107px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]"></h3>
                        </div>
                      </div>
                    </div>
                    <img src="" className="icon" alt="" />
                  </div> */}
                  {/* Left Card ends */}

                  {/* middle starts*/}
                  {/* <div className="w-[188px] h-[42px] max-w-full "></div> */}
                  {/* middle ends*/}

                  {/* right card starts */}
                  {/* <div className="card w-[426px] h-[397px] max-w-full flex flex-col items-center flex-1 rounded-xl border-[1px] border-solid border-[#E7E7F1] bg-[#FFF] bg-100% shadow-[0px 5px 10.1px 0px rgba(0, 0, 0, 0.04)]">
                    <div className="self-stretch h-[236px] max-w-full">
                      <img src="" className="shrink-0" loading="Lazy" alt="" />
                    </div>
                    <div className="self-stretch w-[426px] h-[161px] max-w-full items-start flex flex-col p-s ">
                      <div className="self-stretch w-[386px] h-[57px] max-w-full flex flex-col items-start gap-[8px]">
                        <div className="self-stretch w-[386px] h-[22px] max-w-full items-start gap-[8px]">
                          <div className="w-[160px] h-[22px] max-w-full flex items-start justify-start gap-[8px] flex-wrap">
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD font-[700px]"></h3>
                            <h3 className="font-inherit leading-normal text-base text-[#7CA1AD font-[700px]"></h3>
                          </div>
                        </div>
                        <div className="w-[192px] h-[27px] max-w-full flex items-start  justify-center gap-[4px]">
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                          <h3 className="font-inherit leading-normal text-2xl font-[400px] text-[#1F353C]"></h3>
                        </div>
                      </div>

                   
                      <div className="w-[386px] h-[1px] max-w-full bg-[#B2CBD3] bg-100%" />
                     

                      <div className="self-stretch w-[386px] h-[24px] max-w-full flex justify-between items-start font-manrope">
                        <div className="w-[85px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]"></h3>
                        </div>
                        <div className="w-[107px] h-[24px] max-w-full flex items-center justify-center gap-[4px] flex-wrap">
                          <img src="" className="icon" alt="" />
                          <h3 className="font-inherit leading-normal text-base text-[#349A04] font-[700px]"></h3>
                        </div>
                      </div>
                    </div>
                    <img src="" className="icon" alt="" />
                  </div> */}
                  {/* right card starts */}
                </div>
                {/* product cards ends */}
              </div>
              {/* ----------------------------GARAGE ENDS -------------------------------------------*/}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashUnlocked;
