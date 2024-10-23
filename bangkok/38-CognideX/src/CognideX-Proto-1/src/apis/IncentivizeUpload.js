import { post } from "aws-amplify/api";

export const incentivizeUpload = async (user_id, datapool_id, address) => {
    try {
        const { body } = await post({
            apiName: 'cognidexSmartContractApi',
            path: '/smart-contract/upload-incentive',
            options: {
                body: {
                    userId: user_id,
                    dataPoolId: datapool_id,
                    clientAccountAddress: address
                }
            }
        }).response;

        const data = await body.json();

        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Error incentivizing upload');
    }
}