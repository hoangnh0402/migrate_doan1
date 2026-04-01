<p align="center">
  <img src="../docs/assets/hqc-system-logo.png" alt="HQC System Logo" width="120">
</p>

<h1 align="center">HQC System Web App</h1>

<p align="center">
  <strong>Mobile & Web App cho Smart City Platform</strong>
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3">
  </a>
  <img src="https://img.shields.io/badge/React_Native-0.76-blue.svg" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-52-black.svg" alt="Expo">
</p>

---

## Tổng quan

HQC System Web App là ứng dụng React Native được xây dựng với Expo, cho phép người dùng:
- Xem thông tin thời tiết và chất lượng không khí theo thời gian thực
- Theo dõi tình trạng giao thông
- Phản ánh các vấn đề hiện trường (xả rác, lấn chiếm, v.v.)
- Tương tác với AI Assistant để tìm kiếm thông tin
- Quản lý hồ sơ cá nhân

## Công nghệ

| Thành phần | Công nghệ | Phiên bản |
|------------|-----------|-----------|
| Framework | React Native + Expo | 0.76.5 / 52 |
| Language | TypeScript | 5.3.3 |
| Navigation | React Navigation | 7.x |
| State Management | React Context API | - |
| Maps | React Native Maps | Latest |
| UI Components | Expo Vector Icons | Latest |
| Build Tool | Expo CLI | Latest |

## Cài đặt từ mã nguồn

### Yêu cầu hệ thống

- Node.js 20 trở lên
- npm 10 trở lên
- Backend API đang chạy (http://localhost:8000)

### Cài đặt tự động

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Cài đặt thủ công

**Bước 1: Clone repository**

```bash
git clone https://github.com/PKA-Open-Dynamics/HQC System.git
cd HQC System/web-app
```

**Bước 2: Cài đặt dependencies**

```bash
npm install
```

**Bước 3: Cấu hình environment**

```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần thay đổi API URL
```

**Bước 4: Chạy development server**

```bash
npm start
# Chọn platform: w (Web), a (Android), i (iOS)
```

## Build Production

### Web Build

```bash
npm run build:web
# Output: web-build/
```

### Android APK

```bash
npm install -g eas-cli
eas build --platform android --profile production
```

### iOS IPA

```bash
eas build --platform ios --profile production
```

## 📁 Cấu trúc thư mục

```
web-app/
├── src/
│   ├── components/          # React components tái sử dụng
│   │   ├── Avatar.tsx
│   │   ├── FloatingAIButton.tsx
│   │   └── ReportCard.tsx
│   ├── config/              # Cấu hình ứng dụng
│   │   └── env.ts           # Environment variables
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx   # Authentication context
│   ├── navigation/          # Navigation configuration
│   │   └── RootNavigator.tsx # Root navigation setup
│   ├── screens/             # Màn hình ứng dụng
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ExploreScreen.native.tsx
│   │   ├── MapScreen.native.tsx
│   │   ├── ReportScreen.native.tsx
│   │   ├── ProfileScreen.native.tsx
│   │   └── ...
│   └── services/            # API services
│       ├── auth.ts          # Authentication API
│       ├── weather.ts       # Weather & AQI API
│       └── traffic.ts       # Traffic API
├── assets/                  # Static assets
│   ├── icon.png
│   ├── splash-icon.png
│   └── videos/
├── scripts/                 # Build & setup scripts
│   ├── setup.sh            # Setup script (Linux/Mac)
│   ├── setup.ps1           # Setup script (Windows)
│   ├── start.sh            # Start script (Linux/Mac)
│   ├── start.ps1           # Start script (Windows)
│   ├── build.sh            # Build script (Linux/Mac)
│   └── build.ps1           # Build script (Windows)
├── App.tsx                  # Entry point
├── app.json                 # Expo config
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Cấu hình

### Environment Variables (.env)

```env
# API Base URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**Lưu ý:**
- File `.env` không được commit vào git
- Sử dụng `.env.example` làm template
- Biến môi trường phải bắt đầu với `EXPO_PUBLIC_`

## Dependencies

### Runtime
- `expo`: Expo SDK framework
- `react` & `react-native`: Core framework
- `@react-navigation/*`: Navigation
- `react-native-maps`: Maps integration
- `@react-native-async-storage/async-storage`: Storage

### Development
- `typescript`: Type checking
- `@types/react`: TypeScript types

Xem `package.json` cho danh sách đầy đủ.

## Scripts

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web
npm run build:web      # Build for production (web)
```

## Troubleshooting

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
npx expo start --port 8082
```

### Cannot connect to API
- Kiểm tra backend đã chạy
- Kiểm tra `EXPO_PUBLIC_API_BASE_URL` trong `.env`
- Kiểm tra CORS settings

## Changelog

Xem [CHANGELOG.md](CHANGELOG.md) cho lịch sử thay đổi chi tiết.

## Dependencies Info

Xem [DEPENDENCIES.md](DEPENDENCIES.md) cho thông tin chi tiết về licenses.

## Contributing

Xem [CONTRIBUTING.md](CONTRIBUTING.md) cho hướng dẫn đóng góp.

## License

**GNU General Public License v3.0 (GPL-3.0)**

```
Copyright (C) 2025 HQC System Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

Xem [LICENSE](LICENSE) cho toàn văn.

## Links

- **Repository**: https://github.com/PKA-OpenDynamics/HQC System
- **Backend**: [backend/README.md](../backend/README.md)
- **Web Dashboard**: [web-dashboard/README.md](../web-dashboard/README.md)
- **Issues**: https://github.com/PKA-OpenDynamics/HQC System/issues

---

## Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

<p align="center">
  Made with ❤️ by HQC System Contributors
</p>
