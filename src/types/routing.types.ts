import { Airport, AirportId } from './airport.types';
import { RouteInfo } from './route.types';

export type RoutingResultAirports = {
  [id: AirportId]: Airport;
};

export type RoutingResultRouteInfo = Omit<RouteInfo, 'cost'> & {
  distance: number;
};

export type RoutingResultSegment = RoutingResultRouteInfo & {
  from: AirportId;
  to: AirportId;
};

export type RoutingResult = {
  airports: RoutingResultAirports;
  from: AirportId;
  to: AirportId;
  segments: RoutingResultSegment[];
  totalDistance: number;
};

export type RoutingResultContainer = {
  result: RoutingResult;
};
