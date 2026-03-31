# HQC System Web Dashboard - Dependencies

TÃ i liá»‡u nÃ y liá»‡t kÃª táº¥t cáº£ cÃ¡c thÆ° viá»‡n vÃ  gÃ³i pháº§n má»m Ä‘Æ°á»£c sá»­ dá»¥ng trong dá»± Ã¡n HQC System Web Dashboard.

## PhiÃªn báº£n Runtime

- **Node.js**: 20+ (LTS khuyáº¿n nghá»‹)
- **npm**: 10+

## ThÆ° viá»‡n chÃ­nh (Dependencies)

### Core Framework

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Next.js](https://nextjs.org/) | 14.2.33 | MIT | React framework vá»›i SSR/SSG |
| [React](https://react.dev/) | 18.3.1 | MIT | UI library |
| [React DOM](https://react.dev/) | 18.3.1 | MIT | React DOM renderer |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.3 | Apache-2.0 | Type-safe JavaScript |

### UI & Styling

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.15 | MIT | Utility-first CSS |
| [Lucide React](https://lucide.dev/) | 0.460.0 | ISC | Icon library |
| [class-variance-authority](https://cva.style/) | 0.7.1 | Apache-2.0 | Component variants |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | MIT | ClassName utility |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 2.5.5 | MIT | Tailwind class merging |
| [Framer Motion](https://www.framer.com/motion/) | 11.13.5 | MIT | Animation library |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.4 | MIT | Theme switching |

### Maps & Geospatial

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Leaflet](https://leafletjs.com/) | 1.9.4 | BSD-2-Clause | Interactive maps |
| [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) | 1.5.3 | MIT | Marker clustering |

> **LÆ°u Ã½**: Dá»± Ã¡n sá»­ dá»¥ng Leaflet trá»±c tiáº¿p vá»›i custom React wrapper (`src/components/map/LeafletReactWrapper.tsx`) Ä‘á»ƒ Ä‘áº£m báº£o tuÃ¢n thá»§ giáº¥y phÃ©p mÃ£ nguá»“n má»Ÿ (Leaflet: BSD-2-Clause).

### Data & State Management

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Axios](https://axios-http.com/) | 1.7.9 | MIT | HTTP client |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0.2 | MIT | State management |
| [Zod](https://zod.dev/) | 3.23.8 | MIT | Schema validation |

### Charts & Visualization

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Recharts](https://recharts.org/) | 2.14.1 | MIT | Chart library |

### Utilities

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [date-fns](https://date-fns.org/) | 4.1.0 | MIT | Date utilities |
| [react-router-dom](https://reactrouter.com/) | 7.10.1 | MIT | Routing (backup) |

### Build Tools

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [PostCSS](https://postcss.org/) | 8.4.49 | MIT | CSS processing |
| [Autoprefixer](https://autoprefixer.github.io/) | 10.4.20 | MIT | CSS vendor prefixes |

## Development Dependencies

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [ESLint](https://eslint.org/) | 8.57.1 | MIT | JavaScript linter |
| [eslint-config-next](https://nextjs.org/docs/basic-features/eslint) | 14.2.33 | MIT | Next.js ESLint config |
| [Prettier](https://prettier.io/) | 3.4.2 | MIT | Code formatter |
| [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) | 0.6.9 | MIT | Tailwind class sorting |
| [@types/leaflet](https://www.npmjs.com/package/@types/leaflet) | 1.9.15 | MIT | Leaflet TypeScript types |

## Type Definitions

| Package | PhiÃªn báº£n | MÃ´ táº£ |
|---------|-----------|-------|
| @types/node | 22.10.2 | Node.js types |
| @types/react | 18.3.12 | React types |
| @types/react-dom | 18.3.1 | React DOM types |
| @types/leaflet | 1.9.15 | Leaflet types |
| @types/leaflet.markercluster | 1.5.6 | Marker cluster types |

## CÃ i Ä‘áº·t

```bash
# CÃ i Ä‘áº·t táº¥t cáº£ dependencies
npm install

# Hoáº·c vá»›i yarn
yarn install

# Hoáº·c vá»›i pnpm
pnpm install
```

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## TÆ°Æ¡ng thÃ­ch giáº¥y phÃ©p

Táº¥t cáº£ cÃ¡c thÆ° viá»‡n Ä‘Æ°á»£c sá»­ dá»¥ng Ä‘á»u cÃ³ giáº¥y phÃ©p tÆ°Æ¡ng thÃ­ch vá»›i GPL-3.0:
- MIT License âœ“
- BSD Licenses (2-Clause) âœ“
- Apache-2.0 âœ“
- ISC License âœ“

Dá»± Ã¡n HQC System Web Dashboard Ä‘Æ°á»£c phÃ¡t hÃ nh theo giáº¥y phÃ©p **GNU General Public License v3.0 (GPL-3.0)**.

## External Services

Dashboard káº¿t ná»‘i vá»›i HQC System Backend API Ä‘á»ƒ láº¥y dá»¯ liá»‡u. KhÃ´ng cÃ³ external service nÃ o Ä‘Æ°á»£c gá»i trá»±c tiáº¿p tá»« frontend.

### Map Tiles

| Provider | Má»¥c Ä‘Ã­ch | Giáº¥y phÃ©p |
|----------|----------|-----------|
| [OpenStreetMap](https://www.openstreetmap.org/) | Base map tiles | ODbL |
| [CartoDB](https://carto.com/) | Light/Dark map themes | CC BY 3.0 |

