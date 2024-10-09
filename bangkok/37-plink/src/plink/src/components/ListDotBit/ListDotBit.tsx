import {ChainIcons} from "@/components/TokenIcon/icons";
import {Link} from "react-router-dom"

export default function ListDotBit({
                                       data,
                                       status,
                                   }: { data: string[], status: string}) {

    return <div className="shadow rounded-lg bg-white py-4">
        <div className="flex justify-between flex-row items-center px-2 md:px-4 mb-3">
            <div className="text-xl font-semibold">.bit</div>
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
                        return <DOBItem item={item} key={item}/>
                    })
                }
            </div>
        </div>
    </div>
}

function DOBItem({item}: { item: string }) {
    return <Link to={`/dotbit/${item}`}
                 className="shrink-0 grow-0 max-w-[50%] basis-1/2 md:basis-1/3 md:max-w-[33.3%] box-border p-2">
        <div
            className="relative w-full h-[140px] sm:h-[200px] md:h-[250px] lg:h-[180px]  overflow-hidden rounded-sm relative border border-1">
            <img className="object-cover w-full h-full"
                 src={'https://d.id/favicon.png'} alt=""/>
            <img src={ChainIcons['ckb']} alt={'ckb'} height={24} width={24} className="absolute top-3 right-3"/>

        </div>
        <div
            className="mt-1 text-base font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis h-[24px]">{item}</div>
    </Link>
}
