import { HttpException } from '@/exceptions/HttpException';
import AirportRepository from '@/repositories/airport.repository';
import RouteRepository from '@/repositories/route.repository';
import { Airport } from '@/types/airport.types';
import { ShortestPath, ShortestPathOptions, ShortestPathResult } from '@/types/graph.types';
import { RouteInfo } from '@/types/route.types';
import {
  RoutingResult,
  RoutingResultAirports,
  RoutingResultContainer,
  RoutingResultSegment,
} from '@/types/routing.types';
import { round } from '@utils/util';
import RoutingGraph from './flights-routing/RoutingGraph';

class FlightsService {
  private graph: RoutingGraph = null;

  constructor() {
    this.graph = new RoutingGraph();
  }

  public find(from: string, to: string, options: ShortestPathOptions): RoutingResultContainer {
    const fromAp: Airport | undefined = AirportRepository.getByCode(from);
    const toAp: Airport | undefined = AirportRepository.getByCode(to);

    if (!fromAp) {
      throw new HttpException(400, `Cannot find airport with the code '${from}'.`);
    }
    if (!toAp) {
      throw new HttpException(400, `Cannot find airport with the code '${to}'.`);
    }

    const shortestPath = this.graph.path(fromAp.id, toAp.id, options);
    return this.buildResult(fromAp, toAp, shortestPath);
  }

  private buildResult(
    from: Airport,
    to: Airport,
    shortestPath: ShortestPathResult,
  ): RoutingResultContainer {
    const { path, cost } = shortestPath;

    if (!path || !path.length || path.length < 2) {
      throw new HttpException(400, 'Cannot find route.');
    }

    const result: RoutingResult = {
      airports: this.getAirports(path),
      from: from.id,
      to: to.id,
      segments: this.buildResultingSegments(path),
      totalDistance: round(cost),
    };

    return { result };
  }

  private getAirports(path: ShortestPath): RoutingResultAirports {
    const airports: RoutingResultAirports = {};

    for (const airportId of path) {
      const airport: Airport | undefined = AirportRepository.getById(airportId);

      if (!airport) {
        throw new HttpException(500, 'There was a problem retrieving results.');
      }

      airports[airport.id] = airport;
    }

    return airports;
  }

  private buildResultingSegments(path: ShortestPath): RoutingResultSegment[] {
    const segments: RoutingResultSegment[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const route: RouteInfo | undefined = RouteRepository.getBetween(path[i], path[i + 1]);

      if (!route) {
        throw new HttpException(500, 'There was a problem retrieving results.');
      }

      segments.push({
        from: path[i],
        to: path[i + 1],
        distance: route.cost,
        type: route.type,
      });
    }

    return segments;
  }
}

export default FlightsService;
