'use client'
import { useInkathon } from "@scio-labs/use-inkathon";
import { ConnectButton } from "../web3/connect-button";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const router = useRouter()
    const { error } = useInkathon()
    useEffect(() => {
      if (!error) return
      toast.error(error.message)
    }, [error])
  
    return (
        <div className="w-full items-center h-fit min-h-8 bg-background flex justify-between py-2 px-2 text-white hover:opacity-80 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/images/dazhbog-logo.png" className="max-h-14" alt="" />
          <ConnectButton />
        </div>
    )
}