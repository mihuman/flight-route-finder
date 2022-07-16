import haversine from 's-haversine';
import { Airport } from '@/types/airport.types';

export const round = (value: number, decimals = 2): number =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

export const getDistanceKm = (from: Airport, to: Airport): number =>
  round(haversine.distance([from.latitude, from.longitude], [to.latitude, to.longitude]) / 1000);
