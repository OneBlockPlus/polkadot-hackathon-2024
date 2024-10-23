import React, {ReactNode, useContext, useEffect, useState} from 'react'
import Input from "@/components/Form/Input/Input"
import * as Dialog from '@radix-ui/react-dialog'
import Button from "@/components/Form/Button/Button"
import {checksumCkbAddress, shortTransactionHash} from "@/utils/common"
import BigNumber from "bignumber.js"
import Select from "@/components/Select/Select"
import CopyText from "@/components/CopyText/CopyText"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"


import * as dayjsLib from "dayjs"
import {helpers} from "@ckb-lumos/lumos";
import useSporeTransfer from "@/serves/useSporeTransfer";
import {Spores} from "@/utils/graphql/types";

const dayjs: any = dayjsLib

export interface XudtTransferProps {
    form: string,
    amount: string,
    to: string,
}

export default function DialogSporeTransfer({
                                                children,
                                                froms,
                                                spore,
                                                className
                                            }: {
    children: ReactNode,
    froms: string[],
    spore: Spores,
    className?: string
}) {
    const {build, send} = useSporeTransfer()
    const {network, config} = useContext(CKBContext)


    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<1 | 2>(1)
    const [feeRate, setFeeRate] = useState<1000 | 2000 | 3000>(1000)
    const [sending, setSending] = useState(false)
    const [txHash, setTxHash] = useState<null | string>(null)
    const [fee1000, setFee1000] = useState<string>('0')
    const [to, setTo] = useState<string>('')


    const fee = (showFeeRate: number) => {
        return BigNumber(fee1000).multipliedBy(showFeeRate / 1000).dividedBy(10 ** 8).toString()
    }

    //errors
    const [toError, setToError] = useState<string>('')
    const [transactionError, setTransactionError] = useState<string>('')

    const checkErrorsAndBuild = async () => {
        setToError('')
        let hasError = false

        const validAddress = checksumCkbAddress(to, network)
        if (to === '' || !validAddress) {
            setToError('Please enter a valid address')
            hasError = true
        }

        try {
            let tx: helpers.TransactionSkeletonType | null = null
            if (!hasError) {
                tx = await build({
                    payeeAddresses: froms,
                    to,
                    spore,
                    feeRate
                })

                if (!!tx) {
                    try {
                        const inputCap = tx.inputs.reduce((sum, input) => sum + Number(input.cellOutput.capacity), 0)
                        const outCap = tx.outputs.reduce((sum, input) => sum + Number(input.cellOutput.capacity), 0)
                        const fee = (inputCap - outCap) / (feeRate / 1000)
                        setFee1000(fee.toString())
                    } catch (e) {
                        console.error(e)
                    }
                }
            }

            return !hasError ? tx : null
        } catch (e: any) {
            console.trace(e)
            setTransactionError(e.message || '')
        }
    }

    useEffect(() => {
        setStep(1)
        setToError('')
        setFeeRate(1000)
        setTransactionError('')
        open && !!to && (async () => {
            try {
                setSending(true)
                await checkErrorsAndBuild()
            } finally {
                setSending(false)
            }
        })()
    }, [to, spore, open])

    const handleSignAndSend = async () => {
        setSending(true)
        setTransactionError('')
        try {
            const tx = await checkErrorsAndBuild()
            if (!tx) {
                return
            }

            const txHash = await send(tx!)
            setTxHash(txHash)
            setStep(2)
        } catch (e: any) {
            console.error(e)
            setTransactionError(e.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className={className}>
                {children}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay
                    className="bg-[rgba(0,0,0,0.6)] z-40 data-[state=open]:animate-overlayShow fixed inset-0"/>
                <Dialog.Content
                    className="data-[state=open]:animate-contentShow z-50 fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[90vw] w-full translate-x-[-50%] md:max-w-[450px] translate-y-[-50%] rounded-xl bg-white p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">

                    {step === 1 &&
                        <>
                            <div className="flex flex-row justify-between items-center mb-4">
                                <div className="font-semibold text-2xl">Transfer</div>
                                <div onClick={e => {
                                    setOpen(false)
                                }}
                                     className="flex flex-row items-center justify-center text-xl cursor-pointer h-[24px] w-[24px] rounded-full bg-gray-100">
                                    <i className="uil-times text-gray-500"/>
                                </div>
                            </div>


                            <div className="font-semibold mb-10">
                                <div className="mb-2">
                                    Send to
                                </div>
                                <Input value={to}
                                       type={"text"}
                                       onChange={e => {
                                           setTo(e.target.value.trim())
                                       }}/>
                                <div className="font-normal text-red-400 mt-1">{toError}</div>
                            </div>

                            <div className="mb-2 font-semibold">
                                Transaction fee
                            </div>
                            <Select
                                className={"bg-gray-100 py-2 px-4 rounded-lg text-sm"}
                                defaultValue={'1000'}
                                value={feeRate + ''}
                                options={[
                                    {id: '1000', label: `${fee(1000)} CKB (Slow: 1000 shannons/KB)`},
                                    {id: '2000', label: `${fee(2000)} CKB (Standard: 2000 shannons/KB)`},
                                    {id: '3000', label: `${fee(3000)} CKB (Fast: 3000 shannons/KB)`},
                                ]}
                                onValueChange={(value) => {
                                    setFeeRate(Number(value) as 1000 | 2000 | 3000)
                                }}
                            ></Select>

                            <div className="text-red-400 min-h-6 mb-2 break-words">{transactionError}</div>

                            <div className="mt-4">
                                <Button
                                    disabled={!to || !!toError}
                                    btntype={'primary'}
                                    loading={sending}
                                    onClick={handleSignAndSend}>
                                    Transfer
                                </Button>
                            </div>
                        </>
                    }

                    {step === 2 &&
                        <>
                            <div className="flex flex-row justify-center items-center mb-4 mt-2">
                                <svg width="73" height="72" viewBox="0 0 73 72" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_699_1259)">
                                        <circle cx="36.5" cy="36" r="36" fill="#41D195" fillOpacity="0.12"/>
                                        <path
                                            d="M37 19.3335C27.8167 19.3335 20.3333 26.8168 20.3333 36.0002C20.3333 45.1835 27.8167 52.6668 37 52.6668C46.1833 52.6668 53.6667 45.1835 53.6667 36.0002C53.6667 26.8168 46.1833 19.3335 37 19.3335ZM44.9667 32.1668L35.5167 41.6168C35.2833 41.8502 34.9667 41.9835 34.6333 41.9835C34.3 41.9835 33.9833 41.8502 33.75 41.6168L29.0333 36.9002C28.55 36.4168 28.55 35.6168 29.0333 35.1335C29.5167 34.6502 30.3167 34.6502 30.8 35.1335L34.6333 38.9668L43.2 30.4002C43.6833 29.9168 44.4833 29.9168 44.9667 30.4002C45.45 30.8835 45.45 31.6668 44.9667 32.1668Z"
                                            fill="#41D195"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_699_1259">
                                            <rect width="72" height="72" fill="white" transform="translate(0.5)"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <div className="font-semibold text-center text-lg">Transaction Sent !</div>
                            <div className="text-center text-sm">The transaction is sent and will be confirmed later
                            </div>

                            <div className="my-4 p-3 bg-gray-100 rounded-lg">
                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">To</div>
                                    <div className="font-semibold">{shortTransactionHash(to)}</div>
                                </div>
                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">Time</div>
                                    <div className="font-semibold">{dayjs().format("YYYY-MM-DD HH:mm")}</div>
                                </div>

                                <div className="h-[1px] bg-gray-200 my-4"/>

                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">Transaction fee</div>
                                    <div className="font-semibold">{fee(feeRate)} CKB</div>
                                </div>

                                <div className="h-[1px] bg-gray-200 my-4"/>

                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">Tx Hash</div>
                                    <div className="font-semibold flex flex-row">
                                        <CopyText copyText={txHash || ''}>
                                            {txHash ? shortTransactionHash(txHash) : '--'}
                                        </CopyText>

                                    </div>
                                </div>
                            </div>

                            <div className="flex">
                                <Button btntype={'secondary'}
                                        className={"mr-4 text-xs"}
                                        loading={sending}
                                        onClick={e => {
                                            window.open(`${config.explorer}/transaction/${txHash}`, '_blank')
                                        }}>
                                    View on Explorer
                                </Button>

                                <Button btntype={'primary'}
                                        loading={sending}
                                        onClick={e => {
                                            setOpen(false)
                                        }}>
                                    Done
                                </Button>
                            </div>
                        </>
                    }
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
