'use client';
import dynamic from "next/dynamic";
const IPSearch = dynamic(() => import('@/components/IPSearch/IPSearch'), {
  ssr: false,
})

export default function Ipsearch() {
  return (
  <div className="min-[2000px]:w-[1280px]">
  <IPSearch />
  </div>
  

);
}