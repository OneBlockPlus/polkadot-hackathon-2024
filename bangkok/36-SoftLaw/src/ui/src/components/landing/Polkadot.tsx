import React from "react";


function Polkadot() {
    return (
        <div className="flex flex-col items-center justify-center w-full bg-[#DFDEDC] py-[120px] min-h-[600px] gap-[60px] self-stretch">
            <div className="flex flex-col items-center justify-center gap-[60px] max-w-[1280px] w-full text-[#1C1A11]">
                <p className="font-Montesarrat text-[28px] uppercase font-[500] leading-[32px] tracking-[-0.56px] min-[2000px]:text-3xl">
                Working with the Securest Ecosystem
                </p>
                <div className="flex items-end pl-[84.6px] pr-[83.6px] justify-center gap-[0.036px]">
                    <img src="/images/Polkadot.svg" alt="Polkadot" className="min-[2000px]:w-[600px] min-[2000px]:h-auto" />
                    <img src="/images/Dot.svg" className="min-[2000px]:w-[20px] w-[13.33px] h-[13.34px]" alt="Polkadot" />
                </div>
                
            </div>
        </div>
    )
}

export default Polkadot;