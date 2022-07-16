import App from '@/app';
import IndexRoute from '@routes/index.route';
import FlightsRoute from '@/routes/flights.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new FlightsRoute()]);

app.listen();
