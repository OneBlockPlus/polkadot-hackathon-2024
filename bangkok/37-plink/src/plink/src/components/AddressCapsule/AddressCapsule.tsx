import {useContext} from "react";
import {ToastContext, ToastType} from "@/providers/ToastProvider/ToastProvider";

export const showAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4)
}

export default function AddressCapsule({label, address, className}: { label?: string, address: string, className?: string }) {
    const {showToast} = useContext(ToastContext)

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        showToast('Copied to clipboard !', ToastType.success)
    }

    return <div
        onClick={() => handleCopy(address)}
        className={`inline-flex items-center space-x-2 bg-gray-200 px-7 py-3 rounded-3xl md:mr-5 cursor-pointer select-none ${className || ''}`}>
        {!!label &&
            <div className="text-xl text-gray-400">{label}: </div>
        }

        <div className="text-xl text-gray-400">{showAddress(address)}</div>

        <i className="uil-copy text-gray-400 text-xl" />
    </div>
}
