'use client';
import dynamic from "next/dynamic";
const LegalContracts = dynamic(() => import('@/components/ProofOfInnovation/legalContracts/index'), {
  ssr: false,
})

export default function legalContracts () {

  return (
  
  <div className="scrollable min-[2000px]:w-[1280px]">
     <LegalContracts />
  </div>
  
);
}