# Publishing Packages to GitHub Packages

HÆ°á»›ng dáº«n publish cÃ¡c NPM packages cá»§a HQC System lÃªn GitHub Packages.

## YÃªu cáº§u

1. **GitHub Personal Access Token** vá»›i quyá»n:
   - `write:packages`
   - `read:packages`
   - `delete:packages` (optional)

2. **npm** Ä‘Ã£ Ä‘Æ°á»£c cÃ i Ä‘áº·t

## BÆ°á»›c 1: Táº¡o GitHub Personal Access Token

1. VÃ o GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** â†’ **"Generate new token (classic)"**
3. Äáº·t tÃªn: `HQC System Packages`
4. Chá»n scopes:
   - âœ… `write:packages`
   - âœ… `read:packages`
   - âœ… `repo` (náº¿u repository private)
5. Click **"Generate token"**
6. **LÆ°u token** (chá»‰ hiá»‡n 1 láº§n!)

## BÆ°á»›c 2: Authenticate vá»›i GitHub Packages

```bash
npm login --registry=https://npm.pkg.github.com
```

Nháº­p thÃ´ng tin:
- **Username**: your-github-username
- **Password**: your-personal-access-token (tá»« bÆ°á»›c 1)
- **Email**: your-email@example.com

## BÆ°á»›c 3: Build vÃ  Publish

### Option 1: Publish táº¥t cáº£ packages (Khuyáº¿n nghá»‹)

```bash
cd packages
./scripts/publish-all.sh
```

### Option 2: Publish tá»«ng package riÃªng láº»

```bash
# HQC System-utils
cd packages/HQC System-utils
npm run build
npm publish

# HQC System-geo-utils
cd ../HQC System-geo-utils
npm run build
npm publish

# HQC System-ngsi-ld
cd ../HQC System-ngsi-ld
npm run build
npm publish
```

## BÆ°á»›c 4: XÃ¡c nháº­n Packages Ä‘Ã£ publish

1. VÃ o: https://github.com/PKA-OpenDynamics/HQC System/packages
2. Báº¡n sáº½ tháº¥y 3 packages:
   - `@pka-opendynamics/HQC System-utils`
   - `@pka-opendynamics/HQC System-geo-utils`
   - `@pka-opendynamics/HQC System-ngsi-ld`

## BÆ°á»›c 5: CÃ i Ä‘áº·t tá»« GitHub Packages

Äá»ƒ sá»­ dá»¥ng packages Ä‘Ã£ publish, ngÆ°á»i dÃ¹ng cáº§n táº¡o file `.npmrc`:

```bash
# .npmrc
@pka-opendynamics:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Sau Ä‘Ã³ cÃ i Ä‘áº·t:

```bash
npm install @pka-opendynamics/HQC System-utils
npm install @pka-opendynamics/HQC System-geo-utils
npm install @pka-opendynamics/HQC System-ngsi-ld
```

## Troubleshooting

### Lá»—i 401 Unauthorized

```bash
# Re-authenticate
npm logout --registry=https://npm.pkg.github.com
npm login --registry=https://npm.pkg.github.com
```

### Lá»—i 404 Not Found

Kiá»ƒm tra:
- Package name pháº£i match vá»›i owner: `@pka-opendynamics/...`
- Repository URL Ä‘Ãºng trong package.json
- Token cÃ³ Ä‘á»§ quyá»n

### Lá»—i "You cannot publish over the previously published versions"

Package Ä‘Ã£ Ä‘Æ°á»£c publish vá»›i version nÃ y. TÄƒng version:

```bash
npm version patch  # 1.0.0 â†’ 1.0.1
npm version minor  # 1.0.0 â†’ 1.1.0
npm version major  # 1.0.0 â†’ 2.0.0
```

## Update Packages

Khi cÃ³ thay Ä‘á»•i:

```bash
# 1. TÄƒng version
cd packages/HQC System-utils
npm version patch  # hoáº·c minor/major

# 2. Build vÃ  publish
npm run build
npm publish
```

## XÃ³a Package Version

Náº¿u cáº§n xÃ³a version Ä‘Ã£ publish:

```bash
npm unpublish @pka-opendynamics/HQC System-utils@1.0.0 --registry=https://npm.pkg.github.com
```

**LÆ°u Ã½**: Chá»‰ xÃ³a Ä‘Æ°á»£c trong vÃ²ng 72 giá» sau khi publish.

## Automation vá»›i GitHub Actions

Táº¡o file `.github/workflows/publish-packages.yml` Ä‘á»ƒ tá»± Ä‘á»™ng publish khi cÃ³ tag:

```yaml
name: Publish Packages

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
      
      - name: Install dependencies
        run: |
          cd packages/HQC System-utils && npm install
          cd ../HQC System-geo-utils && npm install
          cd ../HQC System-ngsi-ld && npm install
      
      - name: Publish packages
        run: cd packages && ./scripts/publish-all.sh
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Links

- **GitHub Packages**: https://github.com/PKA-OpenDynamics/HQC System/packages
- **Documentation**: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry

