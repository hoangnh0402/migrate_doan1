<p align="center">
  <img src="../docs/assets/HQC System-logo.png" alt="HQC System Logo" width="120">
</p>

<h1 align="center">HQC System Web Dashboard</h1>

<p align="center">
  <strong>Admin Dashboard cho Smart City Platform</strong>
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3">
  </a>
  <img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript">
</p>

---

## Tá»•ng quan

HQC System Web Dashboard lÃ  giao diá»‡n quáº£n trá»‹ viÃªn cho phÃ©p:
- Xem vÃ  quáº£n lÃ½ bÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n
- Hiá»ƒn thá»‹ dá»¯ liá»‡u Ä‘á»‹a lÃ½ tá»« OpenStreetMap
- TÃ­ch há»£p dá»¯ liá»‡u LOD tá»« nhiá»u nguá»“n (weather, AQI, traffic)
- Theo dÃµi thá»‘ng kÃª vÃ  analytics
- Quáº£n lÃ½ ngÆ°á»i dÃ¹ng vÃ  cÃ i Ä‘áº·t

## CÃ´ng nghá»‡

| ThÃ nh pháº§n | CÃ´ng nghá»‡ | PhiÃªn báº£n |
|------------|-----------|-----------|
| Framework | Next.js (App Router) | 14.2.33 |
| Language | TypeScript | 5.6.3 |
| Styling | Tailwind CSS | 3.4.15 |
| Maps | Leaflet + React Leaflet | 1.9.4 |
| Charts | Recharts | 2.14.1 |
| State | Zustand | 5.0.2 |
| HTTP | Axios | 1.7.9 |

## CÃ i Ä‘áº·t tá»« mÃ£ nguá»“n

### YÃªu cáº§u há»‡ thá»‘ng

- Node.js 20 trá»Ÿ lÃªn
- npm 10 trá»Ÿ lÃªn
- Backend API Ä‘ang cháº¡y (http://localhost:8000)

### CÃ i Ä‘áº·t tá»± Ä‘á»™ng

```bash
chmod +x setup.sh
./setup.sh
```

### CÃ i Ä‘áº·t thá»§ cÃ´ng

**BÆ°á»›c 1: Clone repository**

```bash
git clone https://github.com/PKA-Open-Dynamics/HQC System.git
cd HQC System/web-dashboard
```

**BÆ°á»›c 2: CÃ i Ä‘áº·t dependencies**

```bash
npm install
```

**BÆ°á»›c 3: Cáº¥u hÃ¬nh environment**

```bash
cp .env.example .env.local
# Chá»‰nh sá»­a .env.local náº¿u cáº§n thay Ä‘á»•i API URL
```

**BÆ°á»›c 4: Cháº¡y development server**

```bash
npm run dev
```

á»¨ng dá»¥ng sáº½ cháº¡y táº¡i: **http://localhost:3000**

## Build cho production

```bash
# Build application
npm run build

# Start production server
npm start
```

## Cháº¡y vá»›i Docker

```bash
# Build image
docker build -t HQC System-web-dashboard .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1 \
  HQC System-web-dashboard
```

## Cáº¥u trÃºc thÆ° má»¥c

```
web-dashboard/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                    # Next.js App Router
â”‚   â”‚   â”œâ”€â”€ (dashboard)/        # Dashboard layout group
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard/      # Main dashboard
â”‚   â”‚   â”‚   â”œâ”€â”€ geographic/     # Dá»¯ liá»‡u Ä‘á»‹a lÃ½
â”‚   â”‚   â”‚   â”œâ”€â”€ reports/        # Quáº£n lÃ½ bÃ¡o cÃ¡o
â”‚   â”‚   â”‚   â”œâ”€â”€ users/          # Quáº£n lÃ½ ngÆ°á»i dÃ¹ng
â”‚   â”‚   â”‚   â””â”€â”€ settings/       # CÃ i Ä‘áº·t
â”‚   â”‚   â”œâ”€â”€ layout.tsx          # Root layout
â”‚   â”‚   â””â”€â”€ page.tsx            # Landing/redirect
â”‚   â”œâ”€â”€ components/             # React components
â”‚   â”‚   â”œâ”€â”€ geographic/         # LOD data panels
â”‚   â”‚   â”œâ”€â”€ layout/             # Header, sidebar
â”‚   â”‚   â”œâ”€â”€ map/                # Map components
â”‚   â”‚   â””â”€â”€ providers/          # Context providers
â”‚   â””â”€â”€ lib/                    # Utilities
â”‚       â”œâ”€â”€ api.ts              # API services
â”‚       â”œâ”€â”€ api-client.ts       # HTTP client
â”‚       â””â”€â”€ utils.ts            # Helpers
â”œâ”€â”€ public/                     # Static assets
â”œâ”€â”€ setup.sh                    # Script cÃ i Ä‘áº·t
â”œâ”€â”€ CHANGELOG.md                # Lá»‹ch sá»­ thay Ä‘á»•i
â”œâ”€â”€ CONTRIBUTING.md             # HÆ°á»›ng dáº«n Ä‘Ã³ng gÃ³p
â”œâ”€â”€ DEPENDENCIES.md             # ThÃ´ng tin thÆ° viá»‡n
â”œâ”€â”€ LICENSE                     # GPL-3.0 License
â””â”€â”€ package.json                # npm dependencies
```

## TÃ­nh nÄƒng chÃ­nh

### Dashboard
- Thá»‘ng kÃª tá»•ng quan (reports, users, facilities)
- Recent activities
- Quick actions

### Geographic Data
- Interactive map vá»›i Leaflet
- Boundary selector (quáº­n, phÆ°á»ng)
- TÃ­ch há»£p dá»¯ liá»‡u LOD:
  - Weather (OpenWeatherMap)
  - Air Quality (AQICN)
  - Traffic (TomTom)
  - Geographic (OpenStreetMap)

### Reports Management
- Danh sÃ¡ch bÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n
- Filter theo status, category
- Chi tiáº¿t bÃ¡o cÃ¡o vá»›i location

## Development

```bash
# Development server
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit

# Build
npm run build
```

## ÄÃ³ng gÃ³p

Xem [CONTRIBUTING.md](CONTRIBUTING.md) Ä‘á»ƒ biáº¿t cÃ¡ch Ä‘Ã³ng gÃ³p cho dá»± Ã¡n.

## Giáº¥y phÃ©p

Dá»± Ã¡n nÃ y Ä‘Æ°á»£c phÃ¡t hÃ nh theo giáº¥y phÃ©p **GNU General Public License v3.0 (GPL-3.0)**.

```
Copyright (c) 2025 HQC System Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

Xem file [LICENSE](LICENSE) Ä‘á»ƒ biáº¿t chi tiáº¿t.

## TÃ i liá»‡u liÃªn quan

- [DEPENDENCIES.md](DEPENDENCIES.md) - Danh sÃ¡ch thÆ° viá»‡n
- [CHANGELOG.md](CHANGELOG.md) - Lá»‹ch sá»­ thay Ä‘á»•i
- [Backend README](../backend/README.md) - Backend API documentation
- [Main README](../README.md) - TÃ i liá»‡u dá»± Ã¡n chÃ­nh

