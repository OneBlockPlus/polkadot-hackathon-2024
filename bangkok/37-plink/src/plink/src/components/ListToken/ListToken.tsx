import TokenIcon from '../TokenIcon/TokenIcon'
import {useCallback, useContext, useState} from "react"
import {toDisplay} from "@/utils/number_display"
import DialogXudtReceive from "@/components/Dialogs/DialogXudtReceive/DialogXudtReceive"
import DialogCkbTransfer from "@/components/Dialogs/DialogCkbTransfer/DialogCkbTransfer"
import {Link} from "react-router-dom"
import {TokenInfoWithAddress} from "@/utils/graphql/types"
import DialogXudtTransfer from "@/components/Dialogs/DialogXudtTransfer/DialogXudtTransfer"
import DialogBtcXudtTransfer from "@/components/Dialogs/DialogBtcXudtTransfer/DialogBtcXudtTransfer"
import {LangContext} from "@/providers/LangProvider/LangProvider"
import DialogXudtCellMerge from "@/components/Dialogs/DialogXudtCellMerge/DialogXudtCellMerge"
import DialogXudtCellBurn from "@/components/Dialogs/DialogXudtCellBurn/DialogXudtCellBurn"
import Dropdown from "@/components/Popover/Popover"
import {scriptToHash} from '@nervosnetwork/ckb-sdk-utils'
import {hashType} from "@/serves/useXudtTransfer/lib"
import {useUtxoSwap} from "@/serves/useUtxoSwap"
import DialogSwap from "@/components/Dialogs/DialogSwap/DialogSwap"
import DialogXudtLeapToLayer1 from "@/components/Dialogs/DialogLeapXudtToLayer1/DialogXudtLeapToLayer1"
import useBtcXudtTransfer from "@/serves/useBtcXudtTransfer"
import DialogLeapXudtToLayer2 from "@/components/Dialogs/DialogLeapXudtToLayer2/DialogLeapXudtToLayer2"
import useBtcWallet from "@/serves/useBtcWallet"


export interface TokenBalance extends TokenInfoWithAddress {
    amount: string,
    type: string,
    chain: 'ckb' | 'btc'
}

export default function ListToken({
                                      data,
                                      status,
                                      addresses,
                                      internalAddress,
                                      previewSize = 5
                                  }: {
    data: TokenBalance[],
    status: string,
    addresses?: string[],
    internalAddress?: string,
    previewSize?: number
}) {
    const [compact, setCompact] = useState(true)
    const {lang} = useContext(LangContext)
    const {supportTokens} = useUtxoSwap()
    const {isBtcWallet} = useBtcWallet()

    const isSupportSwap = useCallback((token: TokenBalance) => {
        if (token.chain === 'btc') return  ''

        if (token.symbol === 'CKB') {
            return "0x0000000000000000000000000000000000000000000000000000000000000000"
        }

        const typeHash = scriptToHash({
            args: token.address.script_args.replace('\\', '0'),
            codeHash: token.address.script_code_hash.replace('\\', '0'),
            hashType: hashType[token.address.script_hash_type]
        })

        const findToken = supportTokens.find(t => t.typeHash === typeHash)
        if (!findToken) {
            return ''
        } else {
            return typeHash
        }

    }, [supportTokens])

    let list = data
    if (compact) {
        list = data.slice(0, previewSize)
    }

    const getLink = (token: TokenBalance) => {
        if (token.symbol === 'CKB') {
            return '/token'
        } else if (token.symbol === 'BTC') {
            return '/bitcoin'
        } else {
            return `/token/${token.type_id}`
        }
    }

    return <div className="shadow rounded-lg bg-white py-4">
        <div className="flex justify-between flex-row items-center px-2 md:px-4 mb-3">
            <div className="text-xl font-semibold">{lang['Tokens']}</div>
        </div>
        <div className="flex flex-col">

            {status === 'loading' &&
                <div className="mx-4 my-2">
                    <div className="loading-bg rounded-lg h-[30px] my-2"/>
                    <div className="loading-bg rounded-lg h-[30px] my-2"/>
                    <div className="loading-bg rounded-lg h-[30px] my-2"/>
                </div>
            }

            {
                data.length === 0 && status !== 'loading' &&
                <div
                    className="mx-4 h-[120px] flex flex-row justify-center items-center bg-gray-100 text-gray-300 rounded-xl">
                    No assets found
                </div>
            }

            {data.length !== 0 && status !== 'loading' &&
                <div className="flex flex-row flex-nowrap px-2 md:px-4 py-3 text-xs box-border">
                    <div className="shrink-0 basis-1/3 md:basis-1/4">{lang['Assets']}</div>
                    {
                        !!addresses ?
                            <>
                                <div className="shrink-0 flex-1">{lang['Balance']}</div>
                                <div className="shrink-0 basis-1/3 md:basis-1/4 text-right">{lang['Actions']}</div>
                            </> : <div className="shrink-0 flex-1 text-right">{lang['Balance']}</div>
                    }
                </div>
            }

            {status !== 'loading' &&
                list.map((item, index) => {
                    const typeHash = isSupportSwap(item)

                    return <Link to={getLink(item)} key={index}
                                 className="flex flex-row flex-nowrap px-2 md:px-4 py-3 text-xs box-border hover:bg-gray-100">
                        <div className="shrink-0 basis-1/3 md:basis-1/4 flex-row flex items-center">
                            <TokenIcon symbol={item.symbol!} size={24} chain={item.chain}/>{item.symbol!}
                        </div>

                        {!!addresses && addresses.length > 0 ?
                            <>
                                <div
                                    className="shrink-0 flex-1 flex-row flex items-center">{toDisplay(item.amount, item.decimal!, true)}</div>
                                <div
                                    onClick={e => {
                                        e.preventDefault()
                                    }}
                                    className="shrink-0 basis-1/3 text-right flex-row items-center flex flex-nowrap justify-end">

                                    {item.symbol !== 'CKB' && item.chain === 'ckb' &&
                                        <>
                                            {!!typeHash &&
                                                <DialogSwap sellToken={typeHash}>
                                                    <div id={`swap-${index}`}/>
                                                </DialogSwap>
                                            }

                                            {isBtcWallet &&
                                                <DialogXudtLeapToLayer1 token={item}>
                                                    <div id={`leap-${index}`}/>
                                                </DialogXudtLeapToLayer1>
                                            }

                                            <DialogXudtCellMerge
                                                xudt={item}
                                                addresses={addresses}>
                                                <div id={`merge-${index}`}/>
                                            </DialogXudtCellMerge>
                                            <DialogXudtCellBurn
                                                xudt={item}
                                                addresses={addresses}>
                                                <div id={`burn-${index}`}/>
                                            </DialogXudtCellBurn>

                                            <Dropdown
                                                content={(close) => {
                                                    return <div className="flex flex-col">
                                                        {!!typeHash &&
                                                            <div onClick={e => {
                                                                const el = document.getElementById(`swap-${index}`)
                                                                !!el && el.click()
                                                                close()
                                                            }}
                                                                 className="mb-1 cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center flex">
                                                                {'Swap'}
                                                            </div>
                                                        }

                                                        { isBtcWallet &&
                                                            <div onClick={e => {
                                                                const el = document.getElementById(`leap-${index}`)
                                                                !!el && el.click()
                                                                close()
                                                            }}
                                                                 className="mb-1 cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center flex">
                                                                {lang['Leap']}
                                                            </div>
                                                        }

                                                        <div
                                                            onClick={e => {
                                                                const el = document.getElementById(`merge-${index}`)
                                                                !!el && el.click()
                                                                close()
                                                            }}
                                                            className="cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center flex">
                                                            {lang['Merge']}
                                                        </div>
                                                        <div
                                                            onClick={e => {
                                                                const el = document.getElementById(`burn-${index}`)
                                                                !!el && el.click()
                                                                close()
                                                            }}
                                                            className=" mt-1 text-red-400 cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center flex">
                                                            {lang['Burn']}
                                                        </div>
                                                    </div>
                                                }}
                                                className="p-2">
                                                <div
                                                    className="cursor-pointer md:mr-2 mr-1 px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center inline-flex">
                                                    <i className="uil-ellipsis-h"/>
                                                </div>
                                            </Dropdown>
                                        </>
                                    }

                                    {
                                        item.symbol === 'CKB' &&
                                        <>
                                            <DialogSwap sellToken={typeHash}>
                                                <div
                                                    className="cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center inline-flex md:mr-2 mr-1">
                                                    {'Swap'}
                                                </div>
                                            </DialogSwap>
                                            <DialogCkbTransfer froms={addresses}>
                                                <div
                                                    className="cursor-pointer whitespace-nowrap px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center inline-flex md:mr-2 mr-1">
                                                    {lang['Send']}
                                                </div>
                                            </DialogCkbTransfer>
                                        </>
                                    }

                                    {
                                        item.chain === 'btc' && item.symbol !== 'BTC' && isBtcWallet &&
                                        <>
                                            <DialogLeapXudtToLayer2 token={item} >
                                                <div
                                                    className="cursor-pointer whitespace-nowrap px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center inline-flex md:mr-2 mr-1">
                                                    {lang['Leap']}
                                                </div>
                                            </DialogLeapXudtToLayer2>
                                            <DialogBtcXudtTransfer token={item}>
                                                <div
                                                    className="cursor-pointer whitespace-nowrap px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center inline-flex md:mr-2 mr-1">
                                                    {lang['Send']}
                                                </div>
                                            </DialogBtcXudtTransfer>
                                        </>
                                    }

                                    {
                                        item.symbol !== 'CKB' && item.chain !== 'btc' &&
                                        <DialogXudtTransfer froms={addresses} token={item}>
                                        <div
                                                className="cursor-pointer whitespace-nowrap px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center inline-flex md:mr-2 mr-1">
                                                {lang['Send']}
                                            </div>
                                        </DialogXudtTransfer>
                                    }


                                    {item.chain === 'btc' && !!internalAddress ?
                                        <DialogXudtReceive address={internalAddress}>
                                            <div
                                                className="cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center md:inline-flex hidden">
                                                {lang['Receive']}
                                            </div>
                                        </DialogXudtReceive>
                                        : <DialogXudtReceive address={addresses[0]}>
                                            <div
                                                className="cursor-pointer px-3 md:px-4 py-2 font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm justify-center items-center md:inline-flex hidden">
                                                {lang['Receive']}
                                            </div>
                                        </DialogXudtReceive>
                                    }

                                </div>
                            </> : <div
                                className="shrink-0 flex-1 flex-row flex items-center justify-end font-semibold">{toDisplay(item.amount, item.decimal!, true)}</div>
                        }
                    </Link>
                })
            }
        </div>

        {compact && data.length > previewSize &&
            <div
                onClick={() => setCompact(!compact)}
                className="cursor-pointer hover:bg-gray-300 bg-gray-200 h-[40px] rounded-lg flex flex-row items-center justify-center mx-4 mt-2 text-xs">
                {`${lang['ViewAll']} (${data.length})`}
            </div>
        }
    </div>
}
