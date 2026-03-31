# HQC System Geo Utils

ThÆ° viá»‡n xá»­ lÃ½ dá»¯ liá»‡u Ä‘á»‹a lÃ½ vÃ  GeoJSON cho ná»n táº£ng HQC System Smart City.

## CÃ i Ä‘áº·t

```bash
npm install @pka_opendynamics_2025/HQC System-geo-utils
```

## Sá»­ dá»¥ng

```typescript
import {
  createPoint,
  createPolygon,
  createFeature,
  distanceBetweenPoints,
  calculateCentroid,
  isPointInPolygon,
  wktPointToGeoJSON,
  HANOI_CENTER,
  isInHanoi,
} from '@pka_opendynamics_2025/HQC System-geo-utils';

// Táº¡o GeoJSON Point
const point = createPoint(21.0285, 105.8542);

// TÃ­nh khoáº£ng cÃ¡ch giá»¯a 2 Ä‘iá»ƒm
const point1 = createPoint(21.0285, 105.8542);
const point2 = createPoint(21.0378, 105.8342);
const distance = distanceBetweenPoints(point1, point2);
console.log(`Khoáº£ng cÃ¡ch: ${distance.toFixed(2)} km`);

// Táº¡o Feature vá»›i properties
const feature = createFeature(point, {
  name: 'Há»“ HoÃ n Kiáº¿m',
  type: 'lake',
});

// Chuyá»ƒn Ä‘á»•i WKT sang GeoJSON
const geoPoint = wktPointToGeoJSON('POINT(105.8542 21.0285)');

// Kiá»ƒm tra Ä‘iá»ƒm trong khu vá»±c HÃ  Ná»™i
console.log(isInHanoi(HANOI_CENTER)); // => true

// Táº¡o Polygon vÃ  kiá»ƒm tra Ä‘iá»ƒm trong polygon
const polygon = createPolygon([
  [21.03, 105.85],
  [21.03, 105.86],
  [21.02, 105.86],
  [21.02, 105.85],
]);
console.log(isPointInPolygon(point, polygon)); // => true/false
```

## API

### Táº¡o GeoJSON

- `createPoint(lat, lon)` - Táº¡o GeoJSON Point
- `createLineString(coordinates)` - Táº¡o GeoJSON LineString
- `createPolygon(coordinates)` - Táº¡o GeoJSON Polygon
- `createFeature(geometry, properties, id?)` - Táº¡o GeoJSON Feature
- `createFeatureCollection(features)` - Táº¡o GeoJSON FeatureCollection

### TÃ­nh toÃ¡n Ä‘á»‹a lÃ½

- `distanceBetweenPoints(point1, point2)` - Khoáº£ng cÃ¡ch Haversine (km)
- `calculateCentroid(polygon)` - TÃ­nh tÃ¢m Ä‘iá»ƒm polygon
- `calculateBoundingBox(geometry)` - TÃ­nh bounding box
- `isPointInBoundingBox(point, bbox)` - Kiá»ƒm tra Ä‘iá»ƒm trong bbox
- `isPointInPolygon(point, polygon)` - Kiá»ƒm tra Ä‘iá»ƒm trong polygon

### Chuyá»ƒn Ä‘á»•i tá»a Ä‘á»™

- `pointToLatLng(point)` - GeoJSON Point sang {lat, lng}
- `latLngToPoint(latlng)` - {lat, lng} sang GeoJSON Point
- `wktPointToGeoJSON(wkt)` - WKT POINT sang GeoJSON
- `geoJSONPointToWkt(point)` - GeoJSON Point sang WKT

### Háº±ng sá»‘ HÃ  Ná»™i

- `HANOI_BOUNDING_BOX` - Bounding box khu vá»±c HÃ  Ná»™i
- `HANOI_CENTER` - TÃ¢m Ä‘iá»ƒm HÃ  Ná»™i (Há»“ HoÃ n Kiáº¿m)
- `isInHanoi(point)` - Kiá»ƒm tra Ä‘iá»ƒm trong HÃ  Ná»™i

## Kiá»ƒu dá»¯ liá»‡u

```typescript
interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface GeoJSONFeature<G, P> {
  type: 'Feature';
  geometry: G;
  properties: P;
  id?: string | number;
}

interface LatLng {
  lat: number;
  lng: number;
}
```

## Giáº¥y phÃ©p

GPL-3.0

