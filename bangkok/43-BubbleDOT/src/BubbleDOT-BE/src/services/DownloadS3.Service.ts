import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import { Readable } from 'stream';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({ region: 'ap-southeast-2' });

const listFilesInBucket = async (bucketName: string): Promise<string[]> => {
    try {
        const command = new ListObjectsV2Command({ Bucket: bucketName });
        const response = await s3Client.send(command);
        console.log('Fetched files from bucket:', bucketName);
        console.log('Files:', response.Contents?.map((item) => item.Key) || []);
        return response.Contents?.map((item) => item.Key!) || [];
    } catch (error) {
        console.error('Error fetching files from bucket:', error);
        return [];
    }
};

const downloadFile = async (key: string, downloadPath: string): Promise<void> => {
    try {
        const bucketName = process.env.BUCKET_NAME;
        if (!bucketName) {
            throw new Error('BUCKET_NAME is not defined');
        } const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
        const response = await s3Client.send(command);
        const stream = response.Body as Readable;
        const writableStream = fs.createWriteStream(downloadPath);
        const readable = Readable.from(stream);
        readable.pipe(writableStream);
        writableStream.on('finish', () => {
            console.log(`File ${key} downloaded successfully to: ${downloadPath}`);
        });
    } catch (err) {
        console.error(`Error downloading file ${key}:`, err);
    }
};

const downloadAllFilesFromBucket = async (): Promise<void> => {

    const files = await listFilesInBucket(bucketName);
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
        throw new Error('BUCKET_NAME is not defined');
    } const bucketDir = path.join(process.cwd(), 'Downloads', bucketName);

    if (!fs.existsSync(bucketDir)) {
        console.log(`Creating directory: ${bucketDir}`);
        fs.mkdirSync(bucketDir, { recursive: true });
    }

    for (const fileKey of files) {
        const cleanedFileKey = fileKey.replace(/^\//, '');
        const downloadPath = path.join(bucketDir, cleanedFileKey);
        const dirName = path.dirname(downloadPath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
        await downloadFile(fileKey, downloadPath);

    }
    console.log('All files have been downloaded and saved with the correct structure.');
};

export { downloadAllFilesFromBucket };