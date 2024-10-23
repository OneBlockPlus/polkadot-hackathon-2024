import * as React from 'react'
import NavLink from 'next/link';

import { Logo } from '../../../components/layout/Logo'

import '../../../styles/Footer.scss'


export function Footer(): JSX.Element {

    return (
        <footer className="footer">
            <div className="container container--large">
                <div className="footer__wrapper">
                    <div className="footer__left">
                        <NavLink href="/" className="footer-logo">
                            <Logo />
                        </NavLink>
                    </div>
                    <nav className="footer-nav">
                        <div className="footer-nav__col">
                            <div className="footer-nav__col-title">
                            Product 
                            </div>
                            <ul className="footer-nav__list">
                                <li>
                                    <NavLink href="/donation">
                                        Donation
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink href="/CreateEvents">
                                        Create Events
                                    </NavLink>
                                </li>
                            </ul>
                        </div>

                    </nav>
                    <div className="footer__right">
                    </div>
                </div>

            </div>
        </footer>
    )
}
