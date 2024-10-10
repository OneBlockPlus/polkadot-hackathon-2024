import React, {useContext, useEffect, useMemo, useState, ReactNode} from 'react'
import Input from "@/components/Form/Input/Input"
import * as Dialog from '@radix-ui/react-dialog'
import Button from "@/components/Form/Button/Button"
import {isBtcAddress, shortTransactionHash} from "@/utils/common"
import BigNumber from "bignumber.js"
import {toDisplay} from "@/utils/number_display"
import CopyText from "@/components/CopyText/CopyText"
import TokenIcon from "@/components/TokenIcon/TokenIcon"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import useBtcXudtTransfer from "@/serves/useBtcXudtTransfer"
import useBtcWallet from "@/serves/useBtcWallet"


import * as dayjsLib from "dayjs"
import {TokenInfoWithAddress} from "@/utils/graphql/types"
import useLayer1Assets from "@/serves/useLayer1Assets"
import {TokenBalance} from "@/components/ListToken/ListToken"

const dayjs: any = dayjsLib

export interface XudtTransferProps {
    form: string,
    amount: string,
    to: string,
}

export default function DialogBtcXudtTransfer({
                                                  children,
                                                  className,
                                                  token
                                              }: { children: ReactNode,  token: TokenInfoWithAddress, className?: string }) {
    const {signAndSend} = useBtcXudtTransfer()
    const {config, internalAddress, network} = useContext(CKBContext)
    const [open, setOpen] = useState(false)
    const {feeRate} = useBtcWallet()

    const btcAddress = useMemo(() => {
        if (!internalAddress) return undefined
        return isBtcAddress(internalAddress, network === 'mainnet') ? internalAddress : undefined
    }, [internalAddress])

    const {xudts, status} = useLayer1Assets((open && !!btcAddress ? btcAddress : undefined))

    const xudtBalance = useMemo<TokenBalance>(() => {
        const target = xudts?.find(x => x.symbol === token.symbol)
        return target || {
            ...token,
            amount: '0',
            type: 'xudt',
            chain: 'btc'
        }
    }, [token, xudts])

    const [formData, setFormData] = useState<XudtTransferProps>({
        form: "",
        amount: "",
        to: "",
    });

    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [sending, setSending] = useState(false)
    const [txHash, setTxHash] = useState<null | string>(null)
    const [btcFeeRate, setBtcFeeRate] = useState<number>(feeRate)

    //errors
    const [toError, setToError] = useState<string>('')
    const [fromError, setFromError] = useState<string>('')
    const [amountError, setAmountError] = useState<string>('')
    const [transactionError, setTransactionError] = useState<string>('')

    const checkErrorsAndBuild = async () => {
        let hasError = false

        if (!internalAddress) {
            setFromError('Invalid from address')
            hasError = true
        } else if (!isBtcAddress(internalAddress, network === 'mainnet')) {
            setFromError('Invalid from address')
            hasError = true
        } else {
            setFromError('')
        }

        if (formData.to === '') {
            setToError('Please enter a valid address')
            hasError = true
        } else if (!isBtcAddress(formData.to, network === 'mainnet')) {
            setToError('Invalid BTC address')
            hasError = true
        } else {
            setToError('')
        }

        if (formData.amount === '') {
            setAmountError('Please enter a valid amount')
            hasError = true
        } else if (BigNumber(formData.amount).multipliedBy(10 ** token.decimal).gt(xudtBalance ? xudtBalance.amount : 0)) {
            setAmountError('Insufficient balance')
            hasError = true
        } else if (BigNumber(formData.amount).eq(0)) {
            setAmountError('Please enter a valid amount')
            hasError = true
        } else {
            setAmountError('')
        }

        return !hasError

    }

    const setMaxAmount = () => {
        setFormData({
            ...formData,
            amount: xudtBalance ? BigNumber(xudtBalance.amount).dividedBy(10 ** token.decimal).toString() : '0'
        })
    }

    const handleTransfer = async () => {
        try {
            const check = await checkErrorsAndBuild()
            if (check) {
                setStep(2)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const HandleSignAndSend = async () => {
        const amount = BigNumber(formData.amount).multipliedBy(10 ** token.decimal).toString()
        setSending(true)
        setTransactionError('')
        try {
          const tx = await signAndSend({
                from: btcAddress!,
                to: formData.to,
                amount: amount,
                args: token.address.script_args,
                feeRate: btcFeeRate
            })
            setTxHash(tx)
            setStep(3)
        } catch (e: any) {
            setTransactionError(e.message)
        } finally {
            setSending(false)
        }
    }

    useEffect(() => {
        setStep(1)
    }, [open])

    useEffect(() => {
        setAmountError('')
        setToError('')
        setTransactionError('')
        setSending(false)
    }, [step])

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

                            <div className="font-semibold mb-4">
                                <div className="mb-2">
                                    From
                                </div>
                                <Input value={internalAddress}
                                       type={"text"}
                                       disabled
                                />
                                <div className="font-normal text-red-400 mt-1 break-words">{fromError}</div>
                            </div>


                            <div className="font-semibold mb-10">
                                <div className="mb-2">
                                    Send to
                                </div>
                                <Input value={formData.to}
                                       placeholder={'Recipient address'}
                                       type={"text"}
                                       onChange={e => {
                                           setFormData({...formData, to: e.target.value})
                                       }}/>
                                <div className="font-normal text-red-400 mt-1 break-words">{toError}</div>
                            </div>

                            <div className="font-semibold mb-10">
                                <div className="mb-2">
                                    Asset
                                </div>
                                <Input startIcon={<TokenIcon size={32} symbol={token.symbol}/>}
                                       value={token.symbol}
                                       type={"text"}
                                       disabled/>
                            </div>

                            <div className="font-semibold mb-10">
                                <div className="mb-2 flex-row flex items-center justify-between">
                                    <div>Amount</div>
                                    <div className="font-normal"><span
                                        className="text-gray-500">Balance:</span> {xudtBalance ? toDisplay(xudtBalance.amount, xudtBalance.decimal, true) : '--'}
                                    </div>
                                </div>
                                <Input value={formData.amount}
                                       placeholder={'Transfer amount'}
                                       type={"number"}
                                       onChange={e => {
                                           setFormData({...formData, amount: e.target.value})
                                       }}
                                       endIcon={<div className="cursor-pointer text-[#6CD7B2]"
                                                     onClick={setMaxAmount}>Max</div>}
                                />
                                <div className="font-normal text-red-400 mt-1 break-words">{amountError}</div>
                            </div>

                            <Button btntype={'primary'}
                                    loading={status === 'loading' || sending}
                                    onClick={handleTransfer}>
                                Continue
                            </Button>
                        </>
                    }


                    {
                        step === 2 &&
                        <>
                            <div className="flex flex-row justify-between items-center mb-4">
                                <div className="font-semibold text-2xl">Sign Transaction</div>
                                <div onClick={e => {
                                    setOpen(false)
                                }}
                                     className="flex flex-row items-center justify-center text-xl cursor-pointer h-[24px] w-[24px] rounded-full bg-gray-100">
                                    <i className="uil-times text-gray-500"/>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-2 font-semibold">
                                    Send Token
                                </div>
                                <div
                                    className="flex flex-row flex-nowrap justify-between items-center text-sm mb-4">
                                    <div className="flex flex-row flex-nowrap items-center">
                                        <TokenIcon size={18} symbol={token.symbol}/>
                                        {token.symbol}
                                    </div>
                                    <div>{formData.amount} {token.symbol}</div>
                                </div>

                                <div className="flex flex-row flex-nowrap justify-between items-center text-sm mb-4">
                                    <div className="flex flex-row flex-nowrap items-center">
                                        From Address
                                    </div>
                                    <div>{shortTransactionHash(internalAddress!)}</div>
                                </div>

                                <div className="flex flex-row flex-nowrap justify-between items-center text-sm mb-4">
                                    <div className="flex flex-row flex-nowrap items-center">
                                        To Address
                                    </div>
                                    <div>{shortTransactionHash(formData.to)}</div>
                                </div>

                                <div className="flex flex-row flex-nowrap justify-between items-center mb-4 text-sm">
                                    <div className="flex flex-row flex-nowrap items-center">
                                        BTC Fee Rate
                                    </div>
                                    <div className="flex flex-row items-center">
                                        <Input value={btcFeeRate}
                                               className={'w-[100px] text-center font-semibold'}
                                               type={"number"}
                                               placeholder={'fee rate'}
                                               onChange={e => {
                                                   setBtcFeeRate(Number(e.target.value))
                                               }}
                                        />
                                        <span className="ml-2">Sat/vB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-red-400 min-h-6 mb-2 break-words">{transactionError}</div>

                            <div className="flex flex-row">
                                <Button btntype={'secondary'}
                                        className="mr-4"
                                        loading={status === 'loading'}
                                        onClick={e => {
                                            setStep(1)
                                        }}>
                                    Cancel
                                </Button>
                                <Button btntype={'primary'}
                                        loading={sending}
                                        onClick={HandleSignAndSend}>
                                    Transfer
                                </Button>
                            </div>

                        </>
                    }

                    {
                        step === 3 &&
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
                                    <div className="font-semibold">{shortTransactionHash(formData.to)}</div>
                                </div>
                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">Time</div>
                                    <div className="font-semibold">{dayjs().format("YYYY-MM-DD HH:mm")}</div>
                                </div>

                                <div className="h-[1px] bg-gray-200 my-4"/>

                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">Amount</div>
                                    <div className="font-semibold">{formData.amount} {token.symbol}</div>
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
                                            window.open(`${config.btc_explorer}/tx/${txHash}`, '_blank')
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
