import { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

export const validateFindParams = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { from, to, max_stops, max_switches } = req.query;
    const maxStops = Number(max_stops);
    const maxSwitches = Number(max_switches);

    if (!from || !to) {
      next(new HttpException(422, "'from' and/or 'to' airport not defined."));
      return;
    }
    if (max_stops && (isNaN(maxStops) || maxStops < 0)) {
      next(new HttpException(422, "'max_stops' has to be a number equal to or greater than zero."));
      return;
    }
    if (max_switches && (isNaN(maxSwitches) || maxSwitches < 0)) {
      next(
        new HttpException(422, "'max_switches' has to be a number equal to or greater than zero."),
      );
      return;
    }

    next();
  };
};
