import Image from "next/image"
import Navlink from "./Navlink"

import {linkList} from "@/utils/link"

const Navbar = () => {
  return (
    <div className="relative z-[10] text-white mt-4">
        <div className="flex justify-between items-center">
            <div>
                <Image src="/logo.png" alt="logo" width={70} height={70}/>
            </div>
            <ul className="flex gap-4 text-lg">
                {linkList.map((link) => (
                    <Navlink key={link.id} href={link.href} title={link.title}/>
                ))}
            </ul>
        </div>
    </div>
  )
}

export default Navbar