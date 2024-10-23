import { EC2Client } from '@aws-sdk/client-ec2';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY_ID;
if (!region) {
    throw new Error("Region is missing");
}
if (!accessKeyId) {
    throw new Error("Access key is missing");
}
if (!secretAccessKey) {
    throw new Error("Secret access key is missing");
}
const ec2Client = new EC2Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});
const s3Client = new S3Client({
    region: region,
    endpoint: 'https://bubble-dot.s3-ap-southeast-2.amazonaws.com',
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});
export { ec2Client, s3Client };