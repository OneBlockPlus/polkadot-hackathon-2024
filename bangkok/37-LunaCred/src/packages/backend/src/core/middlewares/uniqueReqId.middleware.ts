import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import httpContext from 'express-http-context';
import logger from '@core/utils/logger';

const uniqueReqId = (req: Request, res: Response, next: NextFunction) => {
  httpContext.set('ReqId', uuidv4());
  logger.info(`START Request Id: ${httpContext.get('ReqId')}`);
  res.on('finish', () => {
    logger.info(`END Request Id: ${httpContext.get('ReqId')}`);
  });
  return next();
};

export default uniqueReqId;
