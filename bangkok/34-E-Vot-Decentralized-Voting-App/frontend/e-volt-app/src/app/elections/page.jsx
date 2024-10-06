"use client"
import Link from "next/link";
import { Web3 } from "web3";


export default function Elections() {
  return (
    <div className="py-10 px-20">
        <div>
            <p className="text-[32px] font-medium form-item">Live Elections</p>
            <p className=" form-item">Vote to make your voice heard</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center border rounded-lg p-10 gap-14 mt-10 form-item">
            <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                <p className="text-[24px] font-medium form-item">Unilag Student Union Representative</p>
                <p className="text-sm font-normal text-[#8F96A1] form-item">Election running from - 1st September to 12th September, 2024</p>
                <Link href="/election-details">
                <button className="space-x-4 bg-[#5773fb] text-white rounded-lg w-[9rem] h-[3rem] mt-16 form-item transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
                Click To View
                </button>
                </Link>
            </div>
            <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                <p className="text-[24px] font-medium form-item">LASU Student Union Representative</p>
                <p className="text-sm font-normal text-[#8F96A1] form-item">Election running from - 4th September to 20th September, 2024</p>
                <Link href="/election-details">
                <button className="space-x-4 bg-[#5773fb] text-white rounded-lg w-[9rem] h-[3rem] mt-16 form-item transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
                Click To View
                </button>
                </Link>
            </div>
            <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                <p className="text-[24px] font-medium form-item">FUTO Student Union Representative</p>
                <p className="text-sm font-normal text-[#8F96A1] form-item">Election running from - 3rd September to 19th September, 2024</p>
                <Link href="/election-details">
                <button className="space-x-4 bg-[#5773fb] text-white rounded-lg w-[9rem] h-[3rem] mt-16 form-item transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
                Click To View
                </button>
                </Link>
            </div>
            <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                <p className="text-[24px] font-medium form-item">Uniben Student Union Representative</p>
                <p className="text-sm font-normal text-[#8F96A1] form-item">Election running from - 3rd September to 15th September, 2024</p>
                <Link href="/election-details">
                <button className="space-x-4 bg-[#5773fb] text-white rounded-lg w-[9rem] h-[3rem] mt-16 form-item transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
                Click To View
                </button>
                </Link>
            </div>
        </div>
    </div>
  );
}
