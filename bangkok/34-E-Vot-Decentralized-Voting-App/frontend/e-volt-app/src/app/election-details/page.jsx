"use client"
import VotingModal from "@/components/VotingModal";
import SuccessModal from "@/components/SuccessModal";
import { useState } from 'react';
import Link from "next/link";
import { Web3 } from "web3";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';


export default function ElectionDetails() {
    const [open, setOpen] = useState(false)
    const [openVote, setOpenVote] = useState(false)
    const [openSuccess, setOpenSuccess] = useState(false)
    const [votedata, setVoteData] = useState(null)
    const flexedData = [
        {
            img: "./assets/candidate8.avif",
            post: "President",
            election_id: 1,
            title: "Afolabi Mayowa",
            desc: "The voice of democracy"
        },
        {
            img: "./assets/candidate2.avif",
            post: "President",
            election_id: 1,
            title: "Ahmad Sulaiman",
            desc: "A vibrant and ever efficient changemaker."
        },
        {
            img: "./assets/candidate3.avif",
            post: "President",
            election_id: 1,
            title: "Amaka Ugwu",
            desc: "The people's choice"
        }
    ]
    const flexedData2 = [
        {
            img: "./assets/candidate9.avif",
            post: "Vice President",
            election_id: 0,
            title: "Jeniffer Bright",
            desc: "Voice of the people"
        },
        {
            img: "./assets/candidate5.avif",
            post: "Vice President",
            election_id: 0,
            title: "Adam Nwakwo",
            desc: "A vote for me is a vote for prosperity"
        },
        {
            img: "./assets/candidate10.avif",
            post: "Vice President",
            election_id: 0,
            title: "Victoria Davis",
            desc: "A woman of her words"
        }
    ]
    const handleSetOpen = (data) => {
        setOpen(true)
        setVoteData(data)
    }
    const handleVote = (data) => {
        setOpenVote(true)
        setVoteData(data)
    }
  return (
    <div className="py-10 px-20">
        <div className="text-right form-item">
            <p className="text-[32px] font-medium form-item">Unilag Student Union Representative</p>
            <p className=" form-item">Election runs from - 1st September to 12th September, 2024</p>
        </div>
        <div className="flex flex-col flex-wrap justify-between items-left border rounded-lg p-10 gap-14 mt-10 form-item">
        <div className="text-left form-item">
            <p className="text-[28px] font-medium form-item">PRESIDENT</p>
            <p className=" form-item">Persons contesting for this post:</p>
        </div>
        <div className="flexed-ctn flex flex-col items-center sm:items-start sm:flex-row sm:gap-2 md:gap-10 gap-0 justify-center ml-auto lg:pl-4 w-full form-item">
            {flexedData.map((data, index) => (
                <div key={index} className={`group sm:basis-[30%] basis-full min-h-[40vh] bg-[rgb(35,38,39,0.2)] overflow-hidden rounded-l cursor-pointer transition ease-in-out lg:w-auto`}>
                <div className="img-div min-h-[40vh] md:h-[30vh] transition ease-in-out duration-500 opacity-80 group-hover:opacity-100 group-hover:scale-105 bg-contain bg-center sm:bg-cover" style={{backgroundImage: `url(${data.img})`, backgroundRepeat: 'no-repeat'}}></div>
                <div className="stars-ctn flex items-center gap-6 justify-start mb-4 md:my-4 px-6">
                    <div className={`bg-[#01637E20] my-4 md:my-1 px-2 text-[12px] md:text-[12px] text-[#000] font-[NuelisAlt]`}>{data.post}</div>
                </div>
                <div className="w-auto">
                    <p className="gradient-text text-[20px] md:text-[46px]-small md:px-6 font-[NuelisAlt]">
                        {data.title}
                    </p>
                    <p className="text-[15px] md:text-[15px] font-light pb-8 md:px-6 font-[NuelisAlt]">{data.desc}</p>
                </div>
                <button onClick={() => handleSetOpen(data)} className="space-x-4 mx-6 mb-6 bg-[#5773fb] text-white rounded-lg w-[9rem] h-[2.5rem] transition ease-in-out delay-150 group-hover:-translate-y-1 group-hover:scale-110 duration-300">
                Vote
                </button>
            </div>
            ))}
        </div>
        </div>
        <div className="flex flex-col flex-wrap justify-between items-left border rounded-lg p-10 gap-14 mt-10 form-item">
        <div className="text-left form-item">
            <p className="text-[28px] font-medium">VICE PRESIDENT</p>
            <p>Persons contesting for this post:</p>
        </div>
        <div className="flexed-ctn flex flex-col items-center sm:items-start sm:flex-row sm:gap-2 md:gap-10 gap-0 justify-center ml-auto lg:pl-4 w-full">
            {flexedData2.map((data, index) => (
                <div key={index} className={`group sm:basis-[30%] basis-full min-h-[40vh] bg-[rgb(35,38,39,0.2)] overflow-hidden rounded-l cursor-pointer transition ease-in-out lg:w-auto`}>
                    <div className="img-div min-h-[40vh] md:h-[30vh] transition ease-in-out duration-500 opacity-80 group-hover:opacity-100 group-hover:scale-105 bg-contain bg-center sm:bg-cover" style={{backgroundImage: `url(${data.img})`, backgroundRepeat: 'no-repeat'}}></div>
                    <div className="stars-ctn flex items-center gap-6 justify-start mb-4 md:my-4 px-6">
                        <div className={`bg-[#01637E20] my-4 md:my-1 px-2 text-[12px] md:text-[12px] text-[#000] font-[NuelisAlt]`}>{data.post}</div>
                    </div>
                    <div className="w-auto">
                        <p className="gradient-text text-[20px] md:text-[46px]-small md:px-6 font-[NuelisAlt]">
                            {data.title}
                        </p>
                        <p className="text-[15px] md:text-[15px] font-light pb-8 md:px-6 font-[NuelisAlt]">{data.desc}</p>
                    </div>
                    <button onClick={() => handleSetOpen(data)} className="space-x-4 mx-6 mb-6 bg-[#5773fb] text-white rounded-lg w-[9rem] h-[2.5rem] transition ease-in-out delay-150 group-hover:-translate-y-1 group-hover:scale-110 duration-300">
                    Vote
                    </button>
                </div>
            ))}
        </div>
        </div>

        {/* modal */}
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
            <VotingModal onCloseModal={() => setOpen(false)} emitVoteSuccess={() => setOpenSuccess(true)} info={votedata} emitVote={handleVote} />
        </Dialog>
        <Dialog
            open={openSuccess}
            onClose={() => setOpenSuccess(false)}
            className="relative z-10"
        >
            <SuccessModal btnText="See Live Elections" successMsg="Congratulations! You have successfully voted for your chosen candidate. Be rest assured that your vote counts." routePath="/elections" />
        </Dialog>
    </div>
  );
}
