import {useUtxoSwap} from "@/serves/useUtxoSwap"
import {Pool, Token} from '@utxoswap/swap-sdk-js'
import * as Dialog from '@radix-ui/react-dialog'
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react"
import Input from "@/components/Form/Input/Input"
import Select, {SelectOption} from "@/components/Select/Select"
import TokenIcon from "@/components/TokenIcon/TokenIcon"
import useCkbBalance from "@/serves/useCkbBalance"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {getXudtBalance} from "@/serves/useXudtBalance"
import {Collector} from "@/libs/rgnpp_collector/index"
import {toDisplay} from "@/utils/number_display"
import Button from "@/components/Form/Button/Button"
import BigNumber from "bignumber.js"
import {TransactionLike} from '@ckb-ccc/core'
import {Transaction as CCCTransaction} from '@ckb-ccc/connector-react'
import {append0x} from '@rgbpp-sdk/ckb'
import {shortTransactionHash} from "@/utils/common"
import CopyText from "@/components/CopyText/CopyText"

import * as dayjsLib from "dayjs"

const dayjs: any = dayjsLib

const ckb: Token = {
    decimals: 8,
    name: 'CKB',
    symbol: 'CKB',
    typeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    logo: 'https://storage.utxoswap.xyz/images/ckb.png'
}


export default function DialogSwap({children, className, sellToken, onOpen}: {
    className?: string,
    sellToken?: string,
    children: React.ReactNode,
    onOpen?: () => any
}) {
    const {address, addresses, network, config, open: login, signer} = useContext(CKBContext)

    const {pools, client, collector, supportTokens} = useUtxoSwap()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [busy, setBusy] = useState(false)

    const {data: ckbBalence, status: ckbBalenceStatus} = useCkbBalance(addresses)

    const [swapConfig, setSwapConfig] = useState({
        slippage: '0.5',
        networkFeeRate: 5000
    })

    const [txErr, setTxErr] = useState<string>('')
    const [txHash, setTxHash] = useState<string>('')


    const [swapForm, setSwapForm] = useState<{
        pool: Pool | null,
        selectedX: Token | null,
        amountX: string,
        selectedY: Token | null,
        amountY: string
    }>({
        pool: null,
        selectedX: null,
        amountX: '',
        selectedY: null,
        amountY: ''
    })

    // useEffect(() => {
    //     console.log('swapForm =>', swapForm)
    // }, [swapForm]);

    const swapFromOptions = useMemo<SelectOption[]>(() => {
        if (!pools || !pools.length) return []

        let tokens: Token[] = []

        if (!!swapForm.selectedY) {
            const list = pools.filter(pool => pool.assetX.typeHash === swapForm.selectedY!.typeHash || pool.assetY.typeHash === swapForm.selectedY!.typeHash)
            list.forEach(pool => {
                tokens.push(pool.assetX.typeHash === swapForm.selectedY!.typeHash ? pool.assetY : pool.assetX)
            })
        } else {
            pools.forEach(pool => {
                if (tokens.find(t => t.typeHash === pool.assetX.typeHash) === undefined) {
                    tokens.push(pool.assetX)
                }
                if (tokens.find(t => t.typeHash === pool.assetY.typeHash) === undefined) {
                    tokens.push(pool.assetY)
                }
            })
        }

        return tokens.map(t => (
            {
                id: t.typeHash,
                label: t.symbol,
                token: t
            }
        ))
    }, [pools, swapForm.selectedY])

    const swapToOptions = useMemo<SelectOption[]>(() => {
        if (!pools || !pools.length) return []

        let tokens: Token[] = []

        if (!!swapForm.selectedX) {
            const list = pools.filter(pool => pool.assetX.typeHash === swapForm.selectedX!.typeHash || pool.assetY.typeHash === swapForm.selectedX!.typeHash)
            list.forEach(pool => {
                tokens.push(pool.assetX.typeHash === swapForm.selectedX!.typeHash ? pool.assetY : pool.assetX)
            })
        } else {
            pools.forEach(pool => {
                if (tokens.find(t => t.typeHash === pool.assetX.typeHash) === undefined) {
                    tokens.push(pool.assetX)
                }
                if (tokens.find(t => t.typeHash === pool.assetY.typeHash) === undefined) {
                    tokens.push(pool.assetY)
                }
            })
        }

        return tokens.map(t => (
            {
                id: t.typeHash,
                label: t.symbol,
                token: t
            }
        ))
    }, [pools, swapForm.selectedX])


    const handleReverse = useCallback(() => {
        setSwapForm({
            ...swapForm,
            selectedX: swapForm.selectedY,
            selectedY: swapForm.selectedX,
            amountX: '',
            amountY: '',
            pool: null
        })
    }, [swapForm])

    const [tokenXBalence, setTokenXBalence] = useState<string>('0')
    const [tokenYBalence, setTokenYBalence] = useState<string>('0')

    useEffect(() => {
        if (!swapForm.selectedX ||
            swapForm.selectedX?.typeHash === ckb.typeHash ||
            !addresses ||
            !addresses.length) {
            setTokenXBalence('0')
            return
        }

        (async () => {
            try {
                setBusy(true)
                const collector = new Collector({
                    ckbNodeUrl: config.ckb_rpc,
                    ckbIndexerUrl: config.ckb_indexer!,
                })
                const type = swapForm.selectedX?.typeScript!
                const balance = await getXudtBalance(addresses, type, collector)
                console.log('token X balance', balance)
                setTokenXBalence(balance)
            } finally {
                setBusy(false)
            }
        })()
    }, [network, swapForm.selectedX, addresses, config])


    useEffect(() => {
        if (!swapForm.selectedY ||
            swapForm.selectedY?.typeHash === ckb.typeHash ||
            !addresses ||
            !addresses.length) {
            setTokenYBalence('0')
            return
        }

        (async () => {
            try {
                setBusy(true)
                const collector = new Collector({
                    ckbNodeUrl: config.ckb_rpc,
                    ckbIndexerUrl: config.ckb_indexer!,
                })
                const type = swapForm.selectedY?.typeScript!
                const balance = await getXudtBalance(addresses, type, collector)
                console.log('token Y balance', balance)
                setTokenYBalence(balance)
            } finally {
                setBusy(false)
            }
        })()

    }, [network, swapForm.selectedY, addresses, config])

    const isValidNumber = (value: string) => {
        return !isNaN(Number(value))
            && Number(value) >= 0
    }

    const disableSwap = useMemo(() => {
        if (!swapForm.selectedX
            || !swapForm.selectedY
            || !swapForm.amountX
            || !isValidNumber(swapForm.amountX)
            || !swapForm.amountY
        ) return true

        if (swapForm.selectedX.symbol === 'CKB' && parseFloat(swapForm.amountX) * 10 ** swapForm.selectedX!.decimals > parseFloat(ckbBalence?.amount || '0')) return true
        if (swapForm.selectedX.symbol !== 'CKB' && parseFloat(swapForm.amountX) * 10 ** swapForm.selectedX!.decimals > parseFloat(tokenXBalence)) return true

    }, [ckbBalence?.amount, swapForm.amountX, swapForm.amountY, swapForm.selectedX, swapForm.selectedY, tokenXBalence])


    useEffect(() => {
        if (!!swapForm.selectedX && !!swapForm.selectedY && !!address) {
            const tokens: [Token, Token] = [swapForm.selectedX, swapForm.selectedY];
            setBusy(true)

            const poolInfo = pools.find(pool => {
                return (pool.assetX.typeHash === tokens[0].typeHash && pool.assetY.typeHash === tokens[1].typeHash) ||
                    (pool.assetX.typeHash === tokens[1].typeHash && pool.assetY.typeHash === tokens[0].typeHash)
            })

            const newPool = new Pool({
                tokens,
                ckbAddress: address,
                collector,
                client,
                poolInfo: poolInfo!,
            })

            const newForm = {
                ...swapForm,
                pool: newPool
            }

            setTimeout(() => {
                setSwapForm(newForm)
                setBusy(false)
            }, 100)
        } else {
            setSwapForm({
                ...swapForm,
                pool: null
            })
        }
    }, [swapForm.selectedX, swapForm.selectedY, address])

    useEffect(() => {
        if (!!swapForm.pool && !!swapForm.amountX) {
            if (!isValidNumber(swapForm.amountX)) {
                setSwapForm({
                    ...swapForm,
                    amountY: ''
                })
                return
            }

            const {output, priceImpact, buyPrice} = swapForm.pool.calculateOutputAmountAndPriceImpactWithExactInput(
                swapForm.amountX
            );

            setSwapForm({
                ...swapForm,
                amountY: output
            })
        } else {
            setSwapForm({
                ...swapForm,
                amountY: ''
            })
        }
    }, [swapForm.pool, swapForm.amountX]);

    const price = useMemo(() => {
        if (swapForm.amountY && swapForm.amountX) {
            return BigNumber(swapForm.amountY).div(swapForm.amountX).toFixed(swapForm.selectedY!.decimals || 8)
        } else {
            return '0'
        }
    }, [swapForm.amountX, swapForm.amountY, swapForm.selectedY])

    useEffect(() => {
        if (open) {
            let initToken: Token | undefined = undefined
            if (sellToken && supportTokens.length) {
                initToken = supportTokens.find(t => t.typeHash === sellToken) as any
            }

            setSwapForm({
                pool: null,
                selectedX: initToken || ckb,
                amountX: '',
                selectedY: null,
                amountY: ''
            })
            setTxErr('')
            setBusy(false)
            setStep(1)
            onOpen && onOpen()
        }
    }, [open, sellToken, supportTokens])

    const signTxFunc = async (rawTx: CKBComponents.RawTransactionToSign) => {
        const txLike = await signer!.signTransaction(rawTx as any);
        return transactionFormatter(txLike);
    }

    const handleSwap = async () => {
        if (!signer) return

        setTxErr('')
        setBusy(true)
        try {
            const intentTxHash = await swapForm.pool!.swapWithExactInput(
                signTxFunc,
                swapConfig.slippage,
                swapConfig.networkFeeRate
            )

            setTxHash(intentTxHash || '')
            setStep(2)
        } catch (e: any) {
            console.error(e)
            setTxErr(e.message)
        } finally {
            setBusy(false)
        }
    }

    const handleSetMax = () => {
        if (swapForm.selectedX?.symbol === 'CKB') {
            setSwapForm({
                ...swapForm,
                amountX: toDisplay(ckbBalence?.amount || '0', 8)
            })
        } else {
            setSwapForm({
                ...swapForm,
                amountX: toDisplay(tokenXBalence, swapForm.selectedX!.decimals)
            })
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className={className}>
                {children}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay
                    className="bg-[rgba(0,0,0,0.6)] z-40 data-[state=open]:animate-overlayShow fixed inset-0"/><Dialog.Content
                className="data-[state=open]:animate-contentShow z-50 fixed top-[50%] left-[50%] max-h-[98vh]  max-w-[98vw] w-full translate-x-[-50%] md:max-w-[450px] translate-y-[-50%] rounded-xl bg-white p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                {step === 1 && <>
                    <div className="flex flex-row justify-between items-center mb-4">
                        <div className="font-semibold text-2xl">Swap</div>
                        <div onClick={e => {
                            setOpen(false)
                        }}
                             className="flex flex-row items-center justify-center text-xl cursor-pointer h-[24px] w-[24px] rounded-full bg-gray-100">
                            <i className="uil-times text-gray-500"/>
                        </div>
                    </div>

                    <div className="flex flex-col relative">
                        <div onClick={handleReverse}
                             style={{boxShadow: '0px 1.988px 18px 0px rgba(0, 0, 0, 0.10)'}}
                             className="bg-white left-[50%] top-[50%] ml-[-20px] mt-[-30px] absolute cursor-pointer w-10 h-10 flex flex-row justify-center items-center rounded-full">
                            <i className="uil-arrow-down"/>
                        </div>

                        <div className="flex flex-col py-5 border rounded-2xl mb-4">
                            <div className="flex flex-row items-center justify-between mb-2 px-5">
                                <div className="text-lg font-semibold text-[#7B7C7B]">Sell</div>
                                <div className="text-sm">
                                    Balance: <span className="font-semibold">
                                            {swapForm.selectedX ?
                                                (swapForm.selectedX?.symbol === 'CKB'
                                                    ? toDisplay(ckbBalence?.amount || '0', 8)
                                                    : toDisplay(tokenXBalence, swapForm.selectedX.decimals))
                                                : '--'
                                            }
                                        </span>
                                    <span
                                        onClick={handleSetMax}
                                        className="font-semibold cursor-pointer text-[#6cd7b2] ml-2">MAX</span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center px-5 justify-between">
                                <div className="flex-1 font-semibold text-base max-w-[50%] md:max-w-[100%]">
                                    <Input
                                        type="number"
                                        className="bg-[#fff] pl-0"
                                        value={swapForm.amountX}
                                        onChange={e => {
                                            setSwapForm({
                                                ...swapForm,
                                                amountX: e.target.value
                                            })
                                        }}
                                        placeholder={'0'}/>
                                </div>
                                <div
                                    className="bg-gray-100 px-3 py-3 rounded-xl flex-1 text-nowrap min-w-[120px]  md:min-w-[160px] grow-0">
                                    <Select
                                        value={swapForm.selectedX?.typeHash}
                                        options={swapFromOptions}
                                        placeholder={'Select...'}
                                        getValueLabel={() => {
                                            if (!swapForm.selectedX) return undefined
                                            return <div className="flex flex-row items-center">
                                                {!!swapForm.selectedX!.logo ?
                                                    <img className="w-5 h-5 rounded-full mr-3"
                                                         src={swapForm.selectedX!.logo}
                                                         alt=""/>
                                                    : <TokenIcon symbol={swapForm.selectedX!.symbol} size={20}/>
                                                }

                                                <div>{swapForm.selectedX!.symbol}</div>
                                            </div>
                                        }}
                                        getOptionLabel={(opt) => {
                                            return <div className="flex flex-row items-center">
                                                {!!opt.token.logo ?
                                                    <img className="w-5 h-5 rounded-full mr-3"
                                                         src={opt.token.logo}
                                                         alt=""/>
                                                    : <TokenIcon symbol={opt.token.symbol} size={20}/>
                                                }

                                                <div>{opt.token.symbol}</div>
                                            </div>
                                        }}
                                        onValueChange={(value) => {
                                            setSwapForm({
                                                ...swapForm,
                                                selectedX: swapFromOptions.find(opt => opt.id === value)?.token || null
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col py-5 border rounded-2xl mb-4">
                            <div className="flex flex-row items-center justify-between mb-2 px-5">
                                <div className="text-lg font-semibold text-[#7B7C7B]">Buy</div>
                                <div className="text-sm">
                                    Balance: <span className="font-semibold">
                                            {swapForm.selectedY ?
                                                (swapForm.selectedY?.symbol === 'CKB'
                                                    ? toDisplay(ckbBalence?.amount || '0', 8)
                                                    : toDisplay(tokenYBalence, swapForm.selectedY.decimals))
                                                : '--'
                                            }
                                        </span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center px-5 justify-between">
                                <div className="flex-1 font-semibold text-base max-w-[50%] md:max-w-[100%]">
                                    <Input
                                        disabled={true}
                                        className="pl-0 bg-[#fff]"
                                        type="number"
                                        value={swapForm.amountY}
                                        placeholder={'0'}/>
                                </div>
                                <div
                                    className="bg-gray-100 px-3 py-3 rounded-xl flex-1 text-nowrap min-w-[120px]  md:min-w-[160px] grow-0">
                                    <Select
                                        value={swapForm.selectedY?.typeHash}
                                        options={swapToOptions}
                                        placeholder={'Select...'}
                                        getValueLabel={() => {
                                            if (!swapForm.selectedY) return undefined
                                            return <div className="flex flex-row items-center">
                                                {!!swapForm.selectedY!.logo ?
                                                    <img className="w-5 h-5 rounded-full mr-3"
                                                         src={swapForm.selectedY!.logo}
                                                         alt=""/>
                                                    : <TokenIcon symbol={swapForm.selectedY!.symbol} size={20}/>
                                                }
                                                <div>{swapForm.selectedY!.symbol}</div>
                                            </div>
                                        }}
                                        getOptionLabel={(opt) => {
                                            return <div className="flex flex-row items-center">
                                                {!!opt.token.logo ?
                                                    <img className="w-5 h-5 rounded-full mr-3"
                                                         src={opt.token.logo}
                                                         alt=""/>
                                                    : <TokenIcon symbol={opt.token.symbol} size={20}/>
                                                }

                                                <div>{opt.token.symbol}</div>
                                            </div>
                                        }}
                                        onValueChange={(value) => {
                                            setSwapForm({
                                                ...swapForm,
                                                selectedY: swapToOptions.find(opt => opt.id === value)?.token || null
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {!address &&
                        <Button
                            btntype={'primary'}
                            onClick={() => {
                                login();
                                setOpen(false)
                            }}
                        >Connect Wallet</Button>
                    }

                    {!!txErr &&
                        <div className="h-6 mb-4 text-red-400">{txErr}</div>
                    }

                    {!!address &&
                        <Button
                            disabled={disableSwap}
                            onClick={handleSwap}
                            loading={busy || ckbBalenceStatus === 'loading'}
                            btntype={'primary'}>Swap</Button>
                    }

                    <div className="text-center h-6 font-semibold my-4">
                        {
                            !!price && swapForm.amountY && swapForm.amountX && `1 ${swapForm.selectedX!.symbol} ≈ ${price} ${swapForm.selectedY!.symbol}`
                        }
                    </div>

                    <div className="shadow rounded-xl py-3">
                        <div className="flex flex-row items-center justify-between px-6 mb-4">
                            <div className="text-sm">Max slippage</div>
                            <div className="font-semibold">{swapConfig.slippage} %</div>
                        </div>
                        <div className="flex flex-row items-center justify-between px-6 mb-4">
                            {!!swapForm.pool && swapForm.amountX ?
                                <>
                                    <div
                                        className="text-sm">Fee <span>{`(${((swapForm.pool as any).poolInfo.feeRate / 10000).toFixed(3)}%)`}</span>
                                    </div>
                                    <div className="font-semibold">
                                        {BigNumber(swapForm.amountX).times((swapForm.pool as any).poolInfo.feeRate / 10000).toFormat(8)} {swapForm.selectedX?.symbol}
                                    </div>
                                </> :
                                <>
                                    <div className="text-sm">Fee</div>
                                    <div className="font-semibold">0</div>
                                </>
                            }

                        </div>
                        {/*<div className="flex flex-row items-center justify-between px-6">*/}
                        {/*    <div className="text-sm">Network Fee</div>*/}
                        {/*    <div className="font-semibold">{swapConfig.networkFeeRate}</div>*/}
                        {/*</div>*/}
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
                                <div className="text-gray-500">Sell</div>
                                <div
                                    className="font-semibold">{swapForm.amountX || '--'} {swapForm.selectedX?.symbol}</div>
                            </div>

                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">Buy</div>
                                <div
                                    className="font-semibold">{swapForm.amountY || '--'} {swapForm.selectedY?.symbol}</div>
                            </div>

                            <div className="h-[1px] bg-gray-200 my-4"/>

                            {!!swapForm.pool && swapForm.amountX &&
                                <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                    <div className="text-gray-500">Transaction fee</div>
                                    <div
                                        className="font-semibold">{BigNumber(swapForm.amountX).times((swapForm.pool as any).poolInfo.feeRate / 10000).toFormat()} {swapForm.selectedX?.symbol}</div>
                                </div>
                            }

                            {/*<div className="flex flex-row flex-nowrap justify-between text-sm mb-2">*/}
                            {/*    <div className="text-gray-500">Network fee</div>*/}
                            {/*    <div className="font-semibold">-- CKB</div>*/}
                            {/*</div>*/}

                            <div className="h-[1px] bg-gray-200 my-4"/>

                            <div className="flex flex-row flex-nowrap justify-between text-sm mb-2">
                                <div className="text-gray-500">Time</div>
                                <div className="font-semibold">{dayjs().format("YYYY-MM-DD HH:mm")}</div>
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
                                    onClick={e => {
                                        window.open(`${config.explorer}/transaction/${txHash}`, '_blank')
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
    )
}

export function transactionFormatter(
    transaction: CCCTransaction
): CKBComponents.RawTransaction {
    const bigint2Hex = (num: bigint) => {
        return append0x(num.toString(16));
    }

    const {
        version,
        cellDeps,
        headerDeps,
        inputs,
        outputs,
        outputsData,
        witnesses,
    } = transaction;
    return {
        version: bigint2Hex(version),
        cellDeps: cellDeps.map(cell => {
            return {
                outPoint: {
                    txHash: cell.outPoint.txHash,
                    index: bigint2Hex(cell.outPoint.index),
                },
                depType: cell.depType,
            };
        }),
        headerDeps,
        inputs: inputs.map(input => {
            return {
                previousOutput: {
                    index: bigint2Hex(input.previousOutput.index),
                    txHash: input.previousOutput.txHash,
                },
                since: bigint2Hex(input.since),
            };
        }),
        outputs: outputs.map(output => {
            return {
                capacity: bigint2Hex(output.capacity),
                lock: output.lock,
                type: output.type,
            };
        }),
        outputsData: outputsData,
        witnesses,
    };
}
