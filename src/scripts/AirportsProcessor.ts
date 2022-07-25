import fs from 'fs';
import csv from 'csvtojson';
import { MAX_ADJACENT_AIRPORT_DISTANCE } from '@/config';
import { AirportId, AirportCode, Airport, AirportMap, AirportCodeMap } from '@/types/airport.types';
import { getDistanceKm } from '@/utils/util';
import { NULL_VALUE } from '@/scripts/constants';
import { RouteType } from '@/enums/route.enum';
import RouteMap from '@/services/flights-routing/RouteMap';

class AirportsProcessor {
  private airports: Airport[] = [];
  private airportMap: AirportMap = new Map<AirportId, Airport>();
  private airportCodeMap: AirportCodeMap = new Map<AirportCode, AirportId>();

  public getAirportMap(): AirportMap {
    return this.airportMap;
  }

  public getAirportCodeMap(): AirportCodeMap {
    return this.airportCodeMap;
  }

  public async process(csvFile: string) {
    this.airports = await this.read(csvFile);
    this.airportMap = this.mapById();
    this.airportCodeMap = this.getCodeMap();
  }

  private async read(csvFile: string): Promise<Airport[]> {
    const airports: Airport[] = await csv({
      noheader: true,
      headers: ['id', 'name', 'city', 'country', 'iata', 'icao', 'latitude', 'longitude'],
      checkType: true,
      ignoreColumns: /field/,
      colParser: {
        iata: iata => (iata === NULL_VALUE ? null : iata),
        icao: icao => (icao === NULL_VALUE ? null : icao),
      },
    }).fromFile(csvFile);

    return airports.filter(airport => airport.iata || airport.icao);
  }

  private mapById(): AirportMap {
    const result = new Map<AirportId, Airport>();

    this.airports.forEach(airport => {
      result.set(airport.id, airport);
    });

    return result;
  }

  private getCodeMap(): AirportCodeMap {
    const result = new Map<AirportCode, AirportId>();

    this.airports.forEach(airport => {
      const { id, iata, icao } = airport;
      if (iata) result.set(iata, id);
      if (icao) result.set(icao, id);
    });

    return result;
  }

  public getAdjacentAirports(): RouteMap {
    const result = new RouteMap();

    for (let i = 0; i < this.airports.length; i++) {
      for (let j = i + 1; j < this.airports.length; j++) {
        const from: Airport = this.airports[i];
        const to: Airport = this.airports[j];
        const distanceKm = getDistanceKm(from, to);

        if (distanceKm <= MAX_ADJACENT_AIRPORT_DISTANCE) {
          result.set(from.id, to.id, { cost: distanceKm, type: RouteType.GROUND });
          result.set(to.id, from.id, { cost: distanceKm, type: RouteType.GROUND });
        }
      }
    }

    return result;
  }

  public write(jsonFile: string) {
    fs.writeFileSync(
      jsonFile,
      JSON.stringify({
        airports: Object.fromEntries(this.airportMap),
        codes: Object.fromEntries(this.airportCodeMap),
      }),
      'utf8',
    );
  }
}

export default AirportsProcessor;
