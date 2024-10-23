const Section = ({children,id,style}) => {
  return (
    <section id={id} className={`${id === "contact" ? 'h-[50vh] bg-[#333131]' : 'min-h-screen'} w-screen overflow-x-hidden relative px-[8rem] py-[1rem] ${style}`}>{children}</section>
  )
}

export default Section