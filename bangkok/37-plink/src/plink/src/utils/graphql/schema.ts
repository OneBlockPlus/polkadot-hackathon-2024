const xudt_cell = `xudt_cell(){
        amount
        lock_id
        transaction_index
        type_id
        xudt_args
        xudt_data
        xudt_data_lock
        xudt_owner_lock_script_hash
        transaction_hash
        is_consumed
        addressByTypeId {
            id
            script_args
            script_code_hash
            script_hash_type
            token_info {
              decimal
              name
              symbol
              transaction_hash
              transaction_index
            }
            token_infos {
              decimal
              name
              symbol
              expected_supply
              mint_limit
              mint_status
              udt_hash
            }
        }
    }`

const token_info = `token_info(){
        decimal
        name
        symbol
        transaction_hash
        transaction_index
        type_id
    }`

const token_info_address = `token_info(){
        decimal
        name
        symbol
        transaction_hash
        transaction_index
        type_id
        addressByInscriptionId {
            token_infos {
                decimal
                name
                symbol
                transaction_hash
                transaction_index
                type_id
            }
        }
        address {
          id
          script_args
          script_code_hash
          script_hash_type
        }
    }`

const xudt_status_cell = `xudt_status_cell(){
        input_transaction_hash
        input_transaction_index
        transaction_hash
        transaction_index
      }`

const spores = `spores(){
         id
         content
         cluster_id
         is_burned
         owner_address
         content_type
         created_at
         updated_at
         addressByTypeId {
              id
              script_args
              script_code_hash
              script_hash_type
            }
      }`


const clusters = `clusters(){
        cluster_description
        cluster_name
        created_at
        id
        is_burned
        mutant_id
        owner_address
        updated_at
      }`



const schema = {
    xudt_cell,
    token_info,
    xudt_status_cell,
    spores,
    clusters,
    token_info_address
}

export const gql = (type: keyof typeof schema, opt?: string) => {
    let query = schema[type]

    if (!query) {
        throw new Error(`Invalid query type: ${type}`)
    }

    query = query.replace('()', opt ? `(${opt})` : '')

    query = `query MyQuery {
        ${query}
    }`

    return query
}

export const gqls = (props: { type: keyof typeof schema, key?: string, opt?: string }[]) => {
    let query = ''

    props.forEach(({type, opt,key}) => {
        let q = schema[type]

        if (!q) {
            throw new Error(`Invalid query type: ${type}`)
        }

        q = q.replace('()', opt ? `(${opt})` : '')

        if (key) {
            q = `${key}: ${q}`
        }

        query += q + '\n'
    })

    query = `query MyQuery {
        ${query}
    }`

    return query
}

export default schema
