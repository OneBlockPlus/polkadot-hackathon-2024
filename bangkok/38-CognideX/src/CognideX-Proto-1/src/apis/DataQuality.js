import axios from 'axios';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

export const dataQuality = async (datapool_name, dataset_filepath) => {
    if (!dataset_filepath) {
        console.error('Dataset location is required.');
        return;
    }

    try {
        const session = await fetchAuthSession();
        const user = await fetchUserAttributes();

        if (!session || !session.tokens || !session.tokens.idToken) {
            console.error('No valid session or token found.');
            return;
        } else if (!user || !user.sub) {
            console.error('No valid user found.');
            return;
        }

        const token = session.tokens.idToken;
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        // Payload will go into params as query parameters, body stays null
        const dataQualityRes = await axios.post(
            `https://data-quality-ecs.cognidex.ai:5000/upload_v2`,
            null, // no body
            {
                headers,
                params: {
                    title: datapool_name,
                    ObjectLocation: dataset_filepath,
                    userId: user.sub,
                },
            }
        );

        return dataQualityRes;
    } catch (error) {
        console.error('Error calculating data quality:', error.response?.data || error.message);
        return error;
    }
};
