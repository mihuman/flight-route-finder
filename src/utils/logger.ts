import { NextFunction, Request, Response } from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    console.log(`[${req.method}] ${decodeURI(req.url)} ${res.statusCode} ${res.statusMessage}`);
  });
  next();
};

export default logger;
