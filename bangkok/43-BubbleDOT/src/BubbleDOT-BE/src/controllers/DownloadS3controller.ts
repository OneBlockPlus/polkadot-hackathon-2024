import { Request, Response, NextFunction } from 'express';
import { downloadAllFilesFromBucket } from '../services/DownloadS3.Service';


const downloadFileFromS3 = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await downloadAllFilesFromBucket();
        res.status(200).json({ message: 'File download initiated successfully.' });
    } catch (error) {
        next(error);
    }
};

export { downloadFileFromS3 };