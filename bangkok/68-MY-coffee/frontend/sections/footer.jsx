import {HiOutlineMail,HiOutlineLocationMarker} from "react-icons/hi"
import FooterTitle from "@/components/FooterTitle"
import Section from "@/components/Section"

const Footer = () => {
    const date = new Date()

  return (
    <Section id="contact">
        <div className="grid grid-cols-2 mt-12">
            <div>
                <FooterTitle>Contact - Twitter</FooterTitle>
                <div className="flex items-center text-[#e8e8e8] opacity-90">
                    <HiOutlineMail />
                    <p className="ml-2">@imsuperkk</p>
                </div>
                <div className="flex items-center text-[#e8e8e8] opacity-90">
                    <HiOutlineLocationMarker />
                    <p className="ml-2">Hong Kong</p>
                </div>
            </div>
                <div className="flex justify-around">
                    <div className="flex flex-col">
                        <FooterTitle>Social media</FooterTitle>
                        <a href="#" className="text-[#e8e8e8] opacity-90">Twitter</a>
                        <a href="#" className="text-[#e8e8e8] opacity-90">TG</a>
                    </div>
                    <div>
                        <FooterTitle>Product</FooterTitle>
                        <p className="text-[#e8e8e8] opacity-90">Coffee Cards</p>
                    </div>
                    <div>
                        <FooterTitle>Information</FooterTitle>
                        <p className="text-[#e8e8e8] opacity-90">Merchants</p>
                        <p className="text-[#e8e8e8] opacity-90">Feedback</p>
                    </div>
                </div>
        </div>
        <div className="w-full h-[1.5px] bg-[#e8e8e8] opacity-90 mt-20" />
        <p className="text-[#e8e8e8] opacity-90 text-xs font-light tracking-wider text-center mt-2">&copy;{date.getFullYear()} MY Coffee. All rights reserved</p>
    </Section>
  )
}

export default Footer