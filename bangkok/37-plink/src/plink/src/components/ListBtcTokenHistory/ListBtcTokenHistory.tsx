import {Link} from "react-router-dom"
import {shortTransactionHash, toDisplay} from "@/utils/number_display"
import * as dayjsLib from "dayjs"
import CopyText from "@/components/CopyText/CopyText"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {useContext} from "react"
import {BtcTransaction} from "@/serves/useBtcTransactionsHistory"
import {LangContext} from "@/providers/LangProvider/LangProvider"

const dayjs: any = dayjsLib
const relativeTime = require('dayjs/plugin/relativeTime')
dayjsLib.extend(relativeTime)

export default function ListBtcTokenHistory({
                                        data,
                                        status,
                                        address
                                    }: { data: BtcTransaction[], status: string, address?: string }) {
    const {config} = useContext(CKBContext)
    const {lang} = useContext(LangContext)

    return <div className="">
        <div className="flex flex-col">
            {status === 'loading' &&
                <div className="my-2">
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                </div>
            }

            {
                data.length === 0 && status !== 'loading' &&
                <div
                    className="h-[202px] flex flex-row justify-center items-center bg-gray-100 text-gray-300 rounded-xl">
                    No transaction found
                </div>
            }

            {
                data.map((item, index) => {
                    return <Link
                        key={index}
                        target="_blank"
                        to={`${config.btc_explorer}/tx/${item.txid}`}
                        className="bg-[#fffbf5] rounded p-4 mt-3">
                        <div className="flex flex-row text-sm mb-4 justify-between">
                            <div
                                className="text-[#f7931a] mr-2">
                                <CopyText copyText={item.txid}>
                                    {shortTransactionHash(item.txid, 10)}
                                </CopyText>
                            </div>
                            { item.status.confirmed ?
                                <div className="text-neutral-500">{dayjs(item.status.block_time * 1000).fromNow()}</div>
                                : <div className="text-blue-300">{lang['Unconfirmed']}</div>
                            }
                        </div>
                        <div className="flex flex-row flex-col sm:flex-row sm:items-start items-center">
                            <div className="sm:flex-1 w-full">
                                {
                                    item.vin.map((input) => {
                                        return <div key={input.txid} className="flex flex-row text-xs justify-between mb-2">
                                            <div className="text-[#6CD7B2]">
                                                <CopyText copyText={input.prevout.scriptpubkey_address}>
                                                    {shortTransactionHash(input.prevout.scriptpubkey_address, 4)}
                                                </CopyText>
                                            </div>
                                            <div className="flex flex-row items-center font-semibold">
                                                {toDisplay(input.prevout.value + '', 8, true, 8)} BTC
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                            <div className="w-[50px] text-center text-2xl rotate-90 sm:rotate-0"><i className="uil-arrow-right" /></div>
                            <div className="sm:flex-1 w-full">
                                {
                                    item.vout.filter(o => !!o.scriptpubkey_address).slice(0, 5).map((input, index) => {
                                        return <div key={index} className="flex flex-row text-xs justify-between mb-2">
                                            <div className="text-[#6CD7B2]">
                                                <CopyText copyText={input.scriptpubkey_address!}>
                                                    {shortTransactionHash(input.scriptpubkey_address!, 4)}
                                                </CopyText>
                                            </div>
                                            <div className="flex flex-row items-center font-semibold">
                                                {toDisplay(input.value + '', 8, true, 8)} BTC
                                            </div>
                                        </div>})
                                }
                                {item.vout.length > 5 &&
                                    <div className="text-xs">... total {item.vout.length} items</div>
                                }
                            </div>
                        </div>
                    </Link>
                })
            }
        </div>

        {
            status === 'complete' && !!address &&
            <Link
                to={`${config.btc_explorer}/address/${address}`}
                className="cursor-pointer hover:bg-gray-300 bg-gray-200 h-[40px] rounded-lg flex flex-row items-center justify-center mt-2 text-xs">
                <div className="mr-2">Show more records</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
                    <path
                        d="M11.3746 7.93844C11.1861 7.93844 11.0052 8.01334 10.8719 8.14666C10.7386 8.27998 10.6637 8.4608 10.6637 8.64935V10.91C10.6637 11.0986 10.5888 11.2794 10.4555 11.4127C10.3221 11.5461 10.1413 11.621 9.95277 11.621H2.13274C1.94419 11.621 1.76337 11.5461 1.63005 11.4127C1.49672 11.2794 1.42182 11.0986 1.42182 10.91V3.09001C1.42182 2.90147 1.49672 2.72064 1.63005 2.58732C1.76337 2.454 1.94419 2.3791 2.13274 2.3791H4.39344C4.58198 2.3791 4.76281 2.3042 4.89613 2.17088C5.02945 2.03756 5.10435 1.85673 5.10435 1.66819C5.10435 1.47964 5.02945 1.29882 4.89613 1.1655C4.76281 1.03218 4.58198 0.957275 4.39344 0.957275H2.13274C1.5671 0.957275 1.02463 1.18197 0.624664 1.58194C0.224698 1.98191 0 2.52438 0 3.09001V10.91C0 11.4757 0.224698 12.0182 0.624664 12.4181C1.02463 12.8181 1.5671 13.0428 2.13274 13.0428H9.95277C10.5184 13.0428 11.0609 12.8181 11.4608 12.4181C11.8608 12.0182 12.0855 11.4757 12.0855 10.91V8.64935C12.0855 8.4608 12.0106 8.27998 11.8773 8.14666C11.744 8.01334 11.5631 7.93844 11.3746 7.93844ZM12.0286 1.39804C11.9565 1.22433 11.8185 1.08629 11.6447 1.01415C11.5593 0.97772 11.4675 0.958399 11.3746 0.957275H7.10912C6.92058 0.957275 6.73976 1.03217 6.60643 1.1655C6.47311 1.29882 6.39821 1.47964 6.39821 1.66819C6.39821 1.85673 6.47311 2.03756 6.60643 2.17088C6.73976 2.3042 6.92058 2.3791 7.10912 2.3791H9.6613L4.47164 7.56165C4.40501 7.62774 4.35212 7.70637 4.31603 7.793C4.27993 7.87963 4.26135 7.97255 4.26135 8.0664C4.26135 8.16025 4.27993 8.25317 4.31603 8.3398C4.35212 8.42643 4.40501 8.50506 4.47164 8.57115C4.53773 8.63778 4.61636 8.69067 4.70299 8.72676C4.78962 8.76285 4.88254 8.78143 4.97639 8.78143C5.07024 8.78143 5.16316 8.76285 5.24979 8.72676C5.33642 8.69067 5.41505 8.63778 5.48113 8.57115L10.6637 3.38149V5.93366C10.6637 6.12221 10.7386 6.30303 10.8719 6.43635C11.0052 6.56968 11.1861 6.64458 11.3746 6.64458C11.5631 6.64458 11.744 6.56968 11.8773 6.43635C12.0106 6.30303 12.0855 6.12221 12.0855 5.93366V1.66819C12.0844 1.57529 12.0651 1.48351 12.0286 1.39804Z"
                        fill="#7492EF"/>
                </svg>
            </Link>
        }
    </div>
}

export interface TransactionHistory {
    id: string,
    type: string,
    attributes: {
        block_number: string,
        block_timestamp: string,
        created_at: string,
        income: string,
        transaction_hash: string,
        display_outputs: {
            address_hash: string
            capacity: string,
            cell_index: string,
            cell_type: string,
            generated_tx_hash: string,
            id: string,
            occupied_capacity: string
            status: string
            xudt_info?: {
                symbol: string,
                amount: string,
                decimal: string,
                published: boolean,
                type_hash: string,
            }
            extra_info?: {
                amount: string,
                decimal: string,
                display_name: string,
                symbol: string,
            }
        }[],
        display_inputs: {
            address_hash: string
            capacity: string,
            cell_index: string,
            cell_type: string,
            generated_tx_hash: string,
            id: string,
            occupied_capacity: string
            status: string
            xudt_info?: {
                symbol: string,
                amount: string,
                decimal: string,
                published: boolean,
                type_hash: string,
            }
            extra_info?: {
                amount: string,
                decimal: string,
                display_name: string,
                symbol: string,
            }
        }[],
    }
}
