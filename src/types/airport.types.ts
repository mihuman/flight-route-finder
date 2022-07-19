export type AirportId = number;
export type AirportCode = string | null;
export type Distance = number;

export type Airport = {
  id: AirportId;
  name: string;
  city: string;
  country: string;
  iata: AirportCode;
  icao: AirportCode;
  latitude: number;
  longitude: number;
};

export type AirportMap = Map<AirportId, Airport>;

export type AirportCodeMap = Map<AirportCode, AirportId>;
