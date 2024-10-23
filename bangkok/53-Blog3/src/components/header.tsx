import Link from "next/link";
import Signin from "@/components/signin/Sign"

export async function Header() {
    return (
        <header>
            <div>
                <Link href="/">Home </Link>
                <Link href="/article">Articles</Link>
            </div>
            <Signin/>
        </header>
    );
}

export default Header;
