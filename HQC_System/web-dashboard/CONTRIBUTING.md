# HÆ°á»›ng dáº«n ÄÃ³ng gÃ³p cho HQC System Web Dashboard

Cáº£m Æ¡n báº¡n quan tÃ¢m Ä‘áº¿n viá»‡c Ä‘Ã³ng gÃ³p cho dá»± Ã¡n HQC System Web Dashboard! TÃ i liá»‡u nÃ y cung cáº¥p hÆ°á»›ng dáº«n Ä‘á»ƒ Ä‘Ã³ng gÃ³p vÃ o web dashboard.

## Má»¥c lá»¥c

- [Quy táº¯c á»©ng xá»­](#quy-táº¯c-á»©ng-xá»­)
- [Thiáº¿t láº­p mÃ´i trÆ°á»ng](#thiáº¿t-láº­p-mÃ´i-trÆ°á»ng)
- [Cáº¥u trÃºc dá»± Ã¡n](#cáº¥u-trÃºc-dá»±-Ã¡n)
- [Chuáº©n code](#chuáº©n-code)
- [Quy trÃ¬nh Pull Request](#quy-trÃ¬nh-pull-request)

## Quy táº¯c á»©ng xá»­

Dá»± Ã¡n nÃ y tuÃ¢n theo [Quy táº¯c á»©ng xá»­](../CODE_OF_CONDUCT.md) cá»§a HQC System.

## Thiáº¿t láº­p mÃ´i trÆ°á»ng

### YÃªu cáº§u

- Node.js 20+
- npm 10+
- Backend API Ä‘ang cháº¡y (http://localhost:8000)

### CÃ i Ä‘áº·t

```bash
# Clone repository
git clone https://github.com/PKA-Open-Dynamics/HQC System.git
cd HQC System/web-dashboard

# CÃ i Ä‘áº·t dependencies
npm install

# Copy vÃ  cáº¥u hÃ¬nh environment
cp .env.example .env.local
# Chá»‰nh sá»­a .env.local náº¿u cáº§n

# Cháº¡y development server
npm run dev
```

á»¨ng dá»¥ng sáº½ cháº¡y táº¡i: http://localhost:3000

## Cáº¥u trÃºc dá»± Ã¡n

```
web-dashboard/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                    # Next.js App Router
â”‚   â”‚   â”œâ”€â”€ (dashboard)/        # Dashboard layout group
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard/      # Main dashboard page
â”‚   â”‚   â”‚   â”œâ”€â”€ geographic/     # Geographic data page
â”‚   â”‚   â”‚   â”œâ”€â”€ reports/        # Reports page
â”‚   â”‚   â”‚   â”œâ”€â”€ users/          # Users page
â”‚   â”‚   â”‚   â””â”€â”€ settings/       # Settings page
â”‚   â”‚   â”œâ”€â”€ layout.tsx          # Root layout
â”‚   â”‚   â””â”€â”€ page.tsx            # Landing page
â”‚   â”œâ”€â”€ components/             # React components
â”‚   â”‚   â”œâ”€â”€ geographic/         # Geographic components
â”‚   â”‚   â”œâ”€â”€ layout/             # Layout components
â”‚   â”‚   â”œâ”€â”€ map/                # Map components
â”‚   â”‚   â””â”€â”€ providers/          # Context providers
â”‚   â””â”€â”€ lib/                    # Utilities & API
â”‚       â”œâ”€â”€ api.ts              # API services
â”‚       â”œâ”€â”€ api-client.ts       # HTTP client
â”‚       â””â”€â”€ utils.ts            # Utility functions
â”œâ”€â”€ public/                     # Static files
â””â”€â”€ package.json                # Dependencies
```

## Chuáº©n code

### TypeScript Style

- **Strict mode**: TypeScript strict enabled
- **ESLint**: Sá»­ dá»¥ng eslint-config-next
- **Prettier**: Auto-format with Tailwind plugin

### Format code

```bash
# Lint
npm run lint

# Format
npm run format
```

### License Header

Má»—i file TypeScript/TSX pháº£i cÃ³ license header:

```typescript
// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)
```

### Component Conventions

- Functional components vá»›i TypeScript
- Use `'use client'` directive cho client components
- Tailwind CSS cho styling
- Lucide React cho icons

### Folder Naming

- `kebab-case` cho folders
- `PascalCase.tsx` cho components
- `camelCase.ts` cho utilities

## Quy trÃ¬nh Pull Request

1. Fork repository
2. Táº¡o branch: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mÃ´ táº£"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Táº¡o Pull Request

### Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Build & Test

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## LiÃªn há»‡

- Issues: [GitHub Issues](https://github.com/PKA-Open-Dynamics/HQC System/issues)
- Email: HQC System@example.com

