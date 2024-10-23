import {Ourmenu} from "@/constant"
import Section from "@/components/Section"
import CoffeeCard from "@/components/CoffeeCard"
import { RunningText,TitlePage } from "@/components/TypingText"

import { useState } from "react"


const OurMenu = () => {
  const [active, setActive] = useState("coffee3")

  return (
    <Section id="menu">
        <RunningText />
        <TitlePage title="Our main menus"/>

        <div className="mt-[50px] flex flex-row min-h-[70vh] gap-2">
            {Ourmenu.map((coffee, index) => (
                <CoffeeCard key={coffee.id} {...coffee} active={active} handleClick={setActive} />
            ))}
        </div>
    </Section>
  )
}

export default OurMenu