import { config } from 'dotenv';
config();

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;

export const DEFAULT_MAX_ROUTE_STOPS = 3;
export const DEFAULT_MAX_ROUTE_GROUND_SWITCHES = 1;
export const MAX_ADJACENT_AIRPORT_DISTANCE = 100;
