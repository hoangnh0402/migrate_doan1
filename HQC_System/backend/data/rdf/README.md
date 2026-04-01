# HQC System LOD Cloud - Apache Jena Fuseki Setup

This directory contains RDF (Resource Description Framework) data files for the HQC System Linked Open Data Cloud implementation.

## Overview

HQC System implements a 5-Star Linked Open Data architecture using:
- **Apache Jena Fuseki** as the RDF triple store and SPARQL endpoint
- **SOSA/SSN Ontology** for sensor observations
- **NGSI-LD / FIWARE** data models for smart city entities
- **GeoSPARQL** for geospatial data

## Directory Structure

```
backend/data/rdf/
├── hqc-system-ontology.ttl    # HQC System ontology definitions
├── hqc-system-places.ttl      # Hanoi districts and locations
├── hqc-system-weather.ttl     # Weather observations
├── hqc-system-airquality.ttl  # Air quality measurements
├── hqc-system-traffic.ttl     # Traffic flow data
├── hqc-system-parking.ttl     # Parking spots and availability
├── hqc-system-civic.ttl       # Civic issue reports
└── hqc-system-unified.ttl     # Combined dataset (auto-generated)
```

## Namespaces

| Prefix | URI | Description |
|--------|-----|-------------|
| `hqcsystem` | `https://hqcsystem.vn/ontology/` | HQC System ontology |
| `cl-data` | `https://hqcsystem.vn/data/` | HQC System data entities |
| `cl-place` | `https://hqcsystem.vn/place/` | HQC System places/locations |
| `sosa` | `http://www.w3.org/ns/sosa/` | Sensor, Observation, Sample, and Actuator |
| `fiware` | `https://uri.fiware.org/ns/data-models#` | FIWARE Smart Data Models |
| `wgs84` | `http://www.w3.org/2003/01/geo/wgs84_pos#` | WGS84 coordinates |

## Quick Start

### 1. Start Fuseki

Using Docker:
```bash
docker run -d --name fuseki \
  -p 7200:3030 \
  -e ADMIN_PASSWORD=admin \
  apache/jena-fuseki:5.1.0
```

### 2. Create Datasets and Upload Data

```bash
cd backend
./scripts/setup_fuseki.sh
```

### 3. Verify Data

Visit the Fuseki admin interface:
- Local: http://localhost:7200
- Query endpoint: http://localhost:7200/hqcsystem/sparql

### 4. Sample SPARQL Queries

**Count all triples:**
```sparql
SELECT (COUNT(*) as ?count)
WHERE { ?s ?p ?o }
```

**Get weather observations:**
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX hqcsystem: <https://hqcsystem.vn/ontology/>

SELECT ?obs ?temp ?humidity
WHERE {
  ?obs a sosa:Observation .
  ?obs hqcsystem:temperature ?temp .
  OPTIONAL { ?obs hqcsystem:relativeHumidity ?humidity }
}
```

**Air quality above threshold:**
```sparql
PREFIX hqcsystem: <https://hqcsystem.vn/ontology/>

SELECT ?observation ?aqi ?location
WHERE {
  ?observation hqcsystem:airQualityIndex ?aqi .
  FILTER(?aqi > 100)
  OPTIONAL { ?observation hqcsystem:locatedIn ?location }
}
ORDER BY DESC(?aqi)
```

**External links to Wikidata/DBpedia:**
```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?local ?external
WHERE {
  ?local owl:sameAs ?external .
}
```

## Data Models

### Weather Observation
```turtle
cl-data:WeatherObserved/hanoi-001 a sosa:Observation, fiware:WeatherObserved ;
    hqcsystem:temperature "25.3"^^xsd:double ;
    hqcsystem:humidity "72"^^xsd:integer ;
    hqcsystem:windSpeed "3.5"^^xsd:double ;
    sosa:resultTime "2025-01-10T14:30:00Z"^^xsd:dateTime ;
    wgs84:lat "21.0278"^^xsd:double ;
    wgs84:long "105.8342"^^xsd:double .
```

### Air Quality
```turtle
cl-data:AirQualityObserved/hanoi-001 a sosa:Observation, fiware:AirQualityObserved ;
    hqcsystem:airQualityIndex "85"^^xsd:integer ;
    hqcsystem:pm25 "28.5"^^xsd:double ;
    hqcsystem:pm10 "45.2"^^xsd:double ;
    sosa:resultTime "2025-01-10T14:30:00Z"^^xsd:dateTime .
```

### Traffic Flow
```turtle
cl-data:TrafficFlow/kimma-001 a sosa:Observation, fiware:TrafficFlowObserved ;
    hqcsystem:roadName "Kim Ma" ;
    hqcsystem:congestionLevel "moderate" ;
    hqcsystem:averageSpeed "25.5"^^xsd:double ;
    hqcsystem:vehicleCount "1250"^^xsd:integer .
```

## 5-Star LOD Compliance

| Star | Requirement | HQC System Status |
|------|-------------|-----------------|
| ★ | Data on web with open license | ✅ GPL-3.0 / CC-BY 4.0 |
| ★★ | Machine-readable structured data | ✅ RDF/Turtle, JSON-LD |
| ★★★ | Non-proprietary format | ✅ W3C Standards |
| ★★★★ | URIs for entities | ✅ https://hqcsystem.vn/{type}/{id} |
| ★★★★★ | Linked to external data | ✅ DBpedia, Wikidata, GeoNames |

## Environment Detection

The LOD Cloud page automatically detects the environment:
- **Local**: Uses `http://localhost:7200`
- **Production**: Uses `https://fuseki.hqcsystem.vn`

To override, set environment variable:
```bash
NEXT_PUBLIC_FUSEKI_URL=http://custom-fuseki:7200
```

## Regenerating Data

To regenerate RDF data from the PostgreSQL database:
```bash
python scripts/export_to_rdf.py
```

To combine all files into unified dataset:
```bash
./scripts/combine_rdf.sh
```

## License

Data: CC-BY 4.0
Code: GPL-3.0

---
© 2025 HQC System Contributors
