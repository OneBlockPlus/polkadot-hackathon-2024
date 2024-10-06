"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Web3 } from "web3";
import { useWeb3ModalAccount } from "web3modal-web3js/react";


export default function HOME() {
    const router = useRouter()
    const { address, chainId, isConnected } = useWeb3ModalAccount();

  // check if Metamask is installed
  // if installed, initialize Web3JS
  // request user to connect to Metamask

  const handleCheckConnect =() =>{
    if (isConnected) {
        router.push("/kyc");
    } else {
        toast.error("Please connect your wallet");
    }

  }

  return (
    <div className="">
        <div className="home-bg text-left uppercase py-10 px-20 flex justify-between items-center pt-20">
            <div>
                <div className="relative">
                    <p className="text-[69px] font-[800] text-[#5C28D4] form-item">Secure,</p>
                    <p className="text-[69px] font-[800] text-[#5C28D4] form-item"><span className="bg-[#5c28d4] text-white line-through">Transpar</span><span>ent</span></p>
                    <p className="text-[40px] font-[700] text-[#5C28D4] form-item">& Tamper-Proof Voting</p>
                    <p className="text-[20px] text-[#9f9f9f] form-item">Vote with confidence, knowing your voice truly counts</p>
                    <img src="./assets/rocket.png" alt="" className="absolute top-[-20vh] left-[-5vw] form-item" />
                </div>

                <button className="space-x-4 uppercase bg-[#5C28D4] text-white rounded-lg w-[9rem] h-[3rem] mt-16 form-item transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 form-item">
                    Learn More
                </button>
            </div>
            <div className="z-20 form-item">
                <img src="./assets/astro.png" alt="" className="h-[90%]" />
            </div>
        </div>
        <div className="flex items-center justify-center form-item">
            <img src="./assets/e-vot.png" alt="" />
        </div>
        <div className="py-10 px-20 mt-10">
            <div>
                <p className="text-[32px] font-medium form-item">Welcome To E-vot</p>
                <p className=" form-item">Voter to make your voice heard</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center border rounded-lg p-10 gap-14 mt-10 form-item">
                <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                    <p className="text-[24px] font-medium">Easy Registration</p>
                    <p className="text-sm font-normal text-[#8F96A1]">We offer seamless registration process to quickly get you onboard</p>
                </div>
                <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                    <p className="text-[24px] font-medium">Secure Voting System</p>
                    <p className="text-sm font-normal text-[#8F96A1]">Secure voting process with no hitches</p>
                </div>
                <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                    <p className="text-[24px] font-medium">Real-time Result</p>
                    <p className="text-sm font-normal text-[#8F96A1]">Verifiable and transparent results</p>
                </div>
                <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                    <p className="text-[24px] font-medium">Stay Anonymous</p>
                    <p className="text-sm font-normal text-[#8F96A1]">Vote without fear of being chastised for your choice</p>
                </div>
                <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                    <p className="text-[24px] font-medium">Vote Candidates</p>
                    <p className="text-sm font-normal text-[#8F96A1]">Vote your preferred candidate without fear or pressure</p>
                </div>
                <div className="shadow-made rounded-lg flex flex-col justify-center items-center py-12 px-16 text-center basis-[45%] form-item">
                    <p className="text-[24px] font-medium">View Election Results</p>
                    <p className="text-sm font-normal text-[#8F96A1]">Watch your favorite candidate win</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center w-full">
                {/* <Link > */}
                <button onClick={handleCheckConnect} className="space-x-4 bg-[#5773fb] text-white rounded-lg w-auto py-4 px-6 my-10 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
                    Complete KYC To Get Started
                </button>
                {/* </Link> */}
            </div>
        </div>
    </div>
  );
}
