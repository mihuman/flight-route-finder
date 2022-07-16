import { AirportId } from './airport.types';
import { RouteType } from '@/enums/route.enum';

export type ParsedRoute = {
  from: number | string;
  to: number | string;
};

export type Route = {
  from: AirportId;
  to: AirportId;
};

export type RouteInfo = {
  cost: number;
  type: RouteType;
};

export type ConnectionMap = Map<AirportId, RouteInfo>;
