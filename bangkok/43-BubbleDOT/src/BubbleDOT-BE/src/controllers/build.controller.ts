import { Request, Response, NextFunction } from 'express';
import { buildProject } from '../services/build.Service';

const buildEndpoint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await buildProject();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Build initiation failed.', 
      status: 'false', 
      error: error instanceof Error ? error.message : JSON.stringify(error)
    });
  }
};

export { buildEndpoint };
