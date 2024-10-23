import { uploadData } from 'aws-amplify/storage';
import { fetchUserAttributes } from 'aws-amplify/auth';

export const uploadFile = async (file, datapool_name) => {
    try {
        const user = await fetchUserAttributes();
        const fileKey = `${user.sub}/${datapool_name}/${datapool_name}_unverified`;
        const result = await uploadData({
            path: fileKey,
            data: file,
            options: {
                bucketName: 'cognidex-unverified-s370e21-dev',
                region: 'ap-southeast-1'
            }
        }).result;
        // Encode the key to base64
        const base64ResultPath = btoa(result.path);
        return base64ResultPath;
    } catch (error) {
        console.error('Error uploading file: ', error);
        return null;
    }
}