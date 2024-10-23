import {UserContext} from '@/providers/UserProvider/UserProvider'
import {useContext, useEffect, useMemo, useState} from "react"
import Background from "@/components/Background/Background"
import Avatar from "@/components/Avatar/Avatar"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import * as Tabs from '@radix-ui/react-tabs'
import ListToken, {TokenBalance} from "@/components/ListToken/ListToken"
import useAllXudtBalance from "@/serves/useAllXudtBalance"
import useCkbBalance from "@/serves/useCkbBalance"
import {ToastContext, ToastType} from "@/providers/ToastProvider/ToastProvider"
import useTransactions from "@/serves/useTransactionsHistory"
import useTransactionsHistory from "@/serves/useTransactionsHistory"
import ListHistory from "@/components/ListHistory/ListHistory"
import useSpores from "@/serves/useSpores"
import ListDOBs from "@/components/ListDOBs/ListDOBs"
import {LangContext} from "@/providers/LangProvider/LangProvider"
import useLayer1Assets from "@/serves/useLayer1Assets"
import ProfileAddresses from "@/components/ProfileAddresses/ProfileAddresses"
import useBtcTransactionsHistory from "@/serves/useBtcTransactionsHistory"
import ListBtcHistory from "@/components/ListBtcHistory/ListBtcHistory"
import {isBtcAddress} from "@/utils/common"
import useDotbit from "@/serves/useDotbit"
import ListDotBit from "@/components/ListDotBit/ListDotBit"
import DialogReceive from "@/components/Dialogs/DialogReceive/DialogReceive"
import DialogSwap from "@/components/Dialogs/DialogSwap/DialogSwap"

export default function Profile() {
    const {address, isOwner, theme} = useContext(UserContext)
    const {internalAddress, address: loginAddress, addresses, network} = useContext(CKBContext)
    const {showToast} = useContext(ToastContext)
    const {lang} = useContext(LangContext)

    // ui state
    const [selectedAddress, setSelectedAddress] = useState<string | undefined>(address)
    const [activeTab, setActiveTab] = useState<'ckb' | 'btc' | 'rgbpp' | '.bit'>('ckb')

    useEffect(() => {
        if (!internalAddress) {
            setActiveTab('ckb')
        }
    }, [internalAddress])

    const btcAddress = useMemo(() => {
        if (!internalAddress) {
            return undefined
        }

        if (!addresses?.includes(address!)) {
            return undefined
        }

        return isBtcAddress(internalAddress, network === 'mainnet') ? internalAddress : undefined
    }, [internalAddress, address, addresses])


    const queryAddress = useMemo(() => {
        return !!addresses && addresses.includes(address!) ? addresses : [address!]
    }, [addresses, address])

    const {data: xudtData, status: xudtDataStatus, error: xudtDataErr} = useAllXudtBalance(queryAddress)
    const {data: ckbData, status: ckbDataStatus, error: ckbDataErr} = useCkbBalance(queryAddress)
    const {data: historyData, status: historyDataStatus} = useTransactions(selectedAddress!)
    const {
        data: sporesData,
        status: sporesDataStatus,
        loaded: sporesDataLoaded,
        setPage: setSporesDataPage
    } = useSpores(queryAddress)
    const {
        xudts: layer1Xudt,
        dobs: layer1Dobs,
        btc: layer1Btc,
        status: layer1DataStatus,
        error: layer1DataErr
    } = useLayer1Assets(btcAddress, true)

    const {
        data: btcHistory,
        status: btcHistoryStatus
    } = useBtcTransactionsHistory(btcAddress, 5)

    const {data: rgbppHistory, status: rgbppHistoryStatus} = useTransactionsHistory(btcAddress)

    const {domains, bondingDomain, status: domainStatus} = useDotbit(address)

    const tokensStatus = useMemo(() => {
        if (xudtDataStatus === 'loading' || ckbDataStatus === 'loading' || layer1DataStatus === 'loading') {
            return 'loading'
        } else if (xudtDataStatus === 'error' || ckbDataStatus === 'error' || layer1DataStatus === 'error') {
            return 'error'
        } else if (xudtDataStatus === 'complete' && ckbDataStatus === 'complete' && ckbData) {
            return 'complete'
        }

        return 'loading'
    }, [xudtDataStatus, ckbDataStatus, layer1DataStatus, ckbData])

    const dobsListStatue = useMemo(() => {
        if (layer1DataStatus === 'loading' || sporesDataStatus === 'loading') {
            return 'loading'
        } else if (layer1DataStatus === 'error' || sporesDataStatus === 'error') {
            return 'error'
        } else if (layer1DataStatus === 'complete' && sporesDataStatus === 'complete') {
            return 'complete'
        }

        return 'loading'
    }, [layer1DataStatus, sporesDataStatus])

    const tokenData = useMemo(() => {
        if (tokensStatus === 'loading' || tokensStatus === 'error') {
            return [] as TokenBalance[]
        } else {
            return layer1Btc
                ? [ckbData!, ...xudtData, layer1Btc, ...layer1Xudt]
                : [ckbData!, ...xudtData, ...layer1Xudt]
        }
    }, [ckbData, layer1Btc, layer1Xudt, tokensStatus, xudtData])

    useEffect(() => {
        if (xudtDataErr) {
            console.error(xudtDataErr)
            showToast(xudtDataErr.message, ToastType.error)
        }

        if (ckbDataErr) {
            console.error(ckbDataErr)
            showToast(ckbDataErr.message, ToastType.error)
        }

        if (layer1DataErr) {
            console.error('layer1DataErr', layer1DataErr)
            showToast(layer1DataErr.message, ToastType.error)
        }
    }, [xudtDataErr, ckbDataErr])


    const tabs = useMemo(() => {
        return [{
            value: 'All',
            label: lang['All']
        }, {
            value: 'Tokens',
            label: lang['Tokens']
        }, {
            value: 'DOBs',
            label: lang['DOBs']
        }, {
            value: '.bit',
            label: '.bit'
        }]
    }, [lang])

    return <div>
        <Background gradient={theme.bg}/>
        <div className="max-w-[1044px] mx-auto px-3 pb-10">
            { !!addresses && !!addresses.length && !!internalAddress && isOwner &&
                <div className="absolute right-3 top-[70px]">
                    <DialogSwap>
                        <div
                            className="mr-4 border rounded-3xl z-10 cursor-pointer px-6 py-1 font-semibold bg-neutral-100 hover:bg-neutral-200 shadow-sm justify-center items-center inline-flex">Swap</div>
                    </DialogSwap>
                    <DialogReceive addresses={[...addresses, internalAddress]}>
                        <div className="border rounded-3xl z-10 cursor-pointer px-6 py-1 font-semibold bg-neutral-100 hover:bg-neutral-200 shadow-sm justify-center items-center inline-flex">{lang['Receive']}</div>
                    </DialogReceive>
                </div>
            }

            <div
                className="w-[200px] h-[200px] rounded-full overflow-hidden mt-[-100px] border-4 border-white hidden md:block">
                <Avatar size={200} name={address || 'default'} colors={theme.colors}/>
            </div>
            <div
                className="w-[128px] h-[128px] rounded-full overflow-hidden mt-[-64px] mx-auto border-4 border-white md:hidden">
                <Avatar size={128} name={address || 'default'} colors={theme.colors}/>
            </div>
            <div className="mt-4 flex flex-col items-center md:flex-row">
                {
                    isOwner && internalAddress && internalAddress !== address && addresses ?
                        <>
                            <div className="mb-4 md:mr-6">
                                <ProfileAddresses addresses={[internalAddress!]} defaultAddress={internalAddress!}/>
                            </div>
                            <div className="mb-4">
                                <ProfileAddresses
                                    onChoose={(e) => {
                                        setSelectedAddress(e)
                                    }}
                                    addresses={addresses}
                                    defaultAddress={address!}/>
                            </div>
                        </> :
                        <div className="mb-4">
                            <ProfileAddresses addresses={[address!]} defaultAddress={address!}/>
                        </div>
                }
            </div>

            <div className="flex mt-3 lg:mt-9 justify-between flex-col lg:flex-row">
                <div className="flex-1 overflow-auto lg:max-w-[624px]">
                    <Tabs.Root
                        className="flex flex-col overflow-auto"
                        defaultValue="All">
                        <Tabs.List className="shrink-0 flex flex-row overflow-auto" aria-label="Assets">
                            {
                                tabs.map((tab) => <Tabs.Trigger key={tab.value}
                                                                className="h-10 mr-4 font-bold outline-none cursor-pointer py-2 px-4 rounded-lg data-[state=active]:text-white data-[state=active]:bg-black"
                                                                value={tab.value}>{tab.label}</Tabs.Trigger>)
                            }
                        </Tabs.List>


                        <Tabs.Content
                            className="py-4 px-1 grow bg-white rounded-b-md outline-none"
                            value="All">
                            <ListToken
                                data={tokenData}
                                status={tokensStatus}
                                internalAddress={internalAddress}
                                addresses={isOwner ? addresses : undefined}/>
                            <div className="mt-6">
                                <ListDOBs
                                    data={[...layer1Dobs, ...sporesData]}
                                    status={dobsListStatue}
                                    loaded={sporesDataLoaded}
                                    onChangePage={(page) => {
                                        setSporesDataPage(page)
                                    }}/>
                            </div>
                            <div className="mt-6">
                                <ListDotBit
                                    data={domains}
                                    status={domainStatus}
                                   />
                            </div>
                        </Tabs.Content>
                        <Tabs.Content
                            className="py-4 px-1 grow bg-white rounded-b-md outline-none"
                            value="Tokens"
                        >
                            <ListToken
                                data={tokenData}
                                status={tokensStatus}
                                internalAddress={internalAddress}
                                addresses={isOwner ? addresses : undefined}/>
                        </Tabs.Content>
                        <Tabs.Content
                            className="py-4 px-1 grow bg-white rounded-b-md outline-none"
                            value="DOBs"
                        >
                            <ListDOBs
                                data={[...layer1Dobs, ...sporesData]}
                                status={dobsListStatue}
                                loaded={sporesDataLoaded}
                                onChangePage={(page) => {
                                    setSporesDataPage(page)
                                }}/>
                        </Tabs.Content>
                        <Tabs.Content
                            className="py-4 px-1 grow bg-white rounded-b-md outline-none"
                            value=".bit"
                        >
                            <ListDotBit
                                data={domains}
                                status={domainStatus}
                            />
                        </Tabs.Content>

                    </Tabs.Root>
                </div>

                <div className="lg:max-w-[380px] flex-1 lg:ml-4 lg:pt-[56px]">
                    <div className="shadow rounded-lg bg-white py-4">
                        <div className="flex justify-between flex-row items-center px-2 md:px-4 mb-3">
                            <div className="text-xl font-semibold">{lang['Activity']}</div>
                        </div>
                        {!!internalAddress && btcAddress &&
                            <div className="flex flex-row items-center px-2">
                                <div onClick={e => {
                                    setActiveTab('ckb')
                                }}
                                     className={`select-none cursor-pointer relative h-8 px-4 ${activeTab === 'ckb' ? 'after:content-[\'\'] after:block after:absolute after:h-2 after:w-4 after:bg-[#9EFEDD] after:rounded-full after:left-[50%] after:ml-[-8px]' : ''}`}>CKB
                                </div>
                                <div onClick={e => {
                                    setActiveTab('btc')
                                }}
                                     className={`select-none cursor-pointer relative h-8 px-4 ${activeTab === 'btc' ? 'after:content-[\'\'] after:block after:absolute after:h-2 after:w-4 after:bg-[#9EFEDD] after:rounded-full after:left-[50%] after:ml-[-8px]' : ''}`}>BTC
                                </div>
                                <div onClick={e => {
                                    setActiveTab('rgbpp')
                                }}
                                     className={`select-none cursor-pointer relative h-8 px-4 ${activeTab === 'rgbpp' ? 'after:content-[\'\'] after:block after:absolute after:h-2 after:w-4 after:bg-[#9EFEDD] after:rounded-full after:left-[50%] after:ml-[-8px]' : ''}`}>RGB++
                                </div>
                            </div>
                        }

                        {activeTab === 'ckb' &&
                            <ListHistory addresses={queryAddress} data={historyData} status={historyDataStatus}/>
                        }

                        {activeTab === 'btc' && btcAddress &&
                            <ListBtcHistory internalAddress={internalAddress!} data={btcHistory}
                                            status={btcHistoryStatus}/>
                        }

                        {activeTab === 'rgbpp' && btcAddress &&
                            <ListHistory internalAddress={internalAddress!} data={rgbppHistory}
                                         status={rgbppHistoryStatus}/>
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}
