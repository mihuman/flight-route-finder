import airportData from './data/airports.test.json';
import routeData from './data/routes.test.json';

jest.mock('../../data/airports.json', () => airportData);
jest.mock('../../data/routes.json', () => routeData);
