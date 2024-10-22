import { Request, Response, NextFunction } from 'express';
import { downloadAllFilesFromBucket } from '../services/Download.Service';

const downloadFileFromS3 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, error } = await downloadAllFilesFromBucket();
        if (status === 'success') {
            res.status(200).json({ 
                message: 'File download initiated successfully.', 
                status, 
                error 
            });
        } else {
            res.status(500).json({ 
                message: 'File download failed.', 
                status, 
                error 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'An unexpected error occurred.', 
            status: 'false', 
            error: error as string 
        });
    }
};
export { downloadFileFromS3 };
