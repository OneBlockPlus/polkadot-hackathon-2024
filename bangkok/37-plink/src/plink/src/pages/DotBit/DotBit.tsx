import {useParams} from "react-router-dom"
import useDotbitDetail from "@/serves/useDotbitDetail"
import TokenIcon from "@/components/TokenIcon/TokenIcon"
import {shortTransactionHash} from "@/utils/common"
import dayjs from "dayjs"
import CopyText from "@/components/CopyText/CopyText"
import {TokenIcons} from "@/components/TokenIcon/icons"
import coin_types from "@/libs/coin_types"

export default function DotBit() {
    const {domain} = useParams<{ domain: string }>()

    const {data, status} = useDotbitDetail(domain)

    return <div className="max-w-[1044px] mx-auto px-3 py-8 flex md:flex-row flex-col flex-nowrap items-start mb-10">
        <div className="md:w-[320px] w-full shadow rounded-lg overflow-hidden">
            <div className="w-full h-[320px] relative">
                <img className="w-full h-full object-cover"
                     src={'https://d.id/favicon.png'} alt=""/>
            </div>
            <div className="p-4">
                {status === 'loading' &&
                    <>
                        <div className={'loading-bg h-[30px] rounded-lg'}/>
                    </>
                }

                {status !== 'loading' && !!data &&
                    <div className="font-semibold text-3xl">{domain}</div>
                }
            </div>
        </div>

        <div className="shadow flex-1 md:ml-6 rounded-lg px-5 py-3 w-full mt-4 md:mt-0">
            <div className="font-semibold text-lg mb-4">Information</div>

            {status === 'loading' &&
                <>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg'}/>
                    <div className={'loading-bg h-[45px] mb-6 rounded-lg w-[80%]'}/>
                </>
            }

            {
                status !== 'loading' && data &&
                <>
                    <div className="text-sm mb-6">
                        <div className="text-sm mb-3">Chain</div>
                        <div className="flex flex-row items-center text-sm font-semibold">
                            <TokenIcon symbol={'CKB'} size={24}/>
                            CKB
                        </div>
                    </div>

                    <div className="text-sm mb-6">
                        <div className="text-sm mb-3">Type</div>
                        <div className="flex flex-row items-center text-sm font-semibold break-all">
                            DID
                        </div>
                    </div>

                    <div className="text-sm mb-6">
                        <div className="text-sm mb-3">Owner</div>
                        <div className="flex flex-row items-center text-sm font-semibold break-all">
                            <CopyText copyText={data.owner_key}>{shortTransactionHash(data.owner_key, 10)}</CopyText>
                        </div>
                    </div>

                    <div className="text-sm mb-6">
                        <div className="text-sm mb-3">Manager</div>
                        <div className="flex flex-row items-center text-sm font-semibold break-all">
                            <CopyText
                                copyText={data.manager_key}>{shortTransactionHash(data.manager_key, 10)}</CopyText>
                        </div>
                    </div>

                    <div className="text-sm mb-6">
                        <div className="text-sm mb-3">Create At</div>
                        <div className="flex flex-row items-center text-sm font-semibold break-all">
                            {dayjs(data.create_at_unix * 1000).format('YYYY-MM-DD HH:mm')}
                        </div>
                    </div>

                    <div className="text-sm mb-6">
                        <div className="text-sm mb-3">Expired At</div>
                        <div className="flex flex-row items-center text-sm font-semibold break-all">
                            {dayjs(data.expired_at_unix * 1000).format('YYYY-MM-DD HH:mm')}
                        </div>
                    </div>

                    {
                        !!data.records.length &&
                        <>
                            <div className="font-semibold text-lg mb-4">Records</div>
                            {
                                data.records.map((record, index) => {
                                    if (record.key.includes('address')) {
                                        const chainIndex = record.key.split('.')[1]
                                        const chain = coin_types[Number(chainIndex)]

                                        return <div className="flex flex-row items-center px-4 py-3 rounded-lg bg-gray-100 mb-3" key={index}>
                                            <div className="text-sm flex flex-row items-center">
                                                {!!chain ?
                                                   <>
                                                   {!!TokenIcons[chain[1]] &&
                                                       <img className="rounded-full w-6 h-6 mr-2" src={TokenIcons[chain[1]]}  alt={''} />
                                                   }
                                                       <div className="font-semibold">{chain[1]}</div>
                                                   </>
                                                    : <div className="font-semibold">{record.key}</div>
                                                }
                                            </div>
                                            <div className="text-sm ml-3">
                                                <CopyText
                                                    copyText={record.value}>{shortTransactionHash(record.value, 6)}</CopyText>

                                            </div>
                                        </div>
                                    } else {
                                        return <div className="flex flex-row items-center px-4 py-3 rounded-lg bg-gray-100 mb-3" key={index}>
                                            <div className="text-sm flex flex-row items-center">
                                                <div className="font-semibold">{record.key}</div>
                                            </div>
                                            <div className="text-sm ml-3">
                                                <CopyText
                                                    copyText={record.value}>{record.value}</CopyText>
                                            </div>
                                        </div>
                                    }
                                })
                            }
                        </>
                    }
                </>
            }
        </div>
    </div>
}
