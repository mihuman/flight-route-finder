# Flight Route Finder

This is a simple API for finding routes between airports. It uses a modified Dijkstra algorithm to find the shortest routes with additional conditions/restrictions (see below).


## Task

The test task consists of two parts, the main part, and a bonus part. We suggest tackling the bonus part once the main objective of the service has been achieved.

The task is to build a JSON over HTTP API endpoint that takes as input two IATA/ICAO airport codes and provides as output a route between these two airports so that:

1. The route consists of at most 4 legs/flights (that is, 3 stops/layovers, if going from A->B, a valid route could be A->1->2->3->B, or for example A->1->B etc.) and;
2. The route is the shortest such route as measured in kilometers of geographical distance.

For the bonus part, extend your service so that it also allows changing airports during stops that are within 100km of each other. For example, if going from A->B, a valid route could be A->1->2=>3->4->B, where “2=>3” is a change of airports done via ground. These switches are not considered as part of the legs/layover/hop count, but their distance should be reflected in the final distance calculated for the route.

The weekdays and flight times are not important for the purposes of the test task - you are free to assume that all flights can depart at any required time.


## API features

* Finding routes using both the flights and switches between adjacent airports.
* Setting a maximum number of stops when finding a route (default is 3).
* Setting a maximum number of 'ground' switches when finding a route (default is 1).
* Some of the API design best practices implemented: logging, CORS, securing HTTP headers, compression, simple validation middleware, and more. For a minimal API with less dependencies, see the `minimal` branch.


## Installation

To install the project, run `npm install`.


## Setup

### Data

The API uses airport and route data from the [OpenFlights.org](https://openflights.org/data.html) public database. The files can also be directly downloaded from GitHub:

* [airports.dat](https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat)
* [routes.dat](https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat)

The raw data files need to be placed into the `data` directory with the default filenames. Two sample files are already included in this repository.

### Environment variables

Create a file named `.env` in the project's root directory using the `.env.example` file as example/template. Modify values for the environment variables as desired, or keep the default values.

### Data preprocessing

Run `npm run seed` to process the raw data and output (seed) data files used by the API.


## Usage

### Running

To run the project, run `npm start`. This will start the server on the port defined in the `.env` file (3000 by default).

### API

The API exposes an endpoint at `/flights/find` with the following query parameters:

* `from`: (Required) IATA or ICAO code for the source airport
* `to`: (Required) IATA or ICAO code for the destination airport
* `max_stops`: (Optional, default value: 3) Maximum number of stops/layovers, not including stops for 'ground' switches (see [Task description](#task))
* `max_switches`: (Optional, default value: 1) Maximum number of 'ground' switches between adjacent airports

### Sample requests

```
http://localhost:3000/flights/find?from=TLL&to=PSP
http://localhost:3000/flights/find?from=TLL&to=PSP&max_stops=1
http://localhost:3000/flights/find?from=TLL&to=PSP&max_stops=1&max_switches=2
http://localhost:3000/flights/find?from=TLL&to=KDL&max_switches=2
http://localhost:3000/flights/find?from=EETN&to=YSGE&max_stops=5
```

### Success response

A successful response has the following format:

```
{
  result: {
    airports: Information about all airports across the resulting route,
    from: Source airport ID,
    to: Destination airport ID,
    segments: Resulting route segments,
    totalDistance: Total distance in kilometers
  }
}
```

Sample response:

```json
{
    "result": {
        "airports": {
            "415": {
                "id": 415,
                "name": "Lennart Meri Tallinn Airport",
                "city": "Tallinn-ulemiste International",
                "country": "Estonia",
                "iata": "TLL",
                "icao": "EETN",
                "latitude": 59.41329956049999,
                "longitude": 24.832799911499997
            },
            "737": {
                "id": 737,
                "name": "Stockholm-Arlanda Airport",
                "city": "Stockholm",
                "country": "Sweden",
                "iata": "ARN",
                "icao": "ESSA",
                "latitude": 59.651901245117,
                "longitude": 17.918600082397
            },
            "3484": {
                "id": 3484,
                "name": "Los Angeles International Airport",
                "city": "Los Angeles",
                "country": "United States",
                "iata": "LAX",
                "icao": "KLAX",
                "latitude": 33.94250107,
                "longitude": -118.4079971
            },
            "3839": {
                "id": 3839,
                "name": "Palm Springs International Airport",
                "city": "Palm Springs",
                "country": "United States",
                "iata": "PSP",
                "icao": "KPSP",
                "latitude": 33.8297004699707,
                "longitude": -116.50700378417969
            }
        },
        "from": 415,
        "to": 3839,
        "segments": [
            {
                "from": 415,
                "to": 737,
                "distance": 390.55,
                "type": "FLIGHT"
            },
            {
                "from": 737,
                "to": 3484,
                "distance": 8863.04,
                "type": "FLIGHT"
            },
            {
                "from": 3484,
                "to": 3839,
                "distance": 175.92,
                "type": "FLIGHT"
            }
        ],
        "totalDistance": 9429.51
    }
}
```

A route segment's type can be one of the following:

* `FLIGHT`
* `GROUND` (switches between adjacent airports)
* `EITHER` (the segment can be covered either with a flight or a ground switch)

### Error response

An error response has the following format:

```
{
  error: Error information
}
```

Sample response:

```json
{
    "error": "Cannot find airport with the code 'TALL'."
}
```


## Tests

### Running tests

To run tests, run `npm test`.

### Test data

Tests use a subset of the data provided in the `data` directory: airports and routes in the Baltic states. Four flight routes have been added for testing purposes: two routes between Kärdla (KDL) <-> Kuressaare (URE) and two between Kuressaare (URE) <-> Ruhnu (EERU). That is, these routes will later be marked with the `EITHER` type. See the testing graph (flight: red, ground switch: gray, either: red and white):

![Test graph](/assets/images/test-graph.png)


## Acknowledgments

The implementation of this API is significantly based on the following projects:

* [TypeScript Express Starter](https://github.com/ljlm0402/typescript-express-starter)
* [node-dijkstra](https://github.com/albertorestifo/node-dijkstra)
