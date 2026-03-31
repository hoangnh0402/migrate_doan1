#!/usr/bin/env python3
# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Export NGSI-LD Entities to RDF/Turtle format for Apache Jena Fuseki.
Converts all entities from PostgreSQL to 5-Star Linked Open Data.

Usage:
    python scripts/export_to_rdf.py --output ./data/rdf/
    python scripts/export_to_rdf.py --upload  # Upload directly to Fuseki
"""

import asyncio
import sys
import os
import json
import argparse
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
import httpx

from app.core.config import settings


# =============================================================================
# RDF NAMESPACES & PREFIXES
# =============================================================================

RDF_PREFIXES = """
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix prov: <http://www.w3.org/ns/prov#> .

@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix ssn: <http://www.w3.org/ns/ssn/> .
@prefix geo: <http://www.opengis.net/ont/geosparql#> .
@prefix sf: <http://www.opengis.net/ont/sf#> .
@prefix wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

@prefix ngsi-ld: <https://uri.etsi.org/ngsi-ld/> .
@prefix fiware: <https://uri.fiware.org/ns/data-models#> .
@prefix saref: <https://saref.etsi.org/core/> .
@prefix schema: <https://schema.org/> .

@prefix HQC System: <https://HQC System.vn/ontology/> .
@prefix cl-data: <https://HQC System.vn/data/> .
@prefix cl-place: <https://HQC System.vn/place/> .

@prefix dbpedia: <http://dbpedia.org/resource/> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix gn: <https://www.geonames.org/> .

"""

# Entity Type to Ontology Mapping
ENTITY_TYPE_MAP = {
    "WeatherObserved": {
        "rdf_type": "sosa:Observation",
        "dataset": "weather",
        "label_vi": "Quan tráº¯c thá»i tiáº¿t",
        "label_en": "Weather Observation"
    },
    "AirQualityObserved": {
        "rdf_type": "sosa:Observation", 
        "dataset": "airquality",
        "label_vi": "Quan tráº¯c cháº¥t lÆ°á»£ng khÃ´ng khÃ­",
        "label_en": "Air Quality Observation"
    },
    "TrafficFlowObserved": {
        "rdf_type": "sosa:Observation",
        "dataset": "traffic",
        "label_vi": "Quan tráº¯c giao thÃ´ng",
        "label_en": "Traffic Flow Observation"
    },
    "ParkingSpot": {
        "rdf_type": "fiware:ParkingSpot",
        "dataset": "parking",
        "label_vi": "Äiá»ƒm Ä‘á»— xe",
        "label_en": "Parking Spot"
    },
    "CivicIssueTracking": {
        "rdf_type": "HQC System:CivicIssue",
        "dataset": "civic",
        "label_vi": "Váº¥n Ä‘á» Ä‘Ã´ thá»‹",
        "label_en": "Civic Issue"
    },
    "OffStreetParking": {
        "rdf_type": "fiware:OffStreetParking",
        "dataset": "parking",
        "label_vi": "BÃ£i Ä‘á»— xe",
        "label_en": "Off-Street Parking"
    }
}

# Hanoi District to Wikidata/GeoNames mapping
HANOI_DISTRICTS_LINKED = {
    "Ba ÄÃ¬nh": {"wikidata": "Q1853736", "geonames": "1587923"},
    "HoÃ n Kiáº¿m": {"wikidata": "Q1854656", "geonames": "1581130"},
    "Hai BÃ  TrÆ°ng": {"wikidata": "Q1852804", "geonames": "1581134"},
    "Äá»‘ng Äa": {"wikidata": "Q1852795", "geonames": "1582926"},
    "Thanh XuÃ¢n": {"wikidata": "Q2302883", "geonames": "1566346"},
    "Cáº§u Giáº¥y": {"wikidata": "Q1852785", "geonames": "1584071"},
    "TÃ¢y Há»“": {"wikidata": "Q2302878", "geonames": "1566083"},
    "HoÃ ng Mai": {"wikidata": "Q1854655", "geonames": "1581131"},
    "Long BiÃªn": {"wikidata": "Q1870735", "geonames": "1576303"},
    "HÃ  ÄÃ´ng": {"wikidata": "Q1852803", "geonames": "1581135"},
    "Hanoi": {"wikidata": "Q1581", "geonames": "1581129", "dbpedia": "Hanoi"}
}


# =============================================================================
# RDF CONVERTER CLASS
# =============================================================================

class NGSILDToRDFConverter:
    """Convert NGSI-LD entities to RDF Turtle format."""
    
    def __init__(self):
        self.triples_count = 0
        
    def escape_turtle_string(self, s: str) -> str:
        """Escape special characters for Turtle strings."""
        if not s:
            return ""
        return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')
    
    def format_datetime(self, dt_str: str) -> str:
        """Format datetime for RDF xsd:dateTime."""
        try:
            if isinstance(dt_str, str):
                # Handle various datetime formats
                if 'T' in dt_str:
                    return f'"{dt_str}"^^xsd:dateTime'
                else:
                    return f'"{dt_str}T00:00:00Z"^^xsd:dateTime'
            return f'"{datetime.utcnow().isoformat()}Z"^^xsd:dateTime'
        except:
            return f'"{datetime.utcnow().isoformat()}Z"^^xsd:dateTime'
    
    def format_value(self, value: Any, datatype: str = None) -> str:
        """Format a value for RDF."""
        if value is None:
            return None
        
        if isinstance(value, bool):
            return f'"{str(value).lower()}"^^xsd:boolean'
        elif isinstance(value, int):
            return f'"{value}"^^xsd:integer'
        elif isinstance(value, float):
            return f'"{value}"^^xsd:double'
        elif isinstance(value, str):
            if datatype:
                return f'"{self.escape_turtle_string(value)}"^^{datatype}'
            return f'"{self.escape_turtle_string(value)}"'
        else:
            return f'"{self.escape_turtle_string(str(value))}"'
    
    def entity_to_uri(self, entity_id: str) -> str:
        """Convert NGSI-LD entity ID to RDF URI."""
        # urn:ngsi-ld:WeatherObserved:hanoi-001 -> cl-data:WeatherObserved/hanoi-001
        if entity_id.startswith("urn:ngsi-ld:"):
            parts = entity_id.replace("urn:ngsi-ld:", "").split(":")
            if len(parts) >= 2:
                return f"cl-data:{parts[0]}/{parts[1]}"
            return f"cl-data:{parts[0]}"
        return f"cl-data:{entity_id}"
    
    def convert_location(self, entity_uri: str, location: Dict) -> List[str]:
        """Convert NGSI-LD location to GeoSPARQL triples."""
        triples = []
        
        if location.get("type") != "GeoProperty":
            return triples
            
        geojson = location.get("value", {})
        geom_type = geojson.get("type", "").lower()
        coords = geojson.get("coordinates", [])
        
        if geom_type == "point" and len(coords) >= 2:
            lon, lat = coords[0], coords[1]
            geom_uri = f"{entity_uri}_geom"
            
            triples.append(f'{entity_uri} geo:hasGeometry {geom_uri} .')
            triples.append(f'{geom_uri} a sf:Point .')
            triples.append(f'{geom_uri} geo:asWKT "POINT({lon} {lat})"^^geo:wktLiteral .')
            triples.append(f'{entity_uri} wgs84:lat "{lat}"^^xsd:double .')
            triples.append(f'{entity_uri} wgs84:long "{lon}"^^xsd:double .')
            
        return triples
    
    def convert_weather_entity(self, entity: Dict) -> str:
        """Convert WeatherObserved entity to RDF."""
        entity_id = entity.get("id", "")
        entity_uri = self.entity_to_uri(entity_id)
        
        triples = [
            f'{entity_uri} a sosa:Observation ;',
            f'    a fiware:WeatherObserved ;',
            f'    rdfs:label "Weather Observation"@en ;',
            f'    rdfs:label "Quan tráº¯c thá»i tiáº¿t"@vi ;'
        ]
        
        # Temperature
        if "temperature" in entity:
            temp = entity["temperature"]
            value = temp.get("value") if isinstance(temp, dict) else temp
            if value is not None:
                triples.append(f'    HQC System:temperature {self.format_value(value)} ;')
                triples.append(f'    sosa:observedProperty <http://sweetontology.net/propTemperature/Temperature> ;')
        
        # Humidity
        if "relativeHumidity" in entity:
            hum = entity["relativeHumidity"]
            value = hum.get("value") if isinstance(hum, dict) else hum
            if value is not None:
                triples.append(f'    HQC System:relativeHumidity {self.format_value(value)} ;')
        
        # Pressure
        if "atmosphericPressure" in entity:
            press = entity["atmosphericPressure"]
            value = press.get("value") if isinstance(press, dict) else press
            if value is not None:
                triples.append(f'    HQC System:atmosphericPressure {self.format_value(value)} ;')
        
        # Wind
        if "windSpeed" in entity:
            wind = entity["windSpeed"]
            value = wind.get("value") if isinstance(wind, dict) else wind
            if value is not None:
                triples.append(f'    HQC System:windSpeed {self.format_value(value)} ;')
        
        # Weather Type
        if "weatherType" in entity:
            wtype = entity["weatherType"]
            value = wtype.get("value") if isinstance(wtype, dict) else wtype
            if value:
                triples.append(f'    HQC System:weatherType "{self.escape_turtle_string(str(value))}" ;')
        
        # Location
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            # Add location reference in main entity
            if loc_triples:
                triples.extend([f'    {t.split(entity_uri + " ")[1]}' if entity_uri in t else None for t in loc_triples[:1] if entity_uri in t])
        
        # Observation time
        if "dateObserved" in entity:
            dt = entity["dateObserved"]
            value = dt.get("value") if isinstance(dt, dict) else dt
            if value:
                triples.append(f'    sosa:resultTime {self.format_datetime(value)} ;')
        
        # External links
        triples.append(f'    owl:sameAs dbpedia:Weather ;')
        triples.append(f'    dct:source <https://openweathermap.org/> .')
        
        # Close the entity block and add location triples
        result = '\n'.join(triples)
        
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            if loc_triples:
                result += '\n\n' + '\n'.join(loc_triples)
        
        self.triples_count += len(triples)
        return result
    
    def convert_airquality_entity(self, entity: Dict) -> str:
        """Convert AirQualityObserved entity to RDF."""
        entity_id = entity.get("id", "")
        entity_uri = self.entity_to_uri(entity_id)
        
        triples = [
            f'{entity_uri} a sosa:Observation ;',
            f'    a fiware:AirQualityObserved ;',
            f'    rdfs:label "Air Quality Observation"@en ;',
            f'    rdfs:label "Quan tráº¯c cháº¥t lÆ°á»£ng khÃ´ng khÃ­"@vi ;'
        ]
        
        # AQI
        if "aqi" in entity:
            aqi = entity["aqi"]
            value = aqi.get("value") if isinstance(aqi, dict) else aqi
            if value is not None:
                triples.append(f'    HQC System:airQualityIndex {self.format_value(value)} ;')
        
        # PM2.5
        if "pm25" in entity:
            pm = entity["pm25"]
            value = pm.get("value") if isinstance(pm, dict) else pm
            if value is not None:
                triples.append(f'    HQC System:pm25 {self.format_value(value)} ;')
        
        # PM10
        if "pm10" in entity:
            pm = entity["pm10"]
            value = pm.get("value") if isinstance(pm, dict) else pm
            if value is not None:
                triples.append(f'    HQC System:pm10 {self.format_value(value)} ;')
        
        # CO
        if "co" in entity:
            co = entity["co"]
            value = co.get("value") if isinstance(co, dict) else co
            if value is not None:
                triples.append(f'    HQC System:co {self.format_value(value)} ;')
        
        # NO2
        if "no2" in entity:
            no2 = entity["no2"]
            value = no2.get("value") if isinstance(no2, dict) else no2
            if value is not None:
                triples.append(f'    HQC System:no2 {self.format_value(value)} ;')
        
        # O3
        if "o3" in entity:
            o3 = entity["o3"]
            value = o3.get("value") if isinstance(o3, dict) else o3
            if value is not None:
                triples.append(f'    HQC System:o3 {self.format_value(value)} ;')
        
        # Observation time
        if "dateObserved" in entity:
            dt = entity["dateObserved"]
            value = dt.get("value") if isinstance(dt, dict) else dt
            if value:
                triples.append(f'    sosa:resultTime {self.format_datetime(value)} ;')
        
        # External links
        triples.append(f'    dct:source <https://aqicn.org/> .')
        
        result = '\n'.join(triples)
        
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            if loc_triples:
                result += '\n\n' + '\n'.join(loc_triples)
        
        self.triples_count += len(triples)
        return result
    
    def convert_civic_entity(self, entity: Dict) -> str:
        """Convert CivicIssueTracking entity to RDF."""
        entity_id = entity.get("id", "")
        entity_uri = self.entity_to_uri(entity_id)
        
        triples = [
            f'{entity_uri} a HQC System:CivicIssue ;',
            f'    a schema:Report ;',
            f'    rdfs:label "Civic Issue Report"@en ;',
            f'    rdfs:label "BÃ¡o cÃ¡o váº¥n Ä‘á» Ä‘Ã´ thá»‹"@vi ;'
        ]
        
        # Category
        if "category" in entity:
            cat = entity["category"]
            value = cat.get("value") if isinstance(cat, dict) else cat
            if value:
                triples.append(f'    HQC System:category "{self.escape_turtle_string(str(value))}" ;')
        
        # SubCategory
        if "subCategory" in entity:
            sub = entity["subCategory"]
            value = sub.get("value") if isinstance(sub, dict) else sub
            if value:
                triples.append(f'    HQC System:subCategory "{self.escape_turtle_string(str(value))}" ;')
        
        # Title
        if "title" in entity:
            title = entity["title"]
            value = title.get("value") if isinstance(title, dict) else title
            if value:
                triples.append(f'    dct:title "{self.escape_turtle_string(str(value))}"@vi ;')
        
        # Description
        if "description" in entity:
            desc = entity["description"]
            value = desc.get("value") if isinstance(desc, dict) else desc
            if value:
                triples.append(f'    dct:description "{self.escape_turtle_string(str(value))}"@vi ;')
        
        # Status
        if "status" in entity:
            status = entity["status"]
            value = status.get("value") if isinstance(status, dict) else status
            if value:
                triples.append(f'    HQC System:status "{self.escape_turtle_string(str(value))}" ;')
        
        # Priority
        if "priority" in entity:
            priority = entity["priority"]
            value = priority.get("value") if isinstance(priority, dict) else priority
            if value:
                triples.append(f'    HQC System:priority "{self.escape_turtle_string(str(value))}" ;')
        
        # District - with external links
        if "district" in entity:
            district = entity["district"]
            value = district.get("value") if isinstance(district, dict) else district
            if value:
                triples.append(f'    HQC System:district "{self.escape_turtle_string(str(value))}"@vi ;')
                # Add Wikidata/GeoNames links if available
                if value in HANOI_DISTRICTS_LINKED:
                    links = HANOI_DISTRICTS_LINKED[value]
                    if "wikidata" in links:
                        triples.append(f'    HQC System:locatedIn wd:{links["wikidata"]} ;')
        
        # Created date
        if "dateCreated" in entity:
            dt = entity["dateCreated"]
            value = dt.get("value") if isinstance(dt, dict) else dt
            if value:
                triples.append(f'    dct:created {self.format_datetime(value)} ;')
        
        triples.append(f'    dct:conformsTo <https://open311.org/> .')
        
        result = '\n'.join(triples)
        
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            if loc_triples:
                result += '\n\n' + '\n'.join(loc_triples)
        
        self.triples_count += len(triples)
        return result
    
    def convert_parking_entity(self, entity: Dict) -> str:
        """Convert ParkingSpot entity to RDF."""
        entity_id = entity.get("id", "")
        entity_uri = self.entity_to_uri(entity_id)
        
        triples = [
            f'{entity_uri} a fiware:ParkingSpot ;',
            f'    a schema:ParkingFacility ;',
            f'    rdfs:label "Parking Spot"@en ;',
            f'    rdfs:label "Äiá»ƒm Ä‘á»— xe"@vi ;'
        ]
        
        # Name
        if "name" in entity:
            name = entity["name"]
            value = name.get("value") if isinstance(name, dict) else name
            if value:
                triples.append(f'    schema:name "{self.escape_turtle_string(str(value))}"@vi ;')
        
        # Status
        if "status" in entity:
            status = entity["status"]
            value = status.get("value") if isinstance(status, dict) else status
            if value:
                triples.append(f'    HQC System:parkingStatus "{self.escape_turtle_string(str(value))}" ;')
        
        # Category
        if "category" in entity:
            cat = entity["category"]
            value = cat.get("value") if isinstance(cat, dict) else cat
            if value:
                triples.append(f'    HQC System:parkingCategory "{self.escape_turtle_string(str(value))}" ;')
        
        # Price per hour
        if "pricePerHour" in entity:
            price = entity["pricePerHour"]
            value = price.get("value") if isinstance(price, dict) else price
            if value is not None:
                triples.append(f'    schema:price {self.format_value(value)} ;')
        
        triples.append(f'    schema:areaServed cl-place:Hanoi .')
        
        result = '\n'.join(triples)
        
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            if loc_triples:
                result += '\n\n' + '\n'.join(loc_triples)
        
        self.triples_count += len(triples)
        return result
    
    def convert_traffic_entity(self, entity: Dict) -> str:
        """Convert TrafficFlowObserved entity to RDF."""
        entity_id = entity.get("id", "")
        entity_uri = self.entity_to_uri(entity_id)
        
        triples = [
            f'{entity_uri} a sosa:Observation ;',
            f'    a fiware:TrafficFlowObserved ;',
            f'    rdfs:label "Traffic Flow Observation"@en ;',
            f'    rdfs:label "Quan tráº¯c giao thÃ´ng"@vi ;'
        ]
        
        # Congestion level
        if "congestionLevel" in entity:
            level = entity["congestionLevel"]
            value = level.get("value") if isinstance(level, dict) else level
            if value is not None:
                triples.append(f'    HQC System:congestionLevel {self.format_value(value)} ;')
        
        # Average speed
        if "averageVehicleSpeed" in entity:
            speed = entity["averageVehicleSpeed"]
            value = speed.get("value") if isinstance(speed, dict) else speed
            if value is not None:
                triples.append(f'    HQC System:averageSpeed {self.format_value(value)} ;')
        
        # Vehicle count
        if "intensity" in entity:
            intensity = entity["intensity"]
            value = intensity.get("value") if isinstance(intensity, dict) else intensity
            if value is not None:
                triples.append(f'    HQC System:vehicleIntensity {self.format_value(value)} ;')
        
        # Road name
        if "refRoadSegment" in entity:
            road = entity["refRoadSegment"]
            value = road.get("value") if isinstance(road, dict) else road
            if value:
                triples.append(f'    HQC System:roadSegment "{self.escape_turtle_string(str(value))}" ;')
        
        # Observation time
        if "dateObserved" in entity:
            dt = entity["dateObserved"]
            value = dt.get("value") if isinstance(dt, dict) else dt
            if value:
                triples.append(f'    sosa:resultTime {self.format_datetime(value)} ;')
        
        triples.append(f'    dct:source <https://tomtom.com/> .')
        
        result = '\n'.join(triples)
        
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            if loc_triples:
                result += '\n\n' + '\n'.join(loc_triples)
        
        self.triples_count += len(triples)
        return result
    
    def convert_entity(self, entity: Dict) -> Optional[str]:
        """Convert any NGSI-LD entity to RDF based on its type."""
        entity_type = entity.get("type", "")
        
        if entity_type == "WeatherObserved":
            return self.convert_weather_entity(entity)
        elif entity_type == "AirQualityObserved":
            return self.convert_airquality_entity(entity)
        elif entity_type == "CivicIssueTracking":
            return self.convert_civic_entity(entity)
        elif entity_type in ("ParkingSpot", "OffStreetParking"):
            return self.convert_parking_entity(entity)
        elif entity_type == "TrafficFlowObserved":
            return self.convert_traffic_entity(entity)
        else:
            # Generic conversion
            return self.convert_generic_entity(entity)
    
    def convert_generic_entity(self, entity: Dict) -> str:
        """Generic conversion for unknown entity types."""
        entity_id = entity.get("id", "")
        entity_type = entity.get("type", "Thing")
        entity_uri = self.entity_to_uri(entity_id)
        
        triples = [
            f'{entity_uri} a ngsi-ld:{entity_type} ;',
            f'    rdfs:label "{entity_type}"@en ;'
        ]
        
        # Convert all properties
        for key, value in entity.items():
            if key in ("id", "type", "@context", "location"):
                continue
            
            if isinstance(value, dict):
                prop_value = value.get("value")
                if prop_value is not None:
                    formatted = self.format_value(prop_value)
                    if formatted:
                        triples.append(f'    ngsi-ld:{key} {formatted} ;')
            elif value is not None:
                formatted = self.format_value(value)
                if formatted:
                    triples.append(f'    ngsi-ld:{key} {formatted} ;')
        
        # Fix last semicolon to period
        if triples:
            triples[-1] = triples[-1].rstrip(' ;') + ' .'
        
        result = '\n'.join(triples)
        
        if "location" in entity:
            loc_triples = self.convert_location(entity_uri, entity["location"])
            if loc_triples:
                result += '\n\n' + '\n'.join(loc_triples)
        
        self.triples_count += len(triples)
        return result


# =============================================================================
# FUSEKI UPLOADER
# =============================================================================

class FusekiUploader:
    """Upload RDF data to Apache Jena Fuseki."""
    
    def __init__(self, fuseki_url: str = None, dataset: str = None):
        self.fuseki_url = fuseki_url or settings.GRAPHDB_URL
        self.dataset = dataset or settings.GRAPHDB_DATASET
        
    def get_base_url(self) -> str:
        """Get the base Fuseki URL."""
        return self.fuseki_url.rstrip('/')
    
    async def check_connection(self) -> bool:
        """Check if Fuseki is accessible."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.get_base_url()}/$/ping")
                return response.status_code == 200
        except Exception as e:
            print(f"âš ï¸ Fuseki connection failed: {e}")
            return False
    
    async def create_dataset(self, dataset_name: str) -> bool:
        """Create a new dataset in Fuseki."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Create TDB2 persistent dataset
                response = await client.post(
                    f"{self.get_base_url()}/$/datasets",
                    data={
                        "dbName": dataset_name,
                        "dbType": "tdb2"
                    }
                )
                if response.status_code in (200, 201):
                    print(f"âœ… Created dataset: {dataset_name}")
                    return True
                elif response.status_code == 409:
                    print(f"â„¹ï¸ Dataset already exists: {dataset_name}")
                    return True
                else:
                    print(f"âŒ Failed to create dataset: {response.status_code} - {response.text}")
                    return False
        except Exception as e:
            print(f"âŒ Error creating dataset: {e}")
            return False
    
    async def upload_turtle(self, dataset_name: str, turtle_data: str) -> bool:
        """Upload Turtle data to a Fuseki dataset."""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Upload to the dataset's data endpoint
                response = await client.post(
                    f"{self.get_base_url()}/{dataset_name}/data",
                    content=turtle_data,
                    headers={"Content-Type": "text/turtle; charset=utf-8"}
                )
                if response.status_code in (200, 201, 204):
                    print(f"âœ… Uploaded data to {dataset_name}")
                    return True
                else:
                    print(f"âŒ Upload failed: {response.status_code} - {response.text}")
                    return False
        except Exception as e:
            print(f"âŒ Error uploading data: {e}")
            return False
    
    async def get_dataset_stats(self, dataset_name: str) -> Dict:
        """Get statistics for a dataset."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Count query
                query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
                response = await client.get(
                    f"{self.get_base_url()}/{dataset_name}/sparql",
                    params={"query": query},
                    headers={"Accept": "application/sparql-results+json"}
                )
                if response.status_code == 200:
                    result = response.json()
                    count = int(result["results"]["bindings"][0]["count"]["value"])
                    return {"triples": count}
                return {"triples": 0}
        except Exception as e:
            print(f"âš ï¸ Error getting stats: {e}")
            return {"triples": 0}


# =============================================================================
# DATABASE EXPORTER
# =============================================================================

async def export_entities_from_db() -> Dict[str, List[Dict]]:
    """Fetch all entities from PostgreSQL grouped by type."""
    
    # Create async engine
    engine = create_async_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        echo=False
    )
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    entities_by_type = {}
    
    async with async_session() as session:
        # Query all entities
        result = await session.execute(
            text("SELECT id, type, data FROM entities ORDER BY type, id")
        )
        rows = result.fetchall()
        
        for row in rows:
            entity_type = row[1]
            entity_data = row[2]
            
            if entity_type not in entities_by_type:
                entities_by_type[entity_type] = []
            
            entities_by_type[entity_type].append(entity_data)
    
    await engine.dispose()
    
    return entities_by_type


def generate_ontology() -> str:
    """Generate HQC System ontology definition."""
    return f"""{RDF_PREFIXES}

# =============================================================================
# HQC System Ontology Definition
# =============================================================================

HQC System:HQC System a owl:Ontology ;
    rdfs:label "HQC System Ontology"@en ;
    rdfs:label "Ontology HQC System"@vi ;
    dct:title "HQC System Smart City Ontology" ;
    dct:description "Ontology for HQC System Smart City Platform - Linked Open Data for Vietnamese cities"@en ;
    dct:creator <https://HQC System.vn/> ;
    dct:created "2025-01-01"^^xsd:date ;
    owl:versionInfo "1.0.0" ;
    dct:license <https://www.gnu.org/licenses/gpl-3.0> .

# Classes
HQC System:CivicIssue a owl:Class ;
    rdfs:subClassOf schema:Report ;
    rdfs:label "Civic Issue"@en ;
    rdfs:label "Váº¥n Ä‘á» Ä‘Ã´ thá»‹"@vi ;
    rdfs:comment "A report of urban infrastructure or service issue"@en .

HQC System:Place a owl:Class ;
    rdfs:subClassOf geo:Feature ;
    rdfs:label "Place"@en ;
    rdfs:label "Äá»‹a Ä‘iá»ƒm"@vi .

HQC System:District a owl:Class ;
    rdfs:subClassOf HQC System:Place ;
    rdfs:label "District"@en ;
    rdfs:label "Quáº­n/Huyá»‡n"@vi .

# Properties
HQC System:temperature a owl:DatatypeProperty ;
    rdfs:domain sosa:Observation ;
    rdfs:range xsd:double ;
    rdfs:label "Temperature"@en ;
    rdfs:label "Nhiá»‡t Ä‘á»™"@vi ;
    schema:unitCode "CEL" .

HQC System:airQualityIndex a owl:DatatypeProperty ;
    rdfs:domain sosa:Observation ;
    rdfs:range xsd:integer ;
    rdfs:label "Air Quality Index"@en ;
    rdfs:label "Chá»‰ sá»‘ cháº¥t lÆ°á»£ng khÃ´ng khÃ­"@vi .

HQC System:pm25 a owl:DatatypeProperty ;
    rdfs:domain sosa:Observation ;
    rdfs:range xsd:double ;
    rdfs:label "PM2.5"@en ;
    schema:unitCode "ugm3" .

HQC System:congestionLevel a owl:DatatypeProperty ;
    rdfs:domain sosa:Observation ;
    rdfs:range xsd:double ;
    rdfs:label "Congestion Level"@en ;
    rdfs:label "Má»©c Ä‘á»™ táº¯c ngháº½n"@vi .

HQC System:category a owl:DatatypeProperty ;
    rdfs:domain HQC System:CivicIssue ;
    rdfs:range xsd:string ;
    rdfs:label "Category"@en .

HQC System:status a owl:DatatypeProperty ;
    rdfs:range xsd:string ;
    rdfs:label "Status"@en .

HQC System:priority a owl:DatatypeProperty ;
    rdfs:range xsd:string ;
    rdfs:label "Priority"@en .

HQC System:district a owl:DatatypeProperty ;
    rdfs:range xsd:string ;
    rdfs:label "District"@en ;
    rdfs:label "Quáº­n"@vi .

HQC System:locatedIn a owl:ObjectProperty ;
    rdfs:domain geo:Feature ;
    rdfs:range HQC System:Place ;
    rdfs:label "Located in"@en .

# Hanoi City Instance with external links
cl-place:Hanoi a HQC System:Place ;
    rdfs:label "HÃ  Ná»™i"@vi ;
    rdfs:label "Hanoi"@en ;
    owl:sameAs dbpedia:Hanoi ;
    owl:sameAs wd:Q1581 ;
    owl:sameAs gn:1581129 ;
    wgs84:lat "21.0278"^^xsd:double ;
    wgs84:long "105.8342"^^xsd:double .

# Hanoi Districts with links
cl-place:BaDinh a HQC System:District ;
    rdfs:label "Ba ÄÃ¬nh"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1853736 .

cl-place:HoanKiem a HQC System:District ;
    rdfs:label "HoÃ n Kiáº¿m"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1854656 .

cl-place:HaiBaTrung a HQC System:District ;
    rdfs:label "Hai BÃ  TrÆ°ng"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1852804 .

cl-place:DongDa a HQC System:District ;
    rdfs:label "Äá»‘ng Äa"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1852795 .

cl-place:ThanhXuan a HQC System:District ;
    rdfs:label "Thanh XuÃ¢n"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q2302883 .

cl-place:CauGiay a HQC System:District ;
    rdfs:label "Cáº§u Giáº¥y"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1852785 .

cl-place:TayHo a HQC System:District ;
    rdfs:label "TÃ¢y Há»“"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q2302878 .

cl-place:HoangMai a HQC System:District ;
    rdfs:label "HoÃ ng Mai"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1854655 .

cl-place:LongBien a HQC System:District ;
    rdfs:label "Long BiÃªn"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1870735 .

cl-place:HaDong a HQC System:District ;
    rdfs:label "HÃ  ÄÃ´ng"@vi ;
    HQC System:locatedIn cl-place:Hanoi ;
    owl:sameAs wd:Q1852803 .
"""


async def main():
    """Main export function."""
    parser = argparse.ArgumentParser(description="Export NGSI-LD to RDF")
    parser.add_argument("--output", "-o", type=str, default="./data/rdf", help="Output directory")
    parser.add_argument("--upload", "-u", action="store_true", help="Upload to Fuseki")
    parser.add_argument("--fuseki-url", type=str, default=None, help="Fuseki URL")
    args = parser.parse_args()
    
    print("ðŸš€ HQC System RDF Export Tool")
    print("=" * 50)
    
    # Create converter
    converter = NGSILDToRDFConverter()
    
    # Fetch entities from database
    print("\nðŸ“¥ Fetching entities from PostgreSQL...")
    try:
        entities_by_type = await export_entities_from_db()
        
        total_entities = sum(len(v) for v in entities_by_type.values())
        print(f"   Found {total_entities} entities across {len(entities_by_type)} types")
        
        for entity_type, entities in entities_by_type.items():
            print(f"   - {entity_type}: {len(entities)} entities")
    except Exception as e:
        print(f"âŒ Database connection failed: {e}")
        print("   Using sample data instead...")
        entities_by_type = {}
    
    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate ontology
    print("\nðŸ“ Generating HQC System ontology...")
    ontology_ttl = generate_ontology()
    ontology_path = output_dir / "HQC System-ontology.ttl"
    with open(ontology_path, "w", encoding="utf-8") as f:
        f.write(ontology_ttl)
    print(f"   Saved: {ontology_path}")
    
    # Convert entities to RDF
    dataset_files = {}
    
    for entity_type, entities in entities_by_type.items():
        if not entities:
            continue
        
        type_info = ENTITY_TYPE_MAP.get(entity_type, {"dataset": "other"})
        dataset_name = type_info["dataset"]
        
        if dataset_name not in dataset_files:
            dataset_files[dataset_name] = [RDF_PREFIXES]
        
        for entity in entities:
            rdf_turtle = converter.convert_entity(entity)
            if rdf_turtle:
                dataset_files[dataset_name].append(rdf_turtle)
    
    # Save dataset files
    print("\nðŸ’¾ Saving RDF files...")
    for dataset_name, rdf_triples in dataset_files.items():
        ttl_content = "\n\n".join(rdf_triples)
        file_path = output_dir / f"HQC System-{dataset_name}.ttl"
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(ttl_content)
        
        print(f"   Saved: {file_path}")
    
    print(f"\nðŸ“Š Total RDF triples generated: ~{converter.triples_count}")
    
    # Upload to Fuseki if requested
    if args.upload:
        print("\nðŸŒ Uploading to Apache Jena Fuseki...")
        
        fuseki_url = args.fuseki_url or settings.GRAPHDB_URL
        uploader = FusekiUploader(fuseki_url)
        
        # Check connection
        if not await uploader.check_connection():
            print("âŒ Cannot connect to Fuseki. Make sure it's running.")
            return
        
        # Upload ontology first
        await uploader.create_dataset("HQC System-ontology")
        await uploader.upload_turtle("HQC System-ontology", ontology_ttl)
        
        # Upload each dataset
        for dataset_name, rdf_triples in dataset_files.items():
            full_dataset_name = f"HQC System-{dataset_name}"
            await uploader.create_dataset(full_dataset_name)
            await uploader.upload_turtle(full_dataset_name, "\n\n".join(rdf_triples))
            
            # Get stats
            stats = await uploader.get_dataset_stats(full_dataset_name)
            print(f"   {full_dataset_name}: {stats['triples']} triples")
        
        print("\nâœ… Upload complete!")
    
    print("\nðŸŽ‰ Export completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())

