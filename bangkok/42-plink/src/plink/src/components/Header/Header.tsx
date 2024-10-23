import {Link, NavLink} from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu/HeaderMenu";
import {CKBContext} from "@/providers/CKBProvider/CKBProvider";
import {useContext} from "react";
import {LangContext} from "@/providers/LangProvider/LangProvider";
import {useParams} from "react-router-dom";

function Header() {
    const {address} = useContext(CKBContext);
    const {lang} = useContext(LangContext)
    const {address : addressParams} = useParams()


    return <header className={'sticky w-full bg-white shadow h-[60px] top-0 z-20'}>
        <div className={'max-w-[1044px] mx-auto h-[60px] flex items-center px-3 box-border justify-between'}>
            <div className="flex flex-row items-center">
                <Link to="/">
                    <img src="/images/logo.png" alt="" width={114} height={32}/>
                </Link>

                {!!address &&
                    <NavLink className={({isActive}) => {
                        return `whitespace-nowrap text-xs font-semibold ml-3 md:ml-10 md:text-sm ${isActive && address === addressParams ? 'text-[#6CD7B2]' : ''}`
                    }}
                             to={`/address/${address}`}>
                        {lang['Profile']}
                    </NavLink>
                }

                <NavLink className={({isActive}) => {
                    return `whitespace-nowrap text-xs font-semibold ml-3 md:ml-10 md:text-sm ${isActive ? 'text-[#6CD7B2]' : ''}`
                }} to={`/market`}>{lang['Market']}</NavLink>
                <NavLink className={({isActive}) => {
                    return `whitespace-nowrap text-xs font-semibold ml-3 md:ml-10 md:text-sm ${isActive ? 'text-[#6CD7B2]' : ''}`
                }} to={`/apps`}>{lang['Apps']}</NavLink>
            </div>

            <HeaderMenu/>
        </div>
    </header>
}

export default Header
