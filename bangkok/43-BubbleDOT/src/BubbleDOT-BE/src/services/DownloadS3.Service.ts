import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import { Readable } from 'stream';
import path from 'path';


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

const downloadFile = async (bucketName: string, key: string, downloadPath: string): Promise<void> => {
    try {
        console.log(`Starting download of ${key}...`);
        const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
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

const downloadAllFilesFromBucket = async (bucketName: string): Promise<void> => {
    const files = await listFilesInBucket(bucketName);
    // Tạo thư mục với tên là bucketName nếu chưa tồn tại
    const bucketDir = path.join(process.cwd(), 'Downloads', bucketName);
    if (!fs.existsSync(bucketDir)) {
        console.log(`Creating directory: ${bucketDir}`);
        fs.mkdirSync(bucketDir, { recursive: true });
    }
    for (const fileKey of files) {
        // Remove leading slashes from the file key
        const cleanedFileKey = fileKey.replace(/^\//, ''); // Remove the leading slash if it exists
        // Create a more organized path by removing the `/home/project/` part of the key
        const fileName = path.basename(cleanedFileKey);
        const downloadPath = path.join(bucketDir, fileName); // Save directly in the bucket directory
        if (fileKey.endsWith('/')) {
            // It's a directory
            console.log(`Creating directory: ${downloadPath}`);
            // Create a directory if the fileKey is a folder
            if (!fs.existsSync(downloadPath)) {
                fs.mkdirSync(downloadPath, { recursive: true });
            }
        } else {
            // Ensure the parent directory exists before downloading the file
            const dirName = path.dirname(downloadPath);
            fs.mkdirSync(dirName, { recursive: true });
            await downloadFile(bucketName, fileKey, downloadPath);
        }
    }
    console.log('All files have been processed.');
};

export { downloadAllFilesFromBucket };