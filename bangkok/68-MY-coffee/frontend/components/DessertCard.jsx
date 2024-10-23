import Image from "next/image"

const DessertCard = ({id,imgUrl}) => {
  return (
    <div className="relative h-[320px]">
        <Image src={imgUrl} alt={id} fill className="object-cover rounded-xl" />
    </div>
  )
}

export default DessertCard