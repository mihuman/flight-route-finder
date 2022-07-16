import AirportsProcessor from './AirportsProcessor';
import RoutesProcessor from './RoutesProcessor';

const RAW_AIRPORTS_FILE = './data/airports.dat';
const RAW_ROUTES_FILE = './data/routes.dat';
const AIRPORTS_DATA_JSON_FILE = './data/airports.json';
const ROUTES_DATA_JSON_FILE = './data/routes.json';

const seed = async () => {
  try {
    console.time('SEEDING DATA');

    const airportsProcessor = new AirportsProcessor();
    const routesProcessor = new RoutesProcessor();

    await airportsProcessor.process(RAW_AIRPORTS_FILE);
    await routesProcessor.process(
      RAW_ROUTES_FILE,
      airportsProcessor.getAirportMap(),
      airportsProcessor.getAdjacentAirports(),
    );

    airportsProcessor.write(AIRPORTS_DATA_JSON_FILE);
    routesProcessor.write(ROUTES_DATA_JSON_FILE);

    console.timeEnd('SEEDING DATA');
    console.log('Data successfully seeded.');
  } catch (err) {
    console.error(err);
    console.log('There was an error while seeding data.');
  }
};

seed();
