import request from 'supertest';
import App from '@/app';
import FlightsRoute from '@routes/flights.route';
import { RoutingResultContainer, RoutingResultRouteInfo } from '@/types/routing.types';
import { Airport } from '@/types/airport.types';

let flightsRoute: FlightsRoute;
let app: App;

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing flights route', () => {
  beforeEach(() => {
    flightsRoute = new FlightsRoute();
    app = new App([flightsRoute]);
  });

  describe('[GET] /flights/find', () => {
    type HumanReadableSegment = RoutingResultRouteInfo & {
      from: string;
      to: string;
    };

    type HumanReadableRoutingResult = {
      segments: HumanReadableSegment[];
      totalDistance: number;
    };

    const toHumanReadable = (body: RoutingResultContainer): HumanReadableRoutingResult => ({
      segments: body.result.segments.map(segment => {
        const fromAp: Airport = body.result.airports[segment.from];
        const toAp: Airport = body.result.airports[segment.to];

        return {
          from: `${fromAp.name} (${fromAp.country})`,
          to: `${toAp.name} (${toAp.country})`,
          distance: segment.distance,
          type: segment.type,
        };
      }),
      totalDistance: body.result.totalDistance,
    });

    describe('Basic shortest path', () => {
      it('responds with 200 when route is found', () => {
        // Tallinn -> Palanga
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=PLQ`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Lennart Meri Tallinn Airport (Estonia)',
                  to: 'Riga International Airport (Latvia)',
                  distance: 281.41,
                  type: 'FLIGHT',
                },
                {
                  from: 'Riga International Airport (Latvia)',
                  to: 'Palanga International Airport (Lithuania)',
                  distance: 205.97,
                  type: 'FLIGHT',
                },
              ],
              totalDistance: 487.38,
            });
          });
      });

      it('responds with 200 when route is found (full response)', () => {
        // Tallinn -> Palanga
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=PLQ`)
          .expect(200, {
            result: {
              airports: {
                '415': {
                  id: 415,
                  name: 'Lennart Meri Tallinn Airport',
                  city: 'Tallinn-ulemiste International',
                  country: 'Estonia',
                  iata: 'TLL',
                  icao: 'EETN',
                  latitude: 59.41329956049999,
                  longitude: 24.832799911499997,
                },
                '3953': {
                  id: 3953,
                  name: 'Riga International Airport',
                  city: 'Riga',
                  country: 'Latvia',
                  iata: 'RIX',
                  icao: 'EVRA',
                  latitude: 56.92359924316406,
                  longitude: 23.971099853515625,
                },
                '3958': {
                  id: 3958,
                  name: 'Palanga International Airport',
                  city: 'Palanga',
                  country: 'Lithuania',
                  iata: 'PLQ',
                  icao: 'EYPA',
                  latitude: 55.973201751708984,
                  longitude: 21.093900680541992,
                },
              },
              from: 415,
              to: 3958,
              segments: [
                {
                  from: 415,
                  to: 3953,
                  distance: 281.41,
                  type: 'FLIGHT',
                },
                {
                  from: 3953,
                  to: 3958,
                  distance: 205.97,
                  type: 'FLIGHT',
                },
              ],
              totalDistance: 487.38,
            },
          });
      });

      it('finds shortest route using ICAO codes, and responds with 200', () => {
        // Tallinn -> Palanga
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=EETN&to=EYPA`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Lennart Meri Tallinn Airport (Estonia)',
                  to: 'Riga International Airport (Latvia)',
                  distance: 281.41,
                  type: 'FLIGHT',
                },
                {
                  from: 'Riga International Airport (Latvia)',
                  to: 'Palanga International Airport (Lithuania)',
                  distance: 205.97,
                  type: 'FLIGHT',
                },
              ],
              totalDistance: 487.38,
            });
          });
      });

      it('responds with 400 when route is not found', () => {
        // Tallinn -> Tartu: no possible route
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=TAY`)
          .expect(400, {
            error: 'Cannot find route.',
          });
      });
    });

    describe('Shortest path with direct route', () => {
      it('finds the direct flight route when available, and responds with 200', () => {
        // Tallinn -> Riga
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=RIX`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Lennart Meri Tallinn Airport (Estonia)',
                  to: 'Riga International Airport (Latvia)',
                  distance: 281.41,
                  type: 'FLIGHT',
                },
              ],
              totalDistance: 281.41,
            });
          });
      });

      it('finds the direct ground switch route when available, and responds with 200', () => {
        // Kaunas -> Vilnius
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=KUN&to=VNO`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Kaunas International Airport (Lithuania)',
                  to: 'Vilnius International Airport (Lithuania)',
                  distance: 85.27,
                  type: 'GROUND',
                },
              ],
              totalDistance: 85.27,
            });
          });
      });
    });

    describe('Shortest path with custom options', () => {
      it('finds shortest route with flights using no ground switches, and responds with 200', () => {
        // Tallinn -> Kärdla with no switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=KDL&max_switches=0`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Lennart Meri Tallinn Airport (Estonia)',
                  to: 'Kuressaare Airport (Estonia)',
                  distance: 187.6,
                  type: 'FLIGHT',
                },
                {
                  from: 'Kuressaare Airport (Estonia)',
                  to: 'Kärdla Airport (Estonia)',
                  distance: 86.63,
                  type: 'EITHER',
                },
              ],
              totalDistance: 274.23,
            });
          });
      });

      it('finds shortest route on the ground using two switches, and responds with 200', () => {
        // Tallinn -> Kärdla with at most 2 switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=KDL&max_switches=2`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Lennart Meri Tallinn Airport (Estonia)',
                  to: 'Ämari Air Base (Estonia)',
                  distance: 39.28,
                  type: 'GROUND',
                },
                {
                  from: 'Ämari Air Base (Estonia)',
                  to: 'Kärdla Airport (Estonia)',
                  distance: 84.13,
                  type: 'GROUND',
                },
              ],
              totalDistance: 123.41,
            });
          });
      });

      it('finds shortest route across multiple ground switches, and responds with 200', () => {
        // Kärdla -> Vilnius with at most 10 switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=KDL&to=VNO&max_switches=10`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Kärdla Airport (Estonia)',
                  to: 'Kuressaare Airport (Estonia)',
                  distance: 86.63,
                  type: 'EITHER',
                },
                {
                  from: 'Kuressaare Airport (Estonia)',
                  to: 'Ruhnu Airfield (Estonia)',
                  distance: 66.68,
                  type: 'EITHER',
                },
                {
                  from: 'Ruhnu Airfield (Estonia)',
                  to: 'Jūrmala Airport (Latvia)',
                  distance: 93.63,
                  type: 'GROUND',
                },
                {
                  from: 'Jūrmala Airport (Latvia)',
                  to: 'Barysiai Airport (Lithuania)',
                  distance: 99.06,
                  type: 'GROUND',
                },
                {
                  from: 'Barysiai Airport (Lithuania)',
                  to: 'Kėdainiai Air Base (Lithuania)',
                  distance: 88,
                  type: 'GROUND',
                },
                {
                  from: 'Kėdainiai Air Base (Lithuania)',
                  to: 'Kaunas International Airport (Lithuania)',
                  distance: 39.53,
                  type: 'GROUND',
                },
                {
                  from: 'Kaunas International Airport (Lithuania)',
                  to: 'Vilnius International Airport (Lithuania)',
                  distance: 85.27,
                  type: 'GROUND',
                },
              ],
              totalDistance: 558.8,
            });
          });
      });

      it('responds with 400 because too few stops were allowed', () => {
        // Tallinn -> Palanga with no stops
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=PLQ&max_stops=0`)
          .expect(400, {
            error: 'Cannot find route.',
          });
      });

      it('responds with 400 because too few switches were allowed', () => {
        // Kaunas -> Vilnius with no switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=KUN&to=VNO&max_switches=0`)
          .expect(400, {
            error: 'Cannot find route.',
          });
      });

      it('responds with 400 because having both restrictions was too limiting', () => {
        // Tallinn -> Kärdla with no stops and no switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=KDL&max_stops=0&max_switches=0`)
          .expect(400, {
            error: 'Cannot find route.',
          });
      });
    });

    describe("Shortest path with segments with 'EITHER' type", () => {
      it("finds shortest route across two segments with 'EITHER' type using no stops, and responds with 200", () => {
        // Kärdla -> Ruhnu with no stops
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=KDL&to=EERU&max_stops=0`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Kärdla Airport (Estonia)',
                  to: 'Kuressaare Airport (Estonia)',
                  distance: 86.63,
                  type: 'EITHER',
                },
                {
                  from: 'Kuressaare Airport (Estonia)',
                  to: 'Ruhnu Airfield (Estonia)',
                  distance: 66.68,
                  type: 'EITHER',
                },
              ],
              totalDistance: 153.31,
            });
          });
      });

      it("finds shortest route across two segments with 'EITHER' type using no switches, and responds with 200", () => {
        // Kärdla -> Ruhnu with no switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=KDL&to=EERU&max_switches=0`)
          .expect(200)
          .expect(res => {
            expect(toHumanReadable(res.body)).toStrictEqual({
              segments: [
                {
                  from: 'Kärdla Airport (Estonia)',
                  to: 'Kuressaare Airport (Estonia)',
                  distance: 86.63,
                  type: 'EITHER',
                },
                {
                  from: 'Kuressaare Airport (Estonia)',
                  to: 'Ruhnu Airfield (Estonia)',
                  distance: 66.68,
                  type: 'EITHER',
                },
              ],
              totalDistance: 153.31,
            });
          });
      });

      it("responds with 400 because two segments with 'EITHER' type cannot be traversed with no stops and no switches", () => {
        // Kärdla -> Ruhnu with no stops and no switches
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=KDL&to=EERU&max_stops=0&max_switches=0`)
          .expect(400, {
            error: 'Cannot find route.',
          });
      });
    });

    describe('Finding airports by codes', () => {
      it("responds with 400 when 'from' airport is not found", () => {
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLN&to=RIX`)
          .expect(400, {
            error: "Cannot find airport with the code 'TLN'.",
          });
      });

      it("responds with 400 when 'to' airport is not found", () => {
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=RIG`)
          .expect(400, {
            error: "Cannot find airport with the code 'RIG'.",
          });
      });
    });

    describe('Input parameter validation', () => {
      it("responds with 422 when 'from' airport is not defined", () => {
        return request(app.getServer()).get(`${flightsRoute.path}/find?to=RIX`).expect(422, {
          error: "'from' and/or 'to' airport not defined.",
        });
      });

      it("responds with 422 when 'to' airport is not defined", () => {
        return request(app.getServer()).get(`${flightsRoute.path}/find?from=TLL`).expect(422, {
          error: "'from' and/or 'to' airport not defined.",
        });
      });

      it("responds with 422 when 'max_stops' is not a number", () => {
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=RIX&max_stops=none`)
          .expect(422, {
            error: "'max_stops' has to be a number equal to or greater than zero.",
          });
      });

      it("responds with 422 when 'max_stops' is less than zero", () => {
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=RIX&max_stops=-1`)
          .expect(422, {
            error: "'max_stops' has to be a number equal to or greater than zero.",
          });
      });

      it("responds with 422 when 'max_switches' is not a number", () => {
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=RIX&max_switches=none`)
          .expect(422, {
            error: "'max_switches' has to be a number equal to or greater than zero.",
          });
      });

      it("responds with 422 when 'max_switches' is less than zero", () => {
        return request(app.getServer())
          .get(`${flightsRoute.path}/find?from=TLL&to=RIX&max_switches=-1`)
          .expect(422, {
            error: "'max_switches' has to be a number equal to or greater than zero.",
          });
      });
    });
  });
});
