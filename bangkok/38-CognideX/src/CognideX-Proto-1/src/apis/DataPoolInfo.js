import { get } from "aws-amplify/api";

export const getDataPoolInfo = async (dataPoolid) => {
    try {
        const { body } = await get({
            apiName: 'cognidexDataPoolApi',
            path: `/data-pool/${dataPoolid}`
        }).response;

        const dataPoolInfo = await body.json();

        return dataPoolInfo[0];
    } catch (error) {
        console.error('Error getting data pool info:', error);
        return null;
    }
}

export const getDataPoolList = async () => {
    try {
        const { body } = await get({
            apiName: 'cognidexDataPoolApi',
            path: '/data-pool'
        }).response;

        const dataPoolList = await body.json();

        return dataPoolList;
    } catch (error) {
        console.error('Error getting data pool list:', error);
        return null;
    }
}