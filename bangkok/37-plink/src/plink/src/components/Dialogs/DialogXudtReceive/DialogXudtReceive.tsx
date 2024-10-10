import React, {useEffect} from 'react';
import * as Dialog from '@radix-ui/react-dialog'
import QRCode from 'qrcode'
import ProfileAddresses from "@/components/ProfileAddresses/ProfileAddresses"

export default function DialogXudtReceive(props: { children: React.ReactNode, address: string, className?: string }) {
    const [open, setOpen] = React.useState(false)
    const [qrcodeUrl, setQrcodeUrl] = React.useState<string>("")

    useEffect(() => {
        (async () => {
            setQrcodeUrl(await QRCode.toDataURL(props.address))
        })()
    }, [props.address])

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className={props.className}>
                {props.children}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay
                    className="bg-[rgba(0,0,0,0.6)] z-40 data-[state=open]:animate-overlayShow fixed inset-0"/>
                <Dialog.Content
                    className="data-[state=open]:animate-contentShow z-50 fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <div className="font-semibold text-2xl">Receive</div>
                        <div onClick={e => {
                            setOpen(false)
                        }}
                             className="flex flex-row items-center justify-center text-xl cursor-pointer h-[24px] w-[24px] rounded-full bg-gray-100">
                            <i className="uil-times text-gray-500"/>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center w-[300px] py-6">
                        <div className="rounded-xl bg-gray-800 p-3 mb-4 ">
                            <img className="rounded-xl" src={qrcodeUrl} width={200} height={200} alt=""/>
                            <div className="text-white text-center font-semibold mt-2">Scan to Transfer</div>
                        </div>

                        <ProfileAddresses addresses={[props.address]} defaultAddress={props.address}/>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
