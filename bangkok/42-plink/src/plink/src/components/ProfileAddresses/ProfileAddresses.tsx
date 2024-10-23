import {ToastContext, ToastType} from "@/providers/ToastProvider/ToastProvider"
import * as RadixSelect from '@radix-ui/react-select';
import {forwardRef, LegacyRef, RefAttributes, useRef, useContext, useEffect} from 'react'
import * as React from "react"
import {SelectItemProps} from "@radix-ui/react-select"
import {shortTransactionHash} from "@/utils/common"

export interface SelectOptionProps {
    addresses: string[]
    defaultAddress: string
    onChoose?: (address: string) => void
    clickable?: boolean
}

const getLabel = (address: string) => {
    if (address.startsWith('0x')) {
        return {
            className: 'bg-[#EEF2FE] text-[#7492EF]',
            label: 'EVM'
        }
    } else if (address.startsWith('ckb') || address.startsWith('ckt')) {
        return {
            className: 'bg-gray-200 text-gray-800',
            label: 'CKB'
        }
    } else if (address.startsWith('bc1') || address.startsWith('tb1')) {
        return {
            className: 'bg-[#FFF7E8] text-[#F1CB45]',
            label: 'BTC'
        }
    } else {
        return {
            className: '',
            label: ''
        }
    }
}

export default function ProfileAddresses ({addresses, defaultAddress, onChoose, clickable = true}: SelectOptionProps) {
    const [open, setOpen] = React.useState(false)
    const [menuWidth, setMenuWidth] = React.useState('auto')
    const id = useRef(Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000)
    const {showToast} = useContext(ToastContext)
    const [value, setValue] = React.useState<string>(defaultAddress)

    const handleCopy = (text: string) => {
        if (clickable) {
            navigator.clipboard.writeText(text)
            showToast('Copied to clipboard !', ToastType.success)
        }
    }

    useEffect(()=>{
        setValue(defaultAddress)
    }, [defaultAddress])

    const toggleOpen = (openValue: boolean) => {
        if (openValue) {
            const width = document.querySelector(`.SelectTrigger-${id.current}`)?.clientWidth
            setMenuWidth(width ? `240px` : 'auto')
        }
        setTimeout(()=> {
            setOpen(openValue)
        }, 100)
    }

    return <RadixSelect.Root
        value={value}
        disabled={addresses.length === 1}
        open={open}
        onValueChange={(value) => {
            setValue(value)
            !!onChoose && onChoose(value)
        }}
        onOpenChange={(open) => {toggleOpen(open)}}>
        <div className="flex flex-row items-center mr-1 cursor-pointer hover:text-[#6cd7b2]">
            <div onClick={e => {e.preventDefault();handleCopy(value)}} >
                <RadixSelect.Value placeholder={'Select ...'}/>
            </div>
            <RadixSelect.Trigger
                className={`SelectTrigger-${id.current} flex flex-row items-center justify-between w-full outline-0`} aria-label={'Select'}>

                { addresses.length > 1 &&
                    <RadixSelect.Icon className="SelectIcon ml-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                            <rect x="32" y="32" width="32" height="32" rx="5" transform="rotate(-180 32 32)" fill="#F7F7F7"/>
                            <path d="M17.5429 21.1293C16.7429 22.0992 15.2571 22.0992 14.4571 21.1293L10.0389 15.7726C8.963 14.4681 9.89089 12.5 11.5818 12.5L20.4182 12.5C22.1091 12.5 23.037 14.4681 21.9611 15.7726L17.5429 21.1293Z" fill="#7B7C7B"/>
                        </svg>
                    </RadixSelect.Icon>
                }
            </RadixSelect.Trigger>
        </div>
        <RadixSelect.Portal>
            <RadixSelect.Content className={`SelectContent z-[999] `}  style={{
                minWidth: menuWidth,
                marginLeft: `-${200}px`
            }} position={'popper'}>
                <RadixSelect.ScrollUpButton className="SelectScrollButton">
                    <i className="uil-angle-up text-2xl" />
                </RadixSelect.ScrollUpButton>
                <RadixSelect.Viewport className="SelectViewport">
                    <RadixSelect.Group>
                        {
                            addresses.map((address) => {
                                const label = getLabel(address)

                                return <SelectItem key={address} value={address}>
                                   <div className="flex items-center flex-row">
                                       <div className={`mr-1 flex items-center flex-row rounded font-semibold text-xs px-1 h-[20px] ${label.className}`}>{label.label}</div>
                                       {shortTransactionHash(address, 8)}
                                   </div>
                                </SelectItem>
                            })
                        }
                    </RadixSelect.Group>
                </RadixSelect.Viewport>
                <RadixSelect.ScrollDownButton className="SelectScrollButton">
                    <i className="uil-angle-down text-2xl" />
                </RadixSelect.ScrollDownButton>
            </RadixSelect.Content>
        </RadixSelect.Portal>
    </RadixSelect.Root>
}

const SelectItem = forwardRef(({children, className, ...props} : SelectItemProps & RefAttributes<HTMLDivElement>, ref: LegacyRef<HTMLDivElement>) => {
    return (
        <RadixSelect.Item className={`SelectItem ${className || ''}`} {...props} ref={ref}>
            <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
        </RadixSelect.Item>
    )
})
