import fs from 'fs';
import AirportsProcessor from '@/scripts/AirportsProcessor';

const RAW_AIRPORTS_FILE = './src/tests/data/airports.test.dat';

let airportsProcessor: AirportsProcessor;
let fileWriteSpy: jest.SpyInstance;

describe('Testing AirportsProcessor', () => {
  beforeEach(async () => {
    airportsProcessor = new AirportsProcessor();
    await airportsProcessor.process(RAW_AIRPORTS_FILE);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#getAirportMap()', () => {
    it('includes all valid airports', () => {
      const airportMap = airportsProcessor.getAirportMap();
      expect(airportMap.size).toBe(26);
    });

    it('gets airport by ID from AirportMap', () => {
      const airportMap = airportsProcessor.getAirportMap();
      expect(airportMap.get(415).name).toBe('Lennart Meri Tallinn Airport');
    });
  });

  describe('#getAirportCodeMap()', () => {
    it('includes all valid airport codes', () => {
      const airportCodeMap = airportsProcessor.getAirportCodeMap();
      expect(airportCodeMap.size).toBe(42);
    });

    it('gets airport IDs by code from AirportCodeMap', () => {
      const airportCodeMap = airportsProcessor.getAirportCodeMap();
      // IATA and ICAO codes for Tallinn Airport
      expect(airportCodeMap.get('TLL')).toBe(415);
      expect(airportCodeMap.get('EETN')).toBe(415);
    });
  });

  describe('#write()', () => {
    it('writes AirportMap and AirportCodeMap to file', () => {
      fileWriteSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => jest.fn());
      airportsProcessor.write('testFile.json');
      expect(fileWriteSpy).toBeCalledWith(
        'testFile.json',
        JSON.stringify({
          airports: Object.fromEntries(airportsProcessor.getAirportMap()),
          codes: Object.fromEntries(airportsProcessor.getAirportCodeMap()),
        }),
        'utf8',
      );
    });
  });
});
