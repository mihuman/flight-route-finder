import RouteMap from '@/services/flights-routing/RouteMap';
import { AirportId } from '@/types/airport.types';
import { ConnectionMap, RouteInfo } from '@/types/route.types';
import routeData from '../../data/routes.json';

class RouteRepository {
  private routeMap = new RouteMap();

  constructor() {
    this.routeMap = RouteMap.fromJSON(routeData);
  }

  getAll(): Map<AirportId, ConnectionMap> {
    return this.routeMap.getMap();
  }

  getBetween(from: AirportId, to: AirportId): RouteInfo | undefined {
    return this.routeMap.get(from, to);
  }
}

export default new RouteRepository();
