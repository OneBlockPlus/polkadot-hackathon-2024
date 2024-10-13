import {useContext, useEffect, useMemo} from "react"
import Background from "@/components/Background/Background"
import Avatar from "@/components/Avatar/Avatar"
import * as Tabs from '@radix-ui/react-tabs'
import ListToken, {TokenBalance} from "@/components/ListToken/ListToken"
import {ToastContext, ToastType} from "@/providers/ToastProvider/ToastProvider"
import ListDOBs from "@/components/ListDOBs/ListDOBs"
import {LangContext} from "@/providers/LangProvider/LangProvider"
import useLayer1Assets from "@/serves/useLayer1Assets"
import ProfileAddresses from "@/components/ProfileAddresses/ProfileAddresses"
import useBtcTransactionsHistory from "@/serves/useBtcTransactionsHistory"
import ListBtcHistory from "@/components/ListBtcHistory/ListBtcHistory"
import {themes} from "@/providers/UserProvider/themes";

export default function BtcProfile({internalAddress}: { internalAddress: string }) {
    const {showToast} = useContext(ToastContext)
    const {lang} = useContext(LangContext)

    // ui state
    const isBtc = useMemo(() => {
        if (!internalAddress) {
            return false
        }

        return internalAddress.startsWith('bc1') || internalAddress.startsWith('tb1')
    }, [internalAddress])

    const {
        xudts: layer1Xudt,
        dobs: layer1Dobs,
        btc: layer1Btc,
        status: layer1DataStatus,
        error: layer1DataErr
    } = useLayer1Assets(
        internalAddress && isBtc ? internalAddress : undefined)

    const {
        data: btcHistory,
        status: btcHistoryStatus
    } = useBtcTransactionsHistory(isBtc ? internalAddress : undefined, 5)

    const tokensStatus = useMemo(() => {
        if (layer1DataStatus === 'loading') {
            return 'loading'
        } else if (layer1DataStatus === 'error') {
            return 'error'
        } else if (layer1DataStatus === 'complete') {
            return 'complete'
        }

        return 'loading'
    }, [layer1DataStatus])

    const tokenData = useMemo(() => {
        if (tokensStatus === 'loading' || tokensStatus === 'error') {
            return [] as TokenBalance[]
        } else {
            return layer1Btc
                ? [layer1Btc, ...layer1Xudt]
                : [...layer1Xudt]
        }
    }, [layer1Btc, layer1Xudt, tokensStatus])


    useEffect(() => {
        if (layer1DataErr) {
            console.error('layer1DataErr', layer1DataErr)
            showToast(layer1DataErr.message, ToastType.error)
        }
    }, [layer1DataErr])


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
        }]
    }, [lang])

    return <div>
        <Background gradient={themes[0].bg}/>
        <div className="max-w-[1044px] mx-auto px-3 pb-10">
            <div
                className="w-[200px] h-[200px] rounded-full overflow-hidden mt-[-100px] border-4 border-white hidden md:block">
                <Avatar size={200} name={internalAddress || 'default'} colors={themes[0].colors}/>
            </div>
            <div
                className="w-[128px] h-[128px] rounded-full overflow-hidden mt-[-64px] mx-auto border-4 border-white md:hidden">
                <Avatar size={128} name={internalAddress || 'default'} colors={themes[0].colors}/>
            </div>
            <div className="mt-4 flex flex-col items-center md:flex-row">
                <div className="mb-4 md:mr-6">
                    <ProfileAddresses addresses={[internalAddress]} defaultAddress={internalAddress!}/>
                </div>
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
                                addresses={undefined}/>
                            <div className="mt-6">
                                <ListDOBs
                                    data={[...layer1Dobs]}
                                    status={tokensStatus}
                                    loaded={true}
                                    onChangePage={(page) => {
                                    }}/>
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
                                addresses={undefined}/>
                        </Tabs.Content>
                        <Tabs.Content
                            className="py-4 px-1 grow bg-white rounded-b-md outline-none"
                            value="DOBs"
                        >
                            <ListDOBs
                                data={[...layer1Dobs]}
                                status={tokensStatus}
                                loaded={true}
                                onChangePage={(page) => {
                                }}/>
                        </Tabs.Content>

                    </Tabs.Root>
                </div>

                <div className="lg:max-w-[380px] flex-1 lg:ml-4 lg:pt-[56px]">
                    <div className="shadow rounded-lg bg-white py-4">
                        <div className="flex justify-between flex-row items-center px-2 md:px-4 mb-3">
                            <div className="text-xl font-semibold">{lang['Activity']}</div>
                        </div>


                        <ListBtcHistory internalAddress={internalAddress!} data={btcHistory}
                                        status={btcHistoryStatus}/>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
