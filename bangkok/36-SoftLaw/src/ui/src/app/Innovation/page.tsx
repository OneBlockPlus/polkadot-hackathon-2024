import dynamic from "next/dynamic";
const ProofOfCreativity = dynamic(() => import('@/components/ProofOfInnovation'), {
  ssr: false,
})

export default function DashPage() {
  return (
  <div className="">
  <ProofOfCreativity />
  </div>
  

);
}
