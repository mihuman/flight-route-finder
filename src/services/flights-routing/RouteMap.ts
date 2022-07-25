import { RouteType } from '@/enums/route.enum';
import { AirportId } from '@/types/airport.types';
import { ConnectionMap, RouteInfo } from '@/types/route.types';

class RouteMap {
  private map = new Map<AirportId, ConnectionMap>();

  public get(from: AirportId, to: AirportId): RouteInfo | undefined {
    return this.map.has(from) && this.map.get(from).get(to);
  }

  public set(from: AirportId, to: AirportId, routeInfo: RouteInfo) {
    const connections: ConnectionMap = this.map.get(from) || new Map<AirportId, RouteInfo>();
    connections.set(to, routeInfo);
    this.map.set(from, connections);
  }

  public has(from: AirportId, to: AirportId): Boolean {
    return this.map.has(from) && this.map.get(from).has(to);
  }

  public getMap(): Map<AirportId, ConnectionMap> {
    return this.map;
  }

  private toJSON() {
    const result = {};

    this.map.forEach((connections, from) => {
      const connectionsObj = {};

      connections.forEach((routeInfo, to) => {
        connectionsObj[to] = routeInfo;
      });

      result[from] = connectionsObj;
    });

    return result;
  }

  public static fromJSON(json: Object) {
    const result = new RouteMap();

    Object.keys(json).forEach(from => {
      const connections: ConnectionMap = json[from];

      Object.keys(connections).forEach(to => {
        const { cost, type }: RouteInfo = connections[to];
        result.set(Number(from), Number(to), { cost, type: RouteType[type] });
      });
    });

    return result;
  }

  private *[Symbol.iterator]() {
    for (const [from, connections] of this.map) {
      for (const [to, routeInfo] of connections) {
        yield { from, to, routeInfo };
      }
    }
  }
}

export default RouteMap;
