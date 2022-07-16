import { NextFunction, Request, Response } from 'express';
import { DEFAULT_MAX_ROUTE_STOPS } from '@/config';
import FlightsService from '@/services/flights.service';

class FlightsController {
  public flightsService = new FlightsService();

  public find = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const from = req.query.from.toString();
      const to = req.query.to.toString();
      let maxStops = Number(req.query.max_stops);
      maxStops = isNaN(maxStops) ? DEFAULT_MAX_ROUTE_STOPS : maxStops;

      const result = this.flightsService.find(from, to, { maxStops });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default FlightsController;
