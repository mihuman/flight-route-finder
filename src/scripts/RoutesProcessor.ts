import fs from 'fs';
import csv from 'csvtojson';
import { RouteType } from '@/enums/route.enum';
import { ParsedRoute, Route, RouteInfo } from '@/types/route.types';
import { Airport, AirportId, AirportMap } from '@/types/airport.types';
import { getDistanceKm } from '@/utils/util';
import { NULL_VALUE } from '@/scripts/constants';
import RouteMap from '@/services/flights-routing/RouteMap';

class RoutesProcessor {
  private routes: Route[] = [];
  private routeMap: RouteMap = new RouteMap();

  public getRouteMap(): RouteMap {
    return this.routeMap;
  }

  public async process(csvFile: string, airports: AirportMap, adjacentAirports: RouteMap) {
    this.routes = await this.read(csvFile);
    this.routeMap = this.calculateFlightDistances(airports);
    this.addGroundRoutes(adjacentAirports);
  }

  private async read(csvFile: string): Promise<Route[]> {
    const routes: ParsedRoute[] = await csv({
      noheader: true,
      headers: [, , , 'from', , 'to'],
      checkType: true,
      includeColumns: /(from|to)/,
    }).fromFile(csvFile);

    return routes
      .filter(
        route =>
          route.from !== NULL_VALUE &&
          route.to !== NULL_VALUE &&
          route.from !== route.to &&
          !isNaN(Number(route.from)) &&
          !isNaN(Number(route.to)),
      )
      .map(route => ({ from: Number(route.from), to: Number(route.to) }));
  }

  private calculateFlightDistances(airports: AirportMap): RouteMap {
    const result = new RouteMap();

    this.routes.forEach(route => {
      const { from, to } = route;
      const fromAp: Airport | undefined = airports.get(from);
      const toAp: Airport | undefined = airports.get(to);

      if (fromAp && toAp) {
        const routeInfo: RouteInfo = {
          cost: getDistanceKm(fromAp, toAp),
          type: RouteType.FLIGHT,
        };

        result.set(from, to, routeInfo);
      }
    });

    return result;
  }

  private isFlightBetween(from: AirportId, to: AirportId): Boolean {
    return this.routeMap.has(from, to);
  }

  private addGroundRoutes(adjacentAirports: RouteMap) {
    for (const { from, to, routeInfo } of adjacentAirports) {
      if (this.isFlightBetween(from, to)) {
        this.routeMap.set(from, to, {
          ...this.routeMap.get(from, to),
          type: RouteType.EITHER,
        });
      } else {
        this.routeMap.set(from, to, routeInfo);
      }
    }
  }

  public write(jsonFile: string) {
    fs.writeFileSync(jsonFile, JSON.stringify(this.routeMap), 'utf8');
  }
}

export default RoutesProcessor;
