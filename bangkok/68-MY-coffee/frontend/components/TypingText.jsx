import {motion} from "framer-motion";
import {textContainer,textVariant} from "@/utils/motion"

export const RunningText = ({color,align}) => {
    return (
        <motion.p variants={textContainer} initial="hidden" whileInView="show" className={`${color && align ? `text-[${color}] text-[${align}]` : 'text-center text-gray-500'} mt-10 font-semibold`}>
            {Array.from("| MY Coffee").map((letter,index) => (
                <motion.span key={index} variants={textVariant}>{letter}</motion.span>
            ))}
        </motion.p>
    )
}

export const TitlePage = ({title,color,align}) => {
    return(
        <motion.h2 variants={textVariant} initial="hidden" whileInView="show" className={`${color && align ? `text-[${color}] text-[${align}]` : 'text-center text-gray-700'} text-4xl font-semibold mt-4`}>{title}</motion.h2>
    )
}