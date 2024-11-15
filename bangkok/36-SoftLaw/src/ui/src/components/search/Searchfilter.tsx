'use client'
import React from 'react'
import TypesComponent from '../TypesProps'


const Searchfilter = () => {
    return (
        <div>
        <div className="flex flex-col items-start self-stretch gap-[16px] w-full min-[2000px]:w-[1280px]">
          <div className="flex items-center py-[16px] gap-[16px] w-full border-b border-[#8A8A8A]">
            
            <div className="flex items-start justify-center gap-[50px]">
              <div className="flex gap-[16px] items-start">
                <img src="/images/Tiger.svg" alt="" />
                
                <div className="flex flex-col gap-[16px] items-start ">
                  <h3 className="font-Montesarrat text-[14px] font-normal leading-[145%] tracking-[0.28px] text-[#8A8A8A] ">
                    Wordmark{" "}
                    <span className="block text-[#EFF4F6] text-[16px] tracking-[0.32px]">
                      Tiger
                    </span>
                  </h3>

                  <h3 className="font-Montesarrat text-[14px] font-normal leading-[145%] tracking-[0.28px] text-[#8A8A8A] ">
                    Class{" "}
                    <span className="block text-[#EFF4F6] text-[16px] tracking-[0.32px]">
                      007
                    </span>
                  </h3>
                </div>
              </div>

              <div className="pl-[100px]">
                  <TypesComponent
                  text="TIGER INDUSTRIAL GROUP CO., LTD (LIMITED COMPANY; CHINA)"
                  className="text-[#EFF4F6] text-[14px]"
                />
              </div>
               
            

              {/* Serial Number */}
           
                <TypesComponent text="78831131" className="text-[#EFF4F6]" />
            

              {/* status */}

              <div className="flex flex-col items-start gap-2">
                <TypesComponent
                  text="Live"
                  className="bg-[#373737] rounded-[36px] text-[#CBCBCB] py-1 px-2"
                />

                <TypesComponent
                  text="Pending"
                  className="bg-[#373737] rounded-[36px] text-[#CBCBCB] py-1 px-2"
                />
              </div>
            </div>
          </div>


        </div>
        </div>
    )

}

export default Searchfilter;