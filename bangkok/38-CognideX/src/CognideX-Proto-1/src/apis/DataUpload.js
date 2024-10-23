import { get } from "aws-amplify/api";

export const getUserDataUploads = async (userId) => {
    try {
        const { body } = await get({
            apiName: 'cognidexFileUploadApi',
            path: `/upload/${userId}`
        }).response;

        const userUploads = await body.json();

        return userUploads;
    } catch (error) {
        console.error('Error fetching user data uploads:', error);
        return null;
    }
}

export const getDataPoolUploads = async (dataPoolId) => {
    try {
        const { body } = await get({
            apiName: 'cognidexFileUploadApi',
            path: `/upload/datapool/${dataPoolId}`
        }).response;

        const dataPoolUploads = await body.json();

        return dataPoolUploads;
    } catch (error) {
        console.error('Error fetching data pool uploads:', error);
        return null;
    }
}