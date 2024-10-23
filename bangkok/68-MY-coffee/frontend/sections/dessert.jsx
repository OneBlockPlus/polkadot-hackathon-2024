import Section from "@/components/Section"
import { RunningText,TitlePage } from "@/components/TypingText"
import DessertCard from "@/components/DessertCard"
import { Desserts } from "@/constant"

const Dessert = () => {
  return (
    <Section id="dessert">
        <RunningText />
        <TitlePage title="Desserts & Beverages" />
        <div className="mt-[50px] min-h-[70vh] grid grid-cols-4 gap-[2px] mb-16">
            {Desserts.map((item, index) => (
                <DessertCard key={item.id} {...item} />
            ))}
        </div>
    </Section>
  )
}

export default Dessert