import Link from "next/link"

function Navlink({href,title}) {
  return (
    <li>
        <Link href={href} scroll={false}>{title}</Link>
    </li>
  )
}

export default Navlink