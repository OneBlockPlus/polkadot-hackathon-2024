import {createContext, useEffect, useRef, useState} from "react";
import * as Toast from '@radix-ui/react-toast';

export interface ToastContextType {
    showToast: (string: string, type?: ToastType) => any
}

export enum ToastType {
    info = 'info',
    success = 'success',
    warning = 'warning',
    error = 'error'
}

export const ToastContext = createContext<ToastContextType>({
    showToast: () => {
    }
})

export default function ToastProvider({children}: { children: any }) {
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [type, setType] = useState<ToastType | undefined>(undefined)
    const timerRef = useRef(0)

    const showToast = (text: string, type?: ToastType) => {
        setOpen(false)
        clearTimeout(timerRef.current)

        timerRef.current = window.setTimeout(() => {
            setText(text)
            setType(type)
            setOpen(true)
        }, 100);
        setText(text)
    }

    useEffect(() => {
        return () => clearTimeout(timerRef.current)
    }, []);

    return <ToastContext.Provider value={{showToast}}>
        {children}
        <Toast.Provider swipeDirection="up" duration={3000}>
            <Toast.Root
                className="bg-white rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
                open={open}
                onOpenChange={setOpen}>
                <Toast.Description className="flex items-start break-all">
                    {
                        type === ToastType.info && <i className="uil-info-circle text-blue-500 text-2xl mr-2"/>
                    }
                    {
                        type === ToastType.success && <i className="uil-check-circle text-green-500 text-2xl mr-2"/>
                    }
                    {
                        type === ToastType.warning &&
                        <i className="uil-exclamation-circle text-yellow-500 text-2xl mr-2"/>
                    }
                    {
                        type === ToastType.error && <i className="uil-times-circle text-red-500 text-2xl mr-3"/>
                    }
                    <div className="overflow-hidden line-clamp-4 line-clamp-ellipsis">{text}</div>
                </Toast.Description>
            </Toast.Root>
            <Toast.Viewport
                className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none"/>
        </Toast.Provider>
    </ToastContext.Provider>
}
