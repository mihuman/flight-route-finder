import { Airport, AirportCode, AirportCodeMap, AirportId, AirportMap } from '@/types/airport.types';
import airportData from '../../data/airports.json';

class AirportRepository {
  private airportMap: AirportMap = new Map<AirportId, Airport>();
  private airportCodeMap: AirportCodeMap = new Map<AirportCode, AirportId>();

  constructor() {
    this.airportMap = this.buildAirportMap();
    this.airportCodeMap = this.buildAirportCodeMap();
  }

  private buildAirportMap(): AirportMap {
    const result = new Map<AirportId, Airport>();

    Object.keys(airportData.airports).forEach(id => {
      const airport: Airport = airportData.airports[id];
      result.set(Number(id), airport);
    });

    return result;
  }

  private buildAirportCodeMap(): AirportCodeMap {
    const result = new Map<AirportCode, AirportId>();

    Object.keys(airportData.codes).forEach(code => {
      const id: AirportId = airportData.codes[code];
      result.set(code, id);
    });

    return result;
  }

  public getById(id: AirportId): Airport | undefined {
    return this.airportMap.get(id);
  }

  public getByCode(code: AirportCode): Airport | undefined {
    return this.airportMap.get(this.airportCodeMap.get(code));
  }
}

export default new AirportRepository();
