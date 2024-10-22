import { Request, Response, NextFunction } from 'express';
import { downloadAllFilesFromBucket } from '../services/DownloadS3.Service';
const downloadFileFromS3 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { bucketName } = req.body;
    try {
        await downloadAllFilesFromBucket(bucketName);
        res.status(200).json({ message: 'File download initiated successfully.' });
    } catch (error) {
        next(error);
    }
};
export { downloadFileFromS3 };