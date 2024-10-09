import React, {useContext, useEffect, useMemo} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import useLayer1Assets from "@/serves/useLayer1Assets"
import {bitcoin} from "@rgbpp-sdk/btc"
import {TokenBalance} from "@/components/ListToken/ListToken"
import {LangContext} from "@/providers/LangProvider/LangProvider"
import Input from "@/components/Form/Input/Input"
import TokenIcon from "@/components/TokenIcon/TokenIcon"
import {toDisplay} from "@/utils/number_display"
import Button from "@/components/Form/Button/Button"
import {XudtTransferProps} from "@/components/Dialogs/DialogXudtTransfer/DialogXudtTransfer"
import BigNumber from "bignumber.js"
import {checksumCkbAddress, shortTransactionHash} from "@/utils/common"
import ProfileAddresses from "@/components/ProfileAddresses/ProfileAddresses"
import useLeapXudtToLayer2 from "@/serves/useLeapXudtToLayer2"
import * as dayjsLib from "dayjs"
import CopyText from "@/components/CopyText/CopyText"
import useBtcWallet from "@/serves/useBtcWallet"

const dayjs: any = dayjsLib

export default function DialogLeapXudtToLayer2({children, token, className}: {
    children: React.ReactNode,
    token: TokenBalance,
    className?: string
}) {
    const {network, internalAddress, config} = useContext(CKBContext)
    const {build, leap} = useLeapXudtToLayer2()
    const {lang} = useContext(LangContext)
    const {feeRate} = useBtcWallet()


    const [open, setOpen] = React.useState(false)
    const [step, setStep] = React.useState(1)
    const [btctxHash, setBtCtxHash] = React.useState<string>('')
    const [tx, setTx] = React.useState<bitcoin.Psbt | null>(null)
    const [busy, setBusy] = React.useState(false)
    const [btcFeeRate, setBtcFeeRate] = React.useState(feeRate)

    const [formData, setFormData] = React.useState<XudtTransferProps>({
        form: "",
        amount: "",
        to: "",
    })

    //errors
    const [toError, setToError] = React.useState<string>('')
    const [buildError, setBuildError] = React.useState<string>('')
    const [amountError, setAmountError] = React.useState<string>('')
    const [transactionError, setTransactionError] = React.useState<string>('')

    const {xudts: xudtsBalance, status: xudtsBalanceStatus} = useLayer1Assets(open ? internalAddress : undefined)

    const balance = useMemo(() => {
        if (xudtsBalanceStatus !== 'complete') {
            return '0'
        }

        const targetToken = xudtsBalance.find(t => t.type_id === token.type_id)
        return !!token ? token.amount : '0'
    }, [xudtsBalance, xudtsBalanceStatus, token])

    useEffect(() => {
        if (open) {
            setStep(1)
            setBtCtxHash('')
            setTx(null)
            setToError('')
            setAmountError('')
            setTransactionError('')
            setBuildError('')
        }
    }, [open])

    const setMaxAmount = () => {
        setFormData({
            ...formData,
            amount: balance ? BigNumber(balance).dividedBy(10 ** token.decimal).toString() : '0'
        })
    }

    const checkAndBuild = async () => {
        if (formData.to === '') {
            setToError('Please enter a valid address')
            return
        } else if (!checksumCkbAddress(formData.to, network)) {
            setToError('Invalid CKB address')
            return
        } else {
            setToError('')
        }

        if (formData.amount === '') {
            setAmountError('Please enter a valid amount')
            return
        } else if (BigNumber(formData.amount).multipliedBy(10 ** token.decimal).gt(balance ? balance : 0)) {
            setAmountError('Insufficient balance')
            return
        } else if (BigNumber(formData.amount).eq(0)) {
            setAmountError('Please enter a valid amount')
            return
        } else {
            setAmountError('')
        }

        setBusy(true)
        setBuildError('')
        try {
            const tx = await build({
                fromBtcAccount: internalAddress!,
                toCkbAddress: formData.to,
                xudtArgs: token.address.script_args.replace('\\', '0'),
                amount: BigNumber(formData.amount).multipliedBy(10 ** token.decimal).toString()
            })

            console.log('tx', tx)
            setTx(tx)
            setStep(2)
        } catch (e: any) {
            setBuildError(e.message || 'Failed to build transaction')
        } finally {
            setBusy(false)
        }
    }

    const handleLeap = async () => {
        setBusy(true)
        setTransactionError('')
        try {
            const txResult = await leap({
                fromBtcAccount: internalAddress!,
                toCkbAddress: formData.to,
                xudtArgs: token.address.script_args.replace('\\', '0'),
                amount: BigNumber(formData.amount).multipliedBy(10 ** token.decimal).toString(),
                feeRate: btcFeeRate
            })
            console.log('txResult', txResult)

            if (!txResult.btcTxId) {
                throw new Error('btc transaction failed')
            }

            setBtCtxHash(txResult.btcTxId)
            setStep(3)
        } catch (e: any) {
            console.error(e)
            setTransactionError(e.message || 'Failed to leap')
        } finally {
            setBusy(false)
        }
    }


    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={className}>
            {children}
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay
                className="bg-[rgba(0,0,0,0.6)] z-40 data-[state=open]:animate-overlayShow fixed inset-0"/>
            <Dialog.Content
                className="data-[state=open]:animate-contentShow z-50 fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[90vw] w-full translate-x-[-50%] md:max-w-[450px] translate-y-[-50%] rounded-xl bg-white p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">

                {step === 1 && <>
                    <div className="flex flex-row justify-between items-center mb-4">
                        <div className="font-semibold text-2xl">{lang['Leap_l1_to_l2']}</div>
                        <div onClick={e => {
                            setOpen(false)
                        }}
                             className="flex flex-row items-center justify-center text-xl cursor-pointer h-[24px] w-[24px] rounded-full bg-gray-100">
                            <i className="uil-times text-gray-500"/>
                        </div>
                    </div>

                    <div className="font-semibold mb-10">
                        <div className="mb-2">
                            Leap to
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
                                className="text-gray-500"> Balance:</span> {balance ? toDisplay(balance, token.decimal, true) : '--'}
                            </div>
                        </div>
                        <Input value={formData.amount}
                               type={"number"}
                               placeholder={'Transfer amount'}
                               onChange={e => {
                                   setFormData({...formData, amount: e.target.value})
                               }}
                               endIcon={<div className="cursor-pointer text-[#6CD7B2]"
                                             onClick={setMaxAmount}>Max</div>}
                        />
                        <div className="font-normal text-red-400 mt-1 break-words">{amountError}</div>
                    </div>

                    <div className="font-normal text-red-400 mb-1 break-words">{buildError}</div>

                    <Button btntype={'primary'}
                            onClick={checkAndBuild}
                            loading={xudtsBalanceStatus === 'loading' || busy}>
                        Continue
                    </Button>
                </>
                }

                {step === 2 &&
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

                        <div className="mb-10 mt-10">
                            <div className="flex flex-row flex-nowrap justify-between items-center mb-4 text-sm">
                                <div className="flex flex-row flex-nowrap items-center">
                                    <TokenIcon size={18} symbol={token.symbol}/>
                                    {token.symbol}
                                </div>
                                <div>{formData.amount} {token.symbol}</div>
                            </div>

                            <div className="flex flex-row flex-nowrap justify-between items-center mb-4 text-sm">
                                <div className="flex flex-row flex-nowrap items-center">
                                    From
                                </div>
                                {
                                    internalAddress ?
                                        <ProfileAddresses addresses={[internalAddress]}
                                                          defaultAddress={internalAddress}/>
                                        : <div>--</div>
                                }
                            </div>

                            <div className="flex flex-row flex-nowrap justify-between items-center mb-4 text-sm">
                                <div className="flex flex-row flex-nowrap items-center">
                                    Leap To
                                </div>
                                {
                                    internalAddress ?
                                        <ProfileAddresses addresses={[formData.to]} defaultAddress={formData.to}/>
                                        : <div>--</div>
                                }
                            </div>

                            <div className="flex flex-row flex-nowrap justify-between items-center mb-4 text-sm">
                                <div className="flex flex-row flex-nowrap items-center">
                                    {lang['Fee_Rate']}
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
                                    onClick={e => {
                                        setStep(1)
                                    }}>
                                Cancel
                            </Button>
                            <Button btntype={'primary'}
                                    loading={busy}
                                    onClick={handleLeap}
                            >
                                Leap
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
                        <div className="font-semibold text-center text-lg">Transactions Sent !</div>
                        <div className="text-center text-sm">The leap action will be completed after this transaction has been confirmed by more than <b>6 blocks</b></div>

                        <div className="my-4 p-3 bg-gray-100 rounded-lg">
                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">From</div>
                                <div className="font-semibold">{
                                    internalAddress ?
                                        <ProfileAddresses addresses={[internalAddress]}
                                                          defaultAddress={internalAddress}/>
                                        : '--'
                                }</div>
                            </div>
                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">Leap to</div>
                                <div className="font-semibold">{
                                    formData.to ?
                                        <ProfileAddresses addresses={[formData.to]}
                                                          defaultAddress={formData.to}/>
                                        : '--'
                                }</div>
                            </div>
                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">Time</div>
                                <div className="font-semibold">{dayjs().format("YYYY-MM-DD HH:mm")}</div>
                            </div>

                            <div className="h-[1px] bg-gray-200 my-4"/>

                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">Amount</div>
                                <div className="font-semibold">{formData.amount || '--'} {token.symbol}</div>
                            </div>

                            <div className="h-[1px] bg-gray-200 my-4"/>

                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">BTC Tx Hash</div>
                                <div className="font-semibold flex flex-row">
                                    <CopyText copyText={btctxHash || ''}>
                                        {btctxHash ? shortTransactionHash(btctxHash) : '--'}
                                    </CopyText>
                                </div>
                            </div>
                        </div>

                        <div className="flex">
                            <Button btntype={'secondary'}
                                    className={"mr-4 text-xs"}
                                    onClick={e => {
                                        window.open(`${config.btc_explorer}/tx/${btctxHash}`, '_blank')
                                    }}>
                                View on Explorer
                            </Button>
                            <Button btntype={'primary'}
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
}
