import App from '@/app';
import IndexRoute from '@routes/index.route';
import FlightsRoute from '@/routes/flights.route';

const app = new App([new IndexRoute(), new FlightsRoute()]);

app.listen();
