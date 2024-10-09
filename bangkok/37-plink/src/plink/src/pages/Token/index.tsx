import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import TokenIcon from "@/components/TokenIcon/TokenIcon"
import Button from "@/components/Form/Button/Button"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import DialogXudtReceive from "@/components/Dialogs/DialogXudtReceive/DialogXudtReceive"
import {toDisplay} from "@/utils/number_display"
import ListTokenHistory from "@/components/ListTokenHistory/ListTokenHistory"
import useTokenInfo from "@/serves/useTokenInfo"
import {useParams} from "react-router-dom"
import useXudtBalance from "@/serves/useXudtBalance"
import DialogXudtTransfer from "@/components/Dialogs/DialogXudtTransfer/DialogXudtTransfer"
import {LangContext} from "@/providers/LangProvider/LangProvider"
import useTokenTransactions from "@/serves/useTokenTransactionsHistory"
import useTransactionsHistory from "@/serves/useTransactionsHistory"
import ProfileAddresses from "@/components/ProfileAddresses/ProfileAddresses"
import useLayer1Assets from "@/serves/useLayer1Assets"
import DialogBtcXudtTransfer from "@/components/Dialogs/DialogBtcXudtTransfer/DialogBtcXudtTransfer"
import DialogTransferFromAddressSelect from "@/components/Dialogs/DialogTransferFromAddressSelect/DialogTransferFromAddressSelect"


export default function TokenPage() {
    const {tokenid} = useParams()
    const {signer, open, address, addresses, internalAddress} = useContext(CKBContext)
    const {lang} = useContext(LangContext)


    const [activeTab, setActiveTab] = useState<'ckb' | 'rgbpp'>('ckb')

    const btcAddress = useMemo(() => {
        if (!internalAddress) return undefined

        return internalAddress.startsWith('bc') || internalAddress.startsWith('tb') ? internalAddress : undefined
    }, [internalAddress])

    const {data: tokenInfo, status: infoStatus} = useTokenInfo(tokenid!)
    const {data: xudtBalance, status: xudtBalanceStatus} = useXudtBalance(addresses, tokenInfo || undefined)
    const {data: historyData, status: historyDataStatus} = useTokenTransactions(tokenInfo, address, 10)
    const {data: rgbppHistory, status: rgbppHistoryStatus} = useTransactionsHistory(btcAddress)
    const {xudts: rgbppXudts, status: rgbppXudtsStatus} = useLayer1Assets(btcAddress)

    const rgbppBalance = useMemo(() => {
        if (!rgbppXudts || !tokenInfo) return '0'
        const target = rgbppXudts.find(x => x.symbol === tokenInfo?.symbol)
        return target?.amount || '0'
    }, [rgbppXudts, tokenInfo])

    useEffect(() => {
        if (!btcAddress) {
            setActiveTab('ckb')
        }
    }, [btcAddress])

    const handleSend = useCallback(() => {
        if (!!btcAddress) {
            const btn: any = document.querySelector('#address-select')
            if (!!btn) {
                btn.click()
            }
        } else {
            const btn: any = document.querySelector('#xudt-transfer')
            if (!!btn) {
                btn.click()
            }
        }
    }, [btcAddress])

    const handleSelectedAddress = useCallback((address: string) => {
        if (internalAddress === address) {
            const btn: any = document.querySelector('#btc-xudt-transfer')
            if (!!btn) {
                btn.click()
            }
        } else {
            const btn: any = document.querySelector('#xudt-transfer')
            if (!!btn) {
                btn.click()
            }
        }
    }, [internalAddress])

    return <div className="max-w-[1044px] mx-auto px-3 py-8 flex flex-col sm:flex-row items-start mb-10">
        <div
            className="sm:w-[320px] w-full shadow rounded-lg overflow-hidden bg-[url('./assets/token_bg.png')] bg-[length:100%_auto] bg-no-repeat p-5">
            <div className="mt-10 mb-4">
                <TokenIcon symbol={tokenInfo?.symbol || 'default'} size={90}/>
            </div>
            {infoStatus === 'loading' ?
                <div className={'loading-bg h-[30px] mb-3 rounded-lg'}/>
                : <div className="text-lg mb-4">
                    <div className="font-semibold mr-3 text-2xl"> {tokenInfo?.symbol || "Inscription"}</div>
                    <div className="text-sm"> {tokenInfo?.name}</div>
                </div>
            }

            {!signer && !!tokenInfo &&
                <div className="flex flex-row justify-between text-sm">
                    <Button className="mr-2" onClick={open}>{lang['Send']}</Button>
                    <Button className="text-white !bg-[#000] hover:opacity-80 hover:bg-[#000]"
                            onClick={open}>{lang['Receive']}</Button>
                </div>
            }


            {signer && address && !!tokenInfo &&
                <>
                    <div className={'justify-between mb-3'}>
                        <div className="mb-2">{lang['Balance']}</div>
                        {xudtBalanceStatus === 'loading' ?
                            <div className={'loading-bg h-[30px] mb-3 rounded-lg mt-3'}/> :
                            <div>
                                <ProfileAddresses addresses={[address]} defaultAddress={address}/>
                                <div className="font-semibold text-xl">
                                    {toDisplay(xudtBalance?.amount || '0', 8, true)} {tokenInfo.symbol}
                                </div>
                            </div>
                        }

                        {!!btcAddress && rgbppXudtsStatus === 'loading' &&
                            <div className={'loading-bg h-[30px] mb-3 rounded-lg mt-3'}/>
                        }

                        {!!btcAddress && rgbppXudtsStatus === 'complete' &&
                            <div className="mt-4">
                                <ProfileAddresses addresses={[btcAddress]} defaultAddress={btcAddress}/>
                                <div className="font-semibold text-xl">
                                    {toDisplay(rgbppBalance || '0', tokenInfo!.decimal, true)} {tokenInfo.symbol}
                                </div>
                            </div>
                        }
                    </div>

                    <DialogXudtTransfer froms={addresses!} token={tokenInfo}>
                        <div id="xudt-transfer"/>
                    </DialogXudtTransfer>

                    {!!btcAddress &&
                        <>
                            <DialogBtcXudtTransfer token={tokenInfo}>
                                <div id="btc-xudt-transfer"/>
                            </DialogBtcXudtTransfer>
                            <DialogTransferFromAddressSelect onSelect={handleSelectedAddress}>
                                <div id="address-select"/>
                            </DialogTransferFromAddressSelect>
                        </>
                    }

                    {
                        xudtBalanceStatus === 'complete' && rgbppXudtsStatus === 'complete' &&

                        <div className="flex flex-row justify-between text-sm">
                            <Button
                                onClick={handleSend}
                                className="mr-2 flex-1"
                            >{lang['Send']}</Button>

                            <DialogXudtReceive address={address!} className="flex-1">
                                <Button className="text-white !bg-[#000] hover:opacity-80 hover:bg-[#000]"
                                >{lang['Receive']}</Button>
                            </DialogXudtReceive>
                        </div>
                    }
                </>
            }
        </div>
        <div className="shadow flex-1 w-full mt-6 sm:mt-0 sm:ml-6 rounded-lg px-5 py-3">
            <div className="font-semibold text-lg mb-4">{lang['Transactions']}</div>

            {!!internalAddress && !!btcAddress &&
                <div className="flex flex-row items-center px-2 mb-3">
                    <div onClick={e => {
                        setActiveTab('ckb')
                    }}
                         className={`select-none cursor-pointer relative h-8 px-4 ${activeTab === 'ckb' ? 'after:content-[\'\'] after:block after:absolute after:h-2 after:w-4 after:bg-[#9EFEDD] after:rounded-full after:left-[50%] after:ml-[-8px]' : ''}`}>
                        CKB
                    </div>
                    <div onClick={e => {
                        setActiveTab('rgbpp')
                    }}
                         className={`select-none cursor-pointer relative h-8 px-4 ${activeTab === 'rgbpp' ? 'after:content-[\'\'] after:block after:absolute after:h-2 after:w-4 after:bg-[#9EFEDD] after:rounded-full after:left-[50%] after:ml-[-8px]' : ''}`}>
                        RGB++
                    </div>
                </div>
            }

            {activeTab === 'ckb' &&
                <ListTokenHistory data={historyData} status={historyDataStatus} address={address!}/>
            }

            {!!btcAddress && activeTab === 'rgbpp' &&
                <ListTokenHistory data={rgbppHistory} status={rgbppHistoryStatus} address={address!}/>
            }
        </div>
    </div>
}
