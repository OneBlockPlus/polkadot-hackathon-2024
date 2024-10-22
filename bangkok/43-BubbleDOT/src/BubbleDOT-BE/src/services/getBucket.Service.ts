import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../configs/cloud.congig';


const getBuckets = async (): Promise<string[]> => {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log(response);
    return response.Buckets?.map((bucket) => bucket.Name!) || [];
  } catch (error) {
    console.error('Error fetching buckets:', error);
    return [];
  }
};

export { getBuckets };