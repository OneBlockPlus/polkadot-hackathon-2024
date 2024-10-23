
import { Logo } from '../../../components/layout/Logo';
import { Nav } from '../../../components/layout/Nav'
import * as React from 'react'

export  function Header() {
    return (
        <header className="header">
            <Logo />
            <Nav />
        </header>
    )
}
