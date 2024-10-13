// @ts-ignore
import {request} from 'graphql-request'
import {gql} from "@/utils/graphql/schema";
import {XudtCell, Spores, Clusters, TokenInfoWithAddress} from "./types"


const api = {
    mainnet: 'https://ckb-graph.unistate.io/v1/graphql',
    testnet: 'https://unistate-ckb-test.unistate.io/v1/graphql'
}

export const query = async (query: string, variables?: any, isMainnet: boolean = true):Promise<any> => {
    const graphUrl = isMainnet ? api.mainnet : api.testnet
    return await request(graphUrl, query, variables)
}

export const queryXudtCell = async (addresses: string[], isMainnet: boolean = true) => {
    const doc = gql('xudt_cell', `where:{lock_id: {_in: ${JSON.stringify(addresses)}},  is_consumed: {_eq: false}}`)
    const res: any = await query(doc, undefined, isMainnet)
    return res.xudt_cell as XudtCell[]
}

export const queryAddressInfoWithAddress = async (type_ids: string[], isMainnet=true) => {
    const idStr = type_ids.map(id => `"${id}"`).join(',')
    const doc = gql('token_info_address', `where:{type_id: {_in: [${idStr}]}}`)
    const res: any = await query(doc, undefined, isMainnet)
    return res.token_info as TokenInfoWithAddress[]
}

export const querySporesByAddress = async (addresses: string[], page: number, pageSize:number, allowBurned?: boolean, isMainnet=true) => {
    const condition = allowBurned ? `where: {owner_address: {_in: ${JSON.stringify(addresses)}}, limit: ${pageSize}, offset: ${(page - 1) * pageSize}` : `where: {owner_address: {_in: ${JSON.stringify(addresses)}}, is_burned: {_eq: false}}, limit: ${pageSize}, offset: ${(page - 1) * pageSize}`
    const doc = gql('spores', condition)
    const res: any = await query(doc, undefined, isMainnet)
    return res.spores as Spores[]
}

export const querySporesById = async (id: string, isMainnet=true) => {
    const condition = `where: {id: {_eq: "${id}"}}`
    const doc = gql('spores', condition)
    const res: any = await query(doc, undefined, isMainnet)
    return res.spores[0] as Spores || null
}

export const queryClustersByIds = async (id: string, isMainnet=true) => {
    const doc = gql('clusters', `where: {id: {_eq: "${'\\' + id}"}}`)
    const res: {clusters: Clusters[]} = await query(doc, undefined, isMainnet)
    return res.clusters[0] || null
}

