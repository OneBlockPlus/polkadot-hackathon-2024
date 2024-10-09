import * as Dialog from '@radix-ui/react-dialog'
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {ReactNode, useContext, useState} from "react"
import ProfileAddresses from "@/components/ProfileAddresses/ProfileAddresses"

export default function DialogTransferFromAddressSelect({
                                                            children,
                                                            onSelect,
                                                            className = ''
                                                        }: { children: ReactNode, onSelect?: (address: string) => any, className?: string }) {
    const {address, internalAddress} = useContext(CKBContext)
    const [open, setOpen] = useState(false);

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={className}>
            {children}
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay className="bg-[rgba(0,0,0,0.6)] z-40 data-[state=open]:animate-overlayShow fixed inset-0"/>
            <Dialog.Content
                className="data-[state=open]:animate-contentShow z-50 fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[90vw] w-full translate-x-[-50%] md:max-w-[450px] translate-y-[-50%] rounded-xl bg-white p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                <div className="flex flex-row justify-between items-center mb-4">
                    <div className="font-semibold text-2xl">Select A Wallet</div>
                    <div onClick={e => {
                        setOpen(false)
                    }}
                         className="flex flex-row items-center justify-center text-xl cursor-pointer h-[24px] w-[24px] rounded-full bg-gray-100">
                        <i className="uil-times text-gray-500"/>
                    </div>
                </div>

                {!address && !internalAddress &&
                    <div>Not Wallet founded</div>

                }

                <div onClick={e => {
                    !!onSelect && onSelect(address!)
                    setOpen(false)
                }}
                     className="bg-gray-50 rounded-lg py-3 px-4 cursor-pointer mb-4 flex flex-row items-center justify-between">
                    <ProfileAddresses addresses={[address!]} defaultAddress={address!} clickable={false}/>
                    <i className="uil-angle-right text-3xl font-semibold"/>
                </div>
                <div onClick={e => {
                    !!onSelect && onSelect(internalAddress!)
                    setOpen(false)
                }}
                     className="bg-gray-50 rounded-lg py-3 px-4 cursor-pointer mb-4 flex flex-row items-center justify-between">
                    <ProfileAddresses addresses={[internalAddress!]} defaultAddress={internalAddress!}
                                      clickable={false}/>
                    <i className="uil-angle-right text-3xl font-semibold"/>
                </div>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
}
