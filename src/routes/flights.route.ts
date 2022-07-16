import { Router } from 'express';
import FlightsController from '@/controllers/flights.controller';
import { Routes } from '@interfaces/routes.interface';
import { validateFindParams } from '@/middlewares/flights.validation';

class FlightsRoute implements Routes {
  public path = '/flights';
  public router = Router();
  public flightsController = new FlightsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/find`, validateFindParams(), this.flightsController.find);
  }
}

export default FlightsRoute;
