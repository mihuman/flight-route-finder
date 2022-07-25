import fs from 'fs';
import AirportsProcessor from '@/scripts/AirportsProcessor';
import RoutesProcessor from '@/scripts/RoutesProcessor';

const RAW_AIRPORTS_FILE = './src/tests/data/airports.test.dat';
const RAW_ROUTES_FILE = './src/tests/data/routes.test.dat';

let routesProcessor: RoutesProcessor;
let fileWriteSpy: jest.SpyInstance;

describe('Testing RoutesProcessor', () => {
  beforeEach(async () => {
    const airportsProcessor = new AirportsProcessor();
    routesProcessor = new RoutesProcessor();

    await airportsProcessor.process(RAW_AIRPORTS_FILE);
    await routesProcessor.process(
      RAW_ROUTES_FILE,
      airportsProcessor.getAirportMap(),
      airportsProcessor.getAdjacentAirports(),
    );
  });

  describe('#getRouteMap()', () => {
    it('gets routes with RouteMap', () => {
      const routeMap = routesProcessor.getRouteMap();
      // Tallinn -> Riga
      expect(routeMap.has(415, 3953));
      // Tallinn -> Vilnius
      expect(routeMap.has(415, 3959));
    });
  });

  describe('#write()', () => {
    it('writes RouteMap to file', () => {
      fileWriteSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => jest.fn());
      routesProcessor.write('testFile.json');
      expect(fileWriteSpy).toBeCalledWith(
        'testFile.json',
        JSON.stringify(routesProcessor.getRouteMap()),
        'utf8',
      );
    });
  });
});
