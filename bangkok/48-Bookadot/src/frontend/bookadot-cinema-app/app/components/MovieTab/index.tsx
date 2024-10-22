import classNames from 'classnames'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'

function MovieTab() {
    const pathname = usePathname()
    const param = useParams()

    const commonTabClassName = "w-full text-center border-b-2 border-[rgba(85,85,85,0.50)] px-4 py-2 font-bold text-lg"
    const isActiveSessionTab = pathname.endsWith('/sessions')
    const tabActiveClassName = (condition: boolean) => condition
        ? "text-accent-color border-accent-color"
        : "!text-text-secondary-color"


    return (
        <div className={"w-full flex"}>
            <Link
                href={`/movie/${param.code}`}
                className={'w-1/2'}
            >
                <div className={classNames(commonTabClassName, tabActiveClassName(!isActiveSessionTab))}>
                    About
                </div>
            </Link>
            <Link
                href={`/movie/${param.code}/sessions`}
                className={'w-1/2'}
            >
                <div className={classNames(tabActiveClassName(isActiveSessionTab), commonTabClassName)}>
                    Sessions
                </div>
            </Link>
        </div>
    )
}

export default MovieTab