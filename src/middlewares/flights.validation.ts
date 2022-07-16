import { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

export const validateFindParams = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { from, to, max_stops } = req.query;
    const maxStops = Number(max_stops);

    if (!from || !to) {
      next(new HttpException(422, "'from' and/or 'to' airport not defined."));
      return;
    }
    if (max_stops && (isNaN(maxStops) || maxStops < 0)) {
      next(new HttpException(422, "'max_stops' has to be a number equal to or greater than zero."));
      return;
    }

    next();
  };
};
