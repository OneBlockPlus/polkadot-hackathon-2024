import {useEffect, useState, useContext} from "react"
import {queryClustersByIds, querySporesById} from "@/utils/graphql"
import {Clusters} from "@/utils/graphql/types"
import {bufferToRawString} from "@spore-sdk/core"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {SporesWithChainInfo} from "@/serves/useSpores"

export interface SporeDetail extends SporesWithChainInfo {
    dob0?: {
        dob_content: {dna : string, id: string}
        render_output: [{
            name: string,
            traits:[{String?: string, Number?: string}]
        }],
    }
    json?: {name: string, resource : {type: string, url: string}}
    plant_text?: string
    cluster?:Clusters
}

function decodeBob0(tokenid: string) {
    return new Promise((resolve, reject) => {
        fetch(`https://dob-decoder.rgbpp.io/`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({
                id: 2,
                jsonrpc: '2.0',
                method: 'dob_decode',
                params: [tokenid]
            })
        })
            .then(res => {
                return res.json()
            }).then(res => {
            resolve(JSON.parse(res.result))
        })
            .catch((e: any) => {
                reject(e)
            })
    })
}


export default function useSporeDetail(tokenid: string, chain: 'ckb' | 'btc' = 'ckb') {
    const [status, setStatus] = useState<'loading' | 'error' | 'complete'>('loading')
    const [data, setData] = useState<SporeDetail | null>(null)
    const [error, setError] = useState<undefined | any>(undefined)
    const {network} = useContext(CKBContext)

    useEffect(() => {
        (async () => {
            const spore = await querySporesById(`\\\\x${tokenid}`, network === 'mainnet')
            if (!spore) {
                setStatus("complete")
            } else {
                let res: SporeDetail = {
                    ...spore,
                    chain,
                }

                let cluster: Clusters | undefined = undefined

                if (spore.cluster_id) {
                    cluster = await queryClustersByIds(spore.cluster_id, network === 'mainnet')
                }

                if (spore.content_type === 'dob/0') {
                    const decode:any = await decodeBob0(tokenid.replace('0x', ''))
                    res = {
                        ...spore,
                        chain,
                        dob0: {
                            dob_content: decode.dob_content,
                            render_output: JSON.parse(decode.render_output)
                        },
                    }
                } else if (spore.content_type === 'application/json') {
                    const decode:any = JSON.parse(bufferToRawString(spore.content.replace('\\', '0')))
                    res = {
                        chain,
                        ...spore,
                        json: decode,
                    }
                } else if (spore.content_type.includes('text')) {
                    res = {
                        chain,
                        ...spore,
                        plant_text: bufferToRawString(spore.content.replace('\\', '0')),
                    }
                }

                setStatus("complete")
                setData({
                    ...res,
                    cluster
                })

            }
        })()
    }, [tokenid])

    return {
        status,
        data,
        error
    }
}
