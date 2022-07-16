import { Airport, AirportInfo } from './airport.types';
import { RouteInfo } from './route.types';

export type RoutingResultRouteInfo = Omit<RouteInfo, 'cost'> & {
  distance: number;
};

export type RoutingResultSegment = RoutingResultRouteInfo & {
  from: AirportInfo;
  to: AirportInfo;
};

export type RoutingResult = {
  segments: RoutingResultSegment[];
  totalDistance: number;
};

export type RoutingResultContainer = {
  from?: Airport;
  to?: Airport;
  result?: RoutingResult;
  error?: string;
};
