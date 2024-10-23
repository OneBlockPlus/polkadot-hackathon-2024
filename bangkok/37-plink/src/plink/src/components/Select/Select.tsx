import * as RadixSelect from '@radix-ui/react-select';
import {forwardRef, LegacyRef, RefAttributes, useRef, ReactNode} from 'react';
import * as React from "react";
import {SelectItemProps, SelectProps} from "@radix-ui/react-select";


export interface SelectOption {
    id: string;
    label: string;
    [index: string]: any
}

export interface SelectOptionProps extends SelectProps {
    options: (SelectOption & {[key: string]: any})[];
    placeholder?: string;
    className?: string;
    hideDropIcon?: boolean;
    containerWidthPrefix?: number;
    getValueLabel?: () => ReactNode | string | undefined;
    getOptionLabel?: (opt: SelectOption) => ReactNode | string;
}


const SelectItem = forwardRef(({children, className, ...props} : SelectItemProps & RefAttributes<HTMLDivElement>, ref: LegacyRef<HTMLDivElement>) => {
    return (
        <RadixSelect.Item className={`SelectItem ${className || ''}`} {...props} ref={ref}>
            <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
            <RadixSelect.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                <i className="uil-check text-xl" />
            </RadixSelect.ItemIndicator>
        </RadixSelect.Item>
    );
});



export default function Select ({options, placeholder, className='', hideDropIcon=false, getValueLabel, getOptionLabel, ...props}: SelectOptionProps) {
    const [open, setOpen] = React.useState(false)
    const [menuWidth, setMenuWidth] = React.useState('auto')
    const id = useRef(Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000)

    const toggleOpen = (openValue: boolean) => {
        if (openValue) {
            const width = document.querySelector(`.SelectTrigger-${id.current}`)?.clientWidth
            setMenuWidth(width ? `${width + 2 * (props.containerWidthPrefix || 0) }px` : 'auto')
        }
        setOpen(openValue)
    }

    return <RadixSelect.Root {...props} open={open} onOpenChange={(open) => {toggleOpen(open)}}>
        <RadixSelect.Trigger
            className={`SelectTrigger-${id.current} flex flex-row items-center justify-between w-full outline-0 ${className}`} aria-label={props.name || 'Select'}>
            { !!getValueLabel ?
                <RadixSelect.Value placeholder={placeholder || 'Select ...'} >{getValueLabel()}</RadixSelect.Value>
                : <RadixSelect.Value placeholder={placeholder || 'Select ...'} />
            }

            { !hideDropIcon &&
                <RadixSelect.Icon className="SelectIcon">
                    <i className="uil-angle-down text-2xl" />
                </RadixSelect.Icon>
            }
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
            <RadixSelect.Content className={`SelectContent z-[999] `}  style={{
                minWidth: menuWidth,
                marginLeft: props.containerWidthPrefix ? `${props.containerWidthPrefix * -1}px` : 'initial'
            }} position={'popper'}>
                <RadixSelect.ScrollUpButton className="SelectScrollButton flex flex-row justify-center">
                    <i className="uil-angle-up text-2xl" />
                </RadixSelect.ScrollUpButton>
                <RadixSelect.Viewport className="SelectViewport">
                    <RadixSelect.Group className="max-h-[200px]">
                        {
                            options.map((opt) => {
                                return <SelectItem key={opt.id} value={opt.id}>{getOptionLabel ? getOptionLabel(opt) : opt.label}</SelectItem>
                            })
                        }
                    </RadixSelect.Group>
                </RadixSelect.Viewport>
                <RadixSelect.ScrollDownButton className="SelectScrollButton flex flex-row justify-center">
                    <i className="uil-angle-down text-2xl" />
                </RadixSelect.ScrollDownButton>
            </RadixSelect.Content>
        </RadixSelect.Portal>
    </RadixSelect.Root>
}
