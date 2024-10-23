import Image from "next/image"
import { RunningText, TitlePage } from "@/components/TypingText"
import Section from "@/components/Section"

const About = () => {
    return (
        <Section id="about">
            <div className="h-screen grid grid-cols-2">
                <div className="flex justify-center items-center">
                    <Image src="/image/coffee-shop.jpg" alt="coffee-shop" width={350} height={500} className="rounded-xl" />
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#333131] z-0" />
                <div className="z-50 py-8 px-10 relative flex justify-start items-center">
                    <h1 className="absolute top-10 left-10 text-6xl font-bold text-white opacity-10">MY coffee</h1>
                    <div>
                        <RunningText color="#7d7d7d" align="left" />
                        <TitlePage title="About us" color="#e8e8e8" align="left" />
                        <div className="mt-8 text-[#e8e8e8] text-lg font-regular text-justify">
                            <p className="opacity-90">
                                let user can do coffee transaction with their wallet and share their feedback record of coffee
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    )
}

export default About