# HQC System Utils

ThÆ° viá»‡n tiá»‡n Ã­ch cho ná»n táº£ng HQC System Smart City.

## CÃ i Ä‘áº·t

```bash
npm install @pka_opendynamics_2025/HQC System-utils
```

## Sá»­ dá»¥ng

```typescript
import {
  calculateDistance,
  createNgsiLdId,
  getAqiInfo,
  formatDateVi,
  ReportStatus,
  getReportStatusInfo,
} from '@pka_opendynamics_2025/HQC System-utils';

// TÃ­nh khoáº£ng cÃ¡ch giá»¯a 2 Ä‘iá»ƒm
const distance = calculateDistance(21.0285, 105.8542, 21.0378, 105.8342);
console.log(`Khoáº£ng cÃ¡ch: ${distance.toFixed(2)} km`);

// Táº¡o NGSI-LD Entity ID
const entityId = createNgsiLdId('CivicIssue', '12345');
// => 'urn:ngsi-ld:CivicIssue:12345'

// Láº¥y thÃ´ng tin AQI
const aqiInfo = getAqiInfo(75);
console.log(aqiInfo.labelVi); // => 'Trung bÃ¬nh'

// Format ngÃ y thÃ¡ng tiáº¿ng Viá»‡t
const dateStr = formatDateVi(new Date());
console.log(dateStr); // => '24/01/2025 21:30'

// Láº¥y thÃ´ng tin tráº¡ng thÃ¡i bÃ¡o cÃ¡o
const statusInfo = getReportStatusInfo(ReportStatus.IN_PROGRESS);
console.log(statusInfo.labelVi); // => 'Äang xá»­ lÃ½'
```

## API

### Tiá»‡n Ã­ch tá»a Ä‘á»™ Ä‘á»‹a lÃ½

- `calculateDistance(lat1, lon1, lat2, lon2)` - TÃ­nh khoáº£ng cÃ¡ch (km)
- `toRadians(degrees)` - Chuyá»ƒn Ä‘á»™ sang radian
- `toDegrees(radians)` - Chuyá»ƒn radian sang Ä‘á»™
- `isValidCoordinate(lat, lon)` - Kiá»ƒm tra tá»a Ä‘á»™ há»£p lá»‡

### Tiá»‡n Ã­ch NGSI-LD

- `createNgsiLdId(entityType, id)` - Táº¡o URN chuáº©n NGSI-LD
- `parseNgsiLdId(urn)` - PhÃ¢n tÃ­ch URN
- `isValidNgsiLdUrn(urn)` - Kiá»ƒm tra URN há»£p lá»‡

### Tiá»‡n Ã­ch AQI

- `getAqiInfo(aqi)` - Láº¥y thÃ´ng tin má»©c Ä‘á»™ AQI
- `AqiLevel` - Enum cÃ¡c má»©c Ä‘á»™ AQI

### Tiá»‡n Ã­ch format

- `formatNumberVi(num)` - Format sá»‘ theo chuáº©n Viá»‡t Nam
- `formatDateVi(date)` - Format ngÃ y thÃ¡ng tiáº¿ng Viá»‡t
- `formatDistance(km)` - Format khoáº£ng cÃ¡ch thÃ¢n thiá»‡n

### Tiá»‡n Ã­ch bÃ¡o cÃ¡o

- `getReportStatusInfo(status)` - Láº¥y thÃ´ng tin tráº¡ng thÃ¡i
- `ReportStatus` - Enum tráº¡ng thÃ¡i bÃ¡o cÃ¡o

## Giáº¥y phÃ©p

GPL-3.0

