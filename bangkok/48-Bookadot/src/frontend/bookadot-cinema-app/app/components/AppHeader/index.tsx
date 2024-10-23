'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "flowbite-react";
import { Back } from "@app/components/Icon";
import { usePathname } from "next/navigation";
import Typography from "../Typography";
import classNames from "classnames";

interface IAppHeaderProps {
    config: {
        title: string;
        subtitle?: string;
    };
    rightIcon?: ReactNode;
    className?: string;
}

export function AppHeader({ config, rightIcon, className }: IAppHeaderProps) {
    const pathname = usePathname()
    const finalSlashIndex = pathname.lastIndexOf('/')
    const previousPath = pathname.slice(0, finalSlashIndex)

    return (
        <Navbar fluid rounded className={classNames("mb-1 p-4", className)}>
            <div className="flex justify-between items-center w-full">
                <Link href={previousPath} className="cursor-pointer">
                    <Back />
                </Link>
                <div className="text-center">
                    <Typography component="p" className="text-lg font-bold">{config.title}</Typography>
                    {
                        config.subtitle && (
                            <Typography component="p" className="text-sm font-normal text-opacity-40">{config.subtitle}</Typography>
                        )
                    }
                </div>
                <div className="cursor-pointer">
                    {rightIcon || <div className="w-10" />}
                </div>
            </div>
        </Navbar>
    )
}
