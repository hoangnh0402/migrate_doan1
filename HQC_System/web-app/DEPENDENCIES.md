# HQC System Web App - Dependencies

TÃ i liá»‡u nÃ y liá»‡t kÃª táº¥t cáº£ cÃ¡c thÆ° viá»‡n vÃ  gÃ³i pháº§n má»m Ä‘Æ°á»£c sá»­ dá»¥ng trong dá»± Ã¡n HQC System Web App.

## PhiÃªn báº£n Runtime

- **Node.js**: 20+ (khuyáº¿n nghá»‹ 20.x LTS)
- **npm**: 10+

## ThÆ° viá»‡n chÃ­nh

### Core Framework

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Expo](https://expo.dev/) | ~52.0.32 | MIT | Development platform cho React Native |
| [React](https://react.dev/) | 18.3.1 | MIT | UI library |
| [React Native](https://reactnative.dev/) | 0.76.5 | MIT | Framework Ä‘á»ƒ build native apps |

### Navigation

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [@react-navigation/native](https://reactnavigation.org/) | ^7.0.13 | MIT | Navigation library |
| [@react-navigation/bottom-tabs](https://reactnavigation.org/) | ^7.2.0 | MIT | Bottom tab navigator |
| [@react-navigation/native-stack](https://reactnavigation.org/) | ^7.3.3 | MIT | Native stack navigator |
| [react-native-screens](https://github.com/software-mansion/react-native-screens) | ~4.4.0 | MIT | Native navigation primitives |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | 4.12.0 | MIT | Safe area utilities |

### UI Components

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [@expo/vector-icons](https://icons.expo.fyi/) | ^14.0.4 | MIT | Icon library |
| [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | ~14.0.1 | MIT | Gradient components |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) | ~2.20.2 | MIT | Gesture handling |

### Maps & Location

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [react-native-maps](https://github.com/react-native-maps/react-native-maps) | ^1.18.0 | MIT | Maps component |
| [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) | ~18.0.4 | MIT | Location services |

### Storage & Data

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | 2.1.0 | MIT | Local storage |
| [axios](https://axios-http.com/) | ^1.7.9 | MIT | HTTP client |

### Media & Camera

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | ~16.0.3 | MIT | Image picker |
| [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) | ~15.0.1 | MIT | Audio/Video player |

### Development

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [TypeScript](https://www.typescriptlang.org/) | ~5.3.3 | Apache-2.0 | Type checking |
| [@types/react](https://www.npmjs.com/package/@types/react) | ~18.3.12 | MIT | React type definitions |
| [@types/react-native](https://www.npmjs.com/package/@types/react-native) | Latest | MIT | React Native types |

## Platform-specific Dependencies

### iOS

- CocoaPods (quáº£n lÃ½ dependencies)
- Xcode 15+ (Ä‘á»ƒ build)

### Android

- Android Studio (Ä‘á»ƒ build)
- Gradle 8+ (build system)

## Build Tools

| Tool | PhiÃªn báº£n | Má»¥c Ä‘Ã­ch |
|------|-----------|----------|
| [EAS Build](https://docs.expo.dev/build/introduction/) | Latest | Cloud build service |
| [Metro](https://facebook.github.io/metro/) | Latest | JavaScript bundler |

## ThÆ° viá»‡n Optional

CÃ¡c thÆ° viá»‡n cÃ³ thá»ƒ Ä‘Æ°á»£c thÃªm trong tÆ°Æ¡ng lai:

- **Redux**: State management nÃ¢ng cao
- **React Query**: Data fetching vÃ  caching
- **Formik**: Form management
- **Yup**: Schema validation
- **i18next**: Internationalization

## License Compliance

### Tá»•ng quan Licenses

- **MIT**: Pháº§n lá»›n dependencies (â‰ˆ95%)
- **Apache-2.0**: TypeScript vÃ  má»™t sá»‘ libraries
- **BSD**: Má»™t sá»‘ core React Native modules

### License Tá»•ng há»£p

Táº¥t cáº£ dependencies Ä‘á»u sá»­ dá»¥ng licenses tÆ°Æ¡ng thÃ­ch vá»›i GPL-3.0:

- âœ… MIT License: Compatible
- âœ… Apache-2.0: Compatible
- âœ… BSD-3-Clause: Compatible

## Cáº­p nháº­t Dependencies

### Kiá»ƒm tra updates

```bash
npm outdated
```

### Update dependencies

```bash
# Update minor/patch versions
npm update

# Update specific package
npm install expo@latest

# Update Expo SDK
npx expo install --fix
```

### Version Policy

- **Major updates**: Sau khi testing ká»¹ lÆ°á»¡ng
- **Minor updates**: Monthly
- **Patch updates**: As needed (security fixes)

## Security

### Kiá»ƒm tra vulnerabilities

```bash
npm audit
npm audit fix
```

### BÃ¡o cÃ¡o security issues

Email: security@HQC System.org

## ThÃ´ng tin thÃªm

### Package Registry

- NPM Registry: https://registry.npmjs.org/
- Expo Registry: https://registry.expo.dev/

### Documentation

- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/docs/getting-started
- React Navigation: https://reactnavigation.org/docs/getting-started

---

**LÆ°u Ã½**: LuÃ´n kiá»ƒm tra file `package.json` Ä‘á»ƒ biáº¿t phiÃªn báº£n chÃ­nh xÃ¡c Ä‘ang Ä‘Æ°á»£c sá»­ dá»¥ng.

