import { Request, Response, NextFunction } from 'express';
import { buildProject } from '../services/build.Service';
const buildEndpoint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bucketName } = req.body;
    await buildProject(bucketName); 
    res.status(200).json({ message: 'Build initiated successfully.' });
  } catch (error) {
    next(error);
  }
};
export { buildEndpoint };