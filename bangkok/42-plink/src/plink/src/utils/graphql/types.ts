export interface XudtCell {
    amount: string
    lock_id: string
    transaction_index: string
    type_id: string
    xudt_args: string
    xudt_data: string
    xudt_data_lock: string
    xudt_owner_lock_script_hash: string
    transaction_hash: string
    addressByTypeId?: {
        id: string
        script_args: string
        script_code_hash: string
        script_hash_type: string
        token_info: {
            decimal: number
            name: string
            symbol: string
            transaction_hash?: string
            transaction_index?: string
        }
        token_infos: {
            decimal: number
            name: string
            symbol: string
            expected_supply: string
            mint_limit: string
            mint_status: string
            udt_hash: string
        }[]
    }
}

export interface TokenInfo {
    decimal: number
    name: string
    symbol: string
    type_id: string
    transaction_hash?: string
    transaction_index?: string
}

export interface TokenInfoWithAddress extends TokenInfo {
    address: {
        id: string
        script_args: string
        script_code_hash: string
        script_hash_type: string
    }
    addressByInscriptionId : {
        token_infos: {
            decimal: number
            name: string
            symbol: string
            type_id: string
            transaction_hash?: string
            transaction_index?: string
        }
    } | null
}

export interface XudtStatusCell {
    input_transaction_hash: string
    input_transaction_index: string
    transaction_hash: string
    transaction_index: string
}

export interface Spores {
    id: string
    content: string
    cluster_id: string
    is_burned: boolean
    owner_address: string
    content_type: string
    created_at: string
    updated_at: string
    addressByTypeId: {
        id: string
        script_args: string
        script_code_hash: string
        script_hash_type: string
    }
}

export interface Clusters {
    cluster_description: string
    cluster_name: string
    created_at: string
    id:string
    is_burned: boolean
    mutant_id: string
    owner_address: string
    updated_at: string
}

