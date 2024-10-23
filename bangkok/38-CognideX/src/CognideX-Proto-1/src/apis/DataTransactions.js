import { post, get } from "aws-amplify/api";

export const getTransactions = async (client_account_address) => {
    try {
        const { body } = await get({
            apiName: 'cognidexTransactionsApi',
            path: '/transactions',
            options: {
                queryParams: {
                    clientAccountAddress: client_account_address
                }
            }
        }).response;

        const transactions = await body.json();

        return transactions;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw new Error('Error fetching transaction');
    }
}

export const fulfillTransaction = async (transaction_hash, client_account_address, spent_amount) => {
    try {
        const { body } = await post({
            apiName: 'cognidexTransactionsApi',
            path: '/transactions',
            options: {
                body: {
                    transactionHash: transaction_hash,
                    clientAccountAddress: client_account_address,
                    spentAmount: spent_amount
                }
            }
        }).response;

        const data = await body.json();

        return data;
    } catch (error) {
        console.error('Error fulfilling transaction:', error);
        throw new Error('Error fulfilling transaction');
    }
}