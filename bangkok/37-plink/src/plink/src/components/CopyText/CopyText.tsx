import {useContext} from "react";
import {ToastContext, ToastType} from "@/providers/ToastProvider/ToastProvider";

export default function CopyText({
                                     children,
                                     copyText,
                                     className
                                 }: { children: React.ReactNode, copyText: string, className?: string }) {
    const {showToast} = useContext(ToastContext)

    const handleCopy = (e: any) => {
        e.preventDefault()
        navigator.clipboard.writeText(copyText)
        showToast('Copied to clipboard !', ToastType.success)
    }

    return (
        <span className={`cursor-pointer flex flex-row items-center ${className}`} onClick={handleCopy}>
        {children}
            <i className="uil-copy text-sm ml-1"/>
    </span>
    )
}
