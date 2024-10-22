import { Request, Response, NextFunction } from 'express';
import { getBuckets } from '../services/getBucket.Service';
const getBucketsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buckets = await getBuckets();
    res.status(200).json({ message: 'Buckets retrieved successfully', buckets });
  } catch (error) {
    next(error);
  }
};
export { getBucketsController };