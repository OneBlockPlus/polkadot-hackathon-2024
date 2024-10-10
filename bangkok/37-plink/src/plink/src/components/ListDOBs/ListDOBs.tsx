import {ChainIcons} from "@/components/TokenIcon/icons"
import {useContext, useEffect, useState} from "react"
import {bufferToRawString} from '@spore-sdk/core'
import {shortTransactionHash} from "@/utils/number_display"
import {Link} from "react-router-dom"
import {queryClustersByIds} from "@/utils/graphql"
import {renderByTokenKey, svgToBase64} from '@nervina-labs/dob-render'
import {LangContext} from "@/providers/LangProvider/LangProvider"
import {SporesWithChainInfo} from "@/serves/useSpores"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {getImgFromSporeCell} from "@/utils/spore";

export default function ListDOBs({
                                     data,
                                     onChangePage,
                                     status,
                                     loaded
                                 }: { data: SporesWithChainInfo[], status: string, loaded: boolean, onChangePage?: (page: number) => any }) {
    const [page, setPage] = useState<number>(1)
    const {lang} = useContext(LangContext)

    return <div className="shadow rounded-lg bg-white py-4">
        <div className="flex justify-between flex-row items-center px-2 md:px-4 mb-3">
            <div className="text-xl font-semibold">{lang['DOBs']}</div>
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

            <div className="flex flex-row flex-wrap px-2">
                {status !== 'loading' &&
                    data.map((item, index) => {
                        return <DOBItem item={item} key={item.id}/>
                    })
                }
            </div>


            {!loaded &&
                <div
                    onClick={() => {
                        setPage(page + 1);
                        onChangePage && onChangePage(page + 1)
                    }}
                    className="cursor-pointer hover:bg-gray-300 bg-gray-200 h-[40px] rounded-lg flex flex-row items-center justify-center mx-4 mt-2 text-xs">
                    {`View More`}
                </div>
            }
        </div>
    </div>
}

function DOBItem({item}: { item: SporesWithChainInfo }) {
    const [image, setImage] = useState<string | null>(null)
    const [video, setVideo] = useState(null)
    const [name, setName] = useState('')
    const [plantText, setPlantText] = useState('')
    const {network} = useContext(CKBContext)

    useEffect(() => {
        if (item.content_type === 'application/json') {
            try {
                const json = JSON.parse(bufferToRawString(item.content.replace('\\', '0')))
                console.log('application/json', json)
                if (json.name) {
                    setName(json.name)
                }

                if (json.resource?.type.includes('image')) {
                    const img = new Image()
                    img.src = json.resource.url
                    img.onload = () => {
                        setImage(json.resource.url)
                    }
                }

                if (json.resource?.type.includes('video')) {
                    setVideo(json.resource.url)
                }
            } catch (e: any) {
                console.error(e)
            }
        }

        if (item.content_type.includes('text/plain')) {
            setPlantText(bufferToRawString(item.content.replace('\\', '0')))
        }

        if (item.content_type.includes('dob/0') && network === 'mainnet') {
            queryClustersByIds(item.cluster_id, true).then((clusters) => {
                if (clusters) {
                    setName(clusters.cluster_name)
                }
            })

            renderByTokenKey(item.id.replace('\\', '').replace('x', ''))
                .then(async (res) => {
                    setImage(await svgToBase64(res))
                })
                .catch((e: any) => {
                    console.warn(e)
                })
        }

        if (item.content_type.includes('image')) {
            const data = item.content.replace('\\x', '')
            const res = getImgFromSporeCell(data, item.content_type)
            setImage(res)
        }
    }, [item])

    return <Link to={`/dob/${item.id.replace('\\', '').replace('x', '')}?chain=${item.chain}`} className="shrink-0 grow-0 max-w-[50%] basis-1/2 md:basis-1/3 md:max-w-[33.3%] box-border p-2">
        <div
            className="relative w-full h-[140px] sm:h-[200px] md:h-[250px] lg:h-[180px]  overflow-hidden rounded-sm relative border border-1">
            <img className="object-cover w-full h-full"
                 src={image || "https://explorer.nervos.org/images/spore_placeholder.svg"} alt=""/>
            {
                !!ChainIcons[item.chain] &&
                <img src={ChainIcons[item.chain]} alt={item.chain} height={24} width={24}
                     className="absolute top-3 right-3"/>
            }
        </div>
        <div
            className="mt-1 text-base font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis h-[24px]">{name || plantText}</div>
        <div className="text-xs">{shortTransactionHash(item.id.replace('\\', '0'))}</div>
    </Link>
}
