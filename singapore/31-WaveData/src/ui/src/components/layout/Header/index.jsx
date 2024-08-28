import { Link } from "react-router-dom";

import './index.css'
import React from 'react';
import Cookies from 'js-cookie';
export default function Header() {

    function LoginBTN() {
        if (Cookies.get("login") != "true") {
            return (<>
                <li><Link to='/login'>Login</Link></li>
                <li><Link to='/register'>Register</Link></li>
            </>)
        } else {
            return (<>
                <li><Link to='/studies'>Dashboard</Link></li>
            </>)
        }
    }
    return (
        <div>
            <nav className="nav">
                <div className=" main-nav relative h-full flex justify-between">
                    <ul id="nav-mobile">
                        <div >
                            <Link to='/'>
                                <img src="/favicon.ico" className='h-24 w-full' />
                            </Link>
                        </div>
                        <li><Link to='/work'>How does it work?</Link></li>
                        <li><Link to='/privacy'>Privacy</Link></li>
                        <li><Link to='/faq'>FAQ</Link></li>
                    </ul>
                    <ul id="nav-mobile" >
                        <li><Link to='/stories'>Stories of users</Link></li>
                        <li><Link to='/about'>About us!</Link></li>
                        <li><Link to='/contact'>Contact</Link></li>
                        <LoginBTN />

                    </ul>
                </div>
            </nav>
        </div>
    )
}