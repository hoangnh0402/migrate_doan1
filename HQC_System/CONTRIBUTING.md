# HÆ°á»›ng dáº«n ÄÃ³ng gÃ³p cho HQC System

Cáº£m Æ¡n báº¡n quan tÃ¢m Ä‘áº¿n viá»‡c Ä‘Ã³ng gÃ³p cho dá»± Ã¡n HQC System! TÃ i liá»‡u nÃ y cung cáº¥p hÆ°á»›ng dáº«n vÃ  quy táº¯c Ä‘á»ƒ Ä‘Ã³ng gÃ³p vÃ o dá»± Ã¡n.

## Má»¥c lá»¥c

- [Quy táº¯c á»©ng xá»­](#quy-táº¯c-á»©ng-xá»­)
- [Báº¯t Ä‘áº§u](#báº¯t-Ä‘áº§u)
- [Quy trÃ¬nh phÃ¡t triá»ƒn](#quy-trÃ¬nh-phÃ¡t-triá»ƒn)
- [Chuáº©n code](#chuáº©n-code)
- [Quy táº¯c commit](#quy-táº¯c-commit)
- [Quy trÃ¬nh Pull Request](#quy-trÃ¬nh-pull-request)
- [BÃ¡o cÃ¡o lá»—i](#bÃ¡o-cÃ¡o-lá»—i)
- [Äá» xuáº¥t tÃ­nh nÄƒng](#Ä‘á»-xuáº¥t-tÃ­nh-nÄƒng)
- [TÃ i liá»‡u](#tÃ i-liá»‡u)
- [Cá»™ng Ä‘á»“ng](#cá»™ng-Ä‘á»“ng)

## Quy táº¯c á»©ng xá»­

Dá»± Ã¡n nÃ y vÃ  táº¥t cáº£ má»i ngÆ°á»i tham gia Ä‘á»u tuÃ¢n theo [Quy táº¯c á»©ng xá»­](CODE_OF_CONDUCT.md). Báº±ng viá»‡c tham gia, báº¡n cam káº¿t tuÃ¢n thá»§ cÃ¡c quy táº¯c nÃ y. Vui lÃ²ng bÃ¡o cÃ¡o hÃ nh vi khÃ´ng phÃ¹ há»£p cho ngÆ°á»i duy trÃ¬ dá»± Ã¡n.

## Báº¯t Ä‘áº§u

### YÃªu cáº§u trÆ°á»›c khi báº¯t Ä‘áº§u

Äáº£m báº£o báº¡n Ä‘Ã£ cÃ i Ä‘áº·t cÃ¡c cÃ´ng cá»¥ sau:

**Backend:**
- Python 3.11 trá»Ÿ lÃªn
- PostgreSQL 15 trá»Ÿ lÃªn vá»›i extension PostGIS
- Redis 7 trá»Ÿ lÃªn
- Apache Jena Fuseki hoáº·c GraphDB
- MongoDB 6 trá»Ÿ lÃªn

**Web Dashboard:**
- Node.js 18 trá»Ÿ lÃªn
- npm 9 trá»Ÿ lÃªn

**Mobile App:**
- Flutter 3.x
- Dart 3.x

### Thiáº¿t láº­p mÃ´i trÆ°á»ng phÃ¡t triá»ƒn

1. Fork repository trÃªn GitHub
2. Clone fork cá»§a báº¡n vá» mÃ¡y:
   ```bash
   git clone https://github.com/TEN_BAN/HQC System.git
   cd HQC System
   ```

3. ThÃªm upstream repository:
   ```bash
   git remote add upstream https://github.com/CHU_DU_AN_GOC/HQC System.git
   ```

4. Thiáº¿t láº­p backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Chá»‰nh sá»­a file .env vá»›i cáº¥u hÃ¬nh cá»§a báº¡n
   alembic upgrade head
   ```

5. Thiáº¿t láº­p web dashboard:
   ```bash
   cd web-dashboard
   npm install
   cp .env.example .env
   # Chá»‰nh sá»­a file .env vá»›i cáº¥u hÃ¬nh cá»§a báº¡n
   ```

6. Thiáº¿t láº­p mobile app:
   ```bash
   cd mobile-app
   flutter pub get
   ```

## Quy trÃ¬nh phÃ¡t triá»ƒn

### Táº¡o branch má»›i

LuÃ´n táº¡o branch má»›i cho cÃ´ng viá»‡c cá»§a báº¡n:

```bash
git checkout -b feature/ten-tinh-nang
# hoáº·c
git checkout -b fix/sua-loi
# hoáº·c
git checkout -b docs/cap-nhat-tai-lieu
```

Quy táº¯c Ä‘áº·t tÃªn branch:
- `feature/` - TÃ­nh nÄƒng má»›i
- `fix/` - Sá»­a lá»—i
- `docs/` - Cáº­p nháº­t tÃ i liá»‡u
- `refactor/` - TÃ¡i cáº¥u trÃºc code
- `test/` - ThÃªm hoáº·c cáº­p nháº­t tests
- `chore/` - CÃ´ng viá»‡c báº£o trÃ¬

### Thá»±c hiá»‡n thay Ä‘á»•i

1. Thá»±c hiá»‡n thay Ä‘á»•i trong branch cá»§a báº¡n
2. Viáº¿t hoáº·c cáº­p nháº­t tests náº¿u cáº§n
3. Äáº£m báº£o táº¥t cáº£ tests Ä‘á»u pass
4. Cáº­p nháº­t tÃ i liá»‡u náº¿u cáº§n thiáº¿t
5. TuÃ¢n thá»§ chuáº©n code Ä‘Æ°á»£c nÃªu dÆ°á»›i Ä‘Ã¢y

### Kiá»ƒm tra thay Ä‘á»•i

**Backend:**
```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```

**Web Dashboard:**
```bash
cd web-dashboard
npm test
npm run lint
```

**Mobile App:**
```bash
cd mobile-app
flutter test
flutter analyze
```

## Chuáº©n code

### Python (Backend)

- TuÃ¢n theo hÆ°á»›ng dáº«n phong cÃ¡ch PEP 8
- Sá»­ dá»¥ng Black Ä‘á»ƒ format code
- Sá»­ dá»¥ng isort Ä‘á»ƒ sáº¯p xáº¿p imports
- Sá»­ dá»¥ng mypy Ä‘á»ƒ kiá»ƒm tra type
- Viáº¿t docstrings cho táº¥t cáº£ functions vÃ  classes cÃ´ng khai (phong cÃ¡ch Google)
- Äá»™ dÃ i dÃ²ng tá»‘i Ä‘a: 100 kÃ½ tá»±

VÃ­ dá»¥:
```python
from typing import List, Optional

def xu_ly_bao_cao(
    bao_cao_id: int,
    nguoi_dung_id: int,
    trang_thai: Optional[str] = None
) -> dict:
    """Xá»­ lÃ½ bÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n vÃ  cáº­p nháº­t tráº¡ng thÃ¡i.
    
    Args:
        bao_cao_id: ID cá»§a bÃ¡o cÃ¡o cáº§n xá»­ lÃ½
        nguoi_dung_id: ID cá»§a ngÆ°á»i dÃ¹ng xá»­ lÃ½ bÃ¡o cÃ¡o
        trang_thai: Tráº¡ng thÃ¡i má»›i cho bÃ¡o cÃ¡o (tÃ¹y chá»n)
        
    Returns:
        Dictionary chá»©a dá»¯ liá»‡u bÃ¡o cÃ¡o Ä‘Ã£ cáº­p nháº­t
        
    Raises:
        ValueError: Náº¿u bao_cao_id khÃ´ng há»£p lá»‡
        PermissionError: Náº¿u ngÆ°á»i dÃ¹ng khÃ´ng cÃ³ quyá»n
    """
    # Triá»ƒn khai á»Ÿ Ä‘Ã¢y
    pass
```

Cháº¡y formatters:
```bash
black app/
isort app/
mypy app/
```

### TypeScript/React (Web Dashboard)

- TuÃ¢n theo Airbnb JavaScript Style Guide
- Sá»­ dá»¥ng Prettier Ä‘á»ƒ format code
- Sá»­ dá»¥ng ESLint Ä‘á»ƒ kiá»ƒm tra code
- Viáº¿t JSDoc comments cho cÃ¡c hÃ m phá»©c táº¡p
- Sá»­ dá»¥ng functional components vá»›i hooks
- Sá»­ dá»¥ng TypeScript strict mode

VÃ­ dá»¥:
```typescript
interface DuLieuBaoCao {
  id: string;
  tieu_de: string;
  muc_do: 'thap' | 'trung_binh' | 'cao';
}

/**
 * Láº¥y dá»¯ liá»‡u bÃ¡o cÃ¡o tá»« API
 * @param baoCaoId - ID cá»§a bÃ¡o cÃ¡o cáº§n láº¥y
 * @returns Promise resolve vá» dá»¯ liá»‡u bÃ¡o cÃ¡o
 */
async function layBaoCao(baoCaoId: string): Promise<DuLieuBaoCao> {
  const response = await fetch(`/api/v1/reports/${baoCaoId}`);
  return response.json();
}
```

Cháº¡y formatters:
```bash
npm run format
npm run lint
```

### Dart (Mobile App)

- TuÃ¢n theo Effective Dart
- Sá»­ dá»¥ng `dart format` Ä‘á»ƒ format code
- Sá»­ dá»¥ng `dart analyze` Ä‘á»ƒ phÃ¢n tÃ­ch tÄ©nh
- Viáº¿t documentation comments cho public APIs
- Äá»™ dÃ i dÃ²ng tá»‘i Ä‘a: 80 kÃ½ tá»±

VÃ­ dá»¥:
```dart
/// Äáº¡i diá»‡n cho má»™t bÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n trong há»‡ thá»‘ng.
class BaoCao {
  /// Táº¡o instance bÃ¡o cÃ¡o má»›i.
  BaoCao({
    required this.id,
    required this.tieuDe,
    required this.mucDo,
  });

  /// MÃ£ Ä‘á»‹nh danh duy nháº¥t cho bÃ¡o cÃ¡o nÃ y.
  final String id;
  
  /// TiÃªu Ä‘á» cá»§a bÃ¡o cÃ¡o.
  final String tieuDe;
  
  /// Má»©c Ä‘á»™ nghiÃªm trá»ng cá»§a bÃ¡o cÃ¡o.
  final MucDo mucDo;
}
```

Cháº¡y formatters:
```bash
dart format lib/
dart analyze
```

## Quy táº¯c commit

ChÃºng tÃ´i tuÃ¢n theo Ä‘áº·c táº£ Conventional Commits.

### Äá»‹nh dáº¡ng commit message

```
<loai>(<pham-vi>): <tieu-de>

<noi-dung>

<footer>
```

### CÃ¡c loáº¡i commit

- `feat`: TÃ­nh nÄƒng má»›i
- `fix`: Sá»­a lá»—i
- `docs`: Chá»‰ thay Ä‘á»•i tÃ i liá»‡u
- `style`: Thay Ä‘á»•i khÃ´ng áº£nh hÆ°á»Ÿng Ä‘áº¿n Ã½ nghÄ©a cá»§a code
- `refactor`: Thay Ä‘á»•i code khÃ´ng sá»­a lá»—i cÅ©ng khÃ´ng thÃªm tÃ­nh nÄƒng
- `perf`: Thay Ä‘á»•i code cáº£i thiá»‡n hiá»‡u nÄƒng
- `test`: ThÃªm tests thiáº¿u hoáº·c sá»­a tests hiá»‡n cÃ³
- `build`: Thay Ä‘á»•i áº£nh hÆ°á»Ÿng Ä‘áº¿n há»‡ thá»‘ng build hoáº·c dependencies
- `ci`: Thay Ä‘á»•i files vÃ  scripts cáº¥u hÃ¬nh CI
- `chore`: Thay Ä‘á»•i khÃ¡c khÃ´ng sá»­a src hoáº·c test files

### Pháº¡m vi

Pháº¡m vi nÃªn lÃ  tÃªn cá»§a module bá»‹ áº£nh hÆ°á»Ÿng:

- `backend`
- `web`
- `mobile`
- `api`
- `db`
- `docs`

### VÃ­ dá»¥

```
feat(backend): them endpoint tao entity NGSI-LD

Triá»ƒn khai endpoint POST /ngsi-ld/v1/entities cháº¥p nháº­n
dá»¯ liá»‡u entity tuÃ¢n thá»§ NGSI-LD vÃ  lÆ°u vÃ o PostgreSQL
vÃ  GraphDB.

Closes #123
```

```
fix(web): sua loi hieu nang marker clustering

Sá»­a memory leak trong component marker clustering báº±ng cÃ¡ch
dá»n dáº¹p event listeners Ä‘Ãºng cÃ¡ch khi component unmount.

Fixes #456
```

```
docs(readme): cap nhat huong dan cai dat

ThÃªm cÃ¡c bÆ°á»›c chi tiáº¿t Ä‘á»ƒ thiáº¿t láº­p GraphDB vÃ  lÃ m rÃµ
yÃªu cáº§u extension PostGIS cá»§a PostgreSQL.
```

## Quy trÃ¬nh Pull Request

### TrÆ°á»›c khi submit

1. Äáº£m báº£o code cá»§a báº¡n tuÃ¢n thá»§ chuáº©n code
2. Cháº¡y táº¥t cáº£ tests vÃ  Ä‘áº£m báº£o chÃºng pass
3. Cáº­p nháº­t tÃ i liá»‡u náº¿u cáº§n
4. Cáº­p nháº­t CHANGELOG.md vá»›i thay Ä‘á»•i cá»§a báº¡n
5. Rebase branch cá»§a báº¡n trÃªn upstream main má»›i nháº¥t:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Submit Pull Request

1. Push branch cá»§a báº¡n lÃªn fork:
   ```bash
   git push origin feature/ten-tinh-nang
   ```

2. VÃ o repository gá»‘c trÃªn GitHub
3. Click "New Pull Request"
4. Chá»n fork vÃ  branch cá»§a báº¡n
5. Äiá»n vÃ o PR template vá»›i:
   - MÃ´ táº£ rÃµ rÃ ng vá» thay Ä‘á»•i
   - Sá»‘ issue liÃªn quan
   - Screenshots (náº¿u cÃ³)
   - Kiá»ƒm tra Ä‘Ã£ thá»±c hiá»‡n
   - HoÃ n thÃ nh checklist

### Äá»‹nh dáº¡ng tiÃªu Ä‘á» PR

TuÃ¢n theo Ä‘á»‹nh dáº¡ng giá»‘ng commit messages:
```
feat(backend): them he thong xac thuc nguoi dung
```

### Quy trÃ¬nh review

1. Ãt nháº¥t má»™t maintainer pháº£i review vÃ  approve
2. Táº¥t cáº£ CI checks pháº£i pass
3. KhÃ´ng cÃ³ conflict vá»›i branch main
4. Táº¥t cáº£ review comments pháº£i Ä‘Æ°á»£c giáº£i quyáº¿t

### Sau khi Ä‘Æ°á»£c approve

- Maintainers sáº½ merge PR cá»§a báº¡n
- Branch cá»§a báº¡n sáº½ bá»‹ xÃ³a
- Thay Ä‘á»•i sáº½ Ä‘Æ°á»£c Ä‘Æ°a vÃ o release tiáº¿p theo

## BÃ¡o cÃ¡o lá»—i

### TrÆ°á»›c khi submit bÃ¡o cÃ¡o lá»—i

1. Kiá»ƒm tra cÃ¡c issues hiá»‡n cÃ³
2. Kiá»ƒm tra tÃ i liá»‡u
3. Thá»­ tÃ¡i hiá»‡n vá»›i phiÃªn báº£n má»›i nháº¥t

### CÃ¡ch submit bÃ¡o cÃ¡o lá»—i

Sá»­ dá»¥ng template bÃ¡o cÃ¡o lá»—i vÃ  bao gá»“m:

1. **TiÃªu Ä‘á»**: TiÃªu Ä‘á» rÃµ rÃ ng, mÃ´ táº£
2. **MÃ´ táº£**: MÃ´ táº£ chi tiáº¿t vá» lá»—i
3. **CÃ¡c bÆ°á»›c tÃ¡i hiá»‡n**:
   - BÆ°á»›c 1
   - BÆ°á»›c 2
   - BÆ°á»›c 3
4. **HÃ nh vi mong Ä‘á»£i**: Äiá»u gÃ¬ nÃªn xáº£y ra
5. **HÃ nh vi thá»±c táº¿**: Äiá»u gÃ¬ thá»±c sá»± xáº£y ra
6. **Screenshots**: Náº¿u cÃ³
7. **MÃ´i trÆ°á»ng**:
   - Há»‡ Ä‘iá»u hÃ nh: [vÃ­ dá»¥: Ubuntu 22.04]
   - TrÃ¬nh duyá»‡t: [vÃ­ dá»¥: Chrome 120]
   - PhiÃªn báº£n: [vÃ­ dá»¥: v1.0.0]
8. **ThÃ´ng tin bá»• sung**: Báº¥t ká»³ thÃ´ng tin liÃªn quan nÃ o khÃ¡c

## Äá» xuáº¥t tÃ­nh nÄƒng

### TrÆ°á»›c khi submit Ä‘á» xuáº¥t tÃ­nh nÄƒng

1. Kiá»ƒm tra xem tÃ­nh nÄƒng Ä‘Ã£ tá»“n táº¡i chÆ°a
2. Kiá»ƒm tra cÃ¡c Ä‘á» xuáº¥t tÃ­nh nÄƒng hiá»‡n cÃ³
3. Xem xÃ©t xem nÃ³ cÃ³ phÃ¹ há»£p vá»›i pháº¡m vi dá»± Ã¡n khÃ´ng

### CÃ¡ch submit Ä‘á» xuáº¥t tÃ­nh nÄƒng

Sá»­ dá»¥ng template Ä‘á» xuáº¥t tÃ­nh nÄƒng vÃ  bao gá»“m:

1. **TiÃªu Ä‘á»**: TiÃªu Ä‘á» rÃµ rÃ ng, mÃ´ táº£
2. **Váº¥n Ä‘á»**: TÃ­nh nÄƒng nÃ y giáº£i quyáº¿t váº¥n Ä‘á» gÃ¬?
3. **Giáº£i phÃ¡p Ä‘á» xuáº¥t**: NÃ³ nÃªn hoáº¡t Ä‘á»™ng nhÆ° tháº¿ nÃ o?
4. **PhÆ°Æ¡ng Ã¡n thay tháº¿**: CÃ¡c giáº£i phÃ¡p khÃ¡c báº¡n Ä‘Ã£ xem xÃ©t
5. **Lá»£i Ã­ch**: Táº¡i sao Ä‘iá»u nÃ y cÃ³ giÃ¡ trá»‹?
6. **ThÃ´ng tin bá»• sung**: Mockups, vÃ­ dá»¥, v.v.

## TÃ i liá»‡u

### CÃ¡c loáº¡i tÃ i liá»‡u

- **Code Comments**: Giáº£i thÃ­ch logic phá»©c táº¡p
- **API Documentation**: TÃ i liá»‡u hÃ³a táº¥t cáº£ endpoints
- **HÆ°á»›ng dáº«n ngÆ°á»i dÃ¹ng**: GiÃºp ngÆ°á»i dÃ¹ng hiá»ƒu tÃ­nh nÄƒng
- **HÆ°á»›ng dáº«n developer**: GiÃºp developers Ä‘Ã³ng gÃ³p

### Chuáº©n tÃ i liá»‡u

- Viáº¿t báº±ng tiáº¿ng Viá»‡t rÃµ rÃ ng, Ä‘Æ¡n giáº£n
- Sá»­ dá»¥ng ngá»¯ phÃ¡p vÃ  chÃ­nh táº£ Ä‘Ãºng
- Bao gá»“m vÃ­ dá»¥ code
- Giá»¯ tÃ i liá»‡u cáº­p nháº­t vá»›i thay Ä‘á»•i code
- Sá»­ dá»¥ng Markdown Ä‘á»ƒ format

### Build tÃ i liá»‡u

```bash
# Backend API docs
cd backend
python -m mkdocs build

# Web dashboard docs
cd web-dashboard
npm run docs
```

## Cá»™ng Ä‘á»“ng

### KÃªnh giao tiáº¿p

- **GitHub Issues**: BÃ¡o cÃ¡o lá»—i vÃ  Ä‘á» xuáº¥t tÃ­nh nÄƒng
- **GitHub Discussions**: CÃ¢u há»i vÃ  tháº£o luáº­n chung
- **Pull Requests**: Review code vÃ  cá»™ng tÃ¡c

### Nháº­n trá»£ giÃºp

Náº¿u báº¡n cáº§n trá»£ giÃºp:

1. Kiá»ƒm tra tÃ i liá»‡u
2. TÃ¬m kiáº¿m cÃ¡c issues hiá»‡n cÃ³
3. Há»i trong GitHub Discussions
4. Tag maintainers náº¿u kháº©n cáº¥p

### Ghi nháº­n

Contributors sáº½ Ä‘Æ°á»£c:
- Liá»‡t kÃª trong CONTRIBUTORS.md
- Äá» cáº­p trong release notes
- Ghi cÃ´ng trong project README

## Giáº¥y phÃ©p

Báº±ng viá»‡c Ä‘Ã³ng gÃ³p cho HQC System, báº¡n Ä‘á»“ng Ã½ ráº±ng cÃ¡c Ä‘Ã³ng gÃ³p cá»§a báº¡n sáº½ Ä‘Æ°á»£c cáº¥p phÃ©p dÆ°á»›i GNU General Public License v3.0 (GPL-3.0). Xem file [LICENSE](LICENSE) Ä‘á»ƒ biáº¿t chi tiáº¿t.

## CÃ¢u há»i?

Náº¿u báº¡n cÃ³ cÃ¢u há»i vá» viá»‡c Ä‘Ã³ng gÃ³p, vui lÃ²ng:
1. Kiá»ƒm tra tÃ i liá»‡u nÃ y ká»¹ lÆ°á»¡ng
2. TÃ¬m kiáº¿m cÃ¡c issues vÃ  discussions hiá»‡n cÃ³
3. Táº¡o discussion má»›i náº¿u cáº§n

Cáº£m Æ¡n báº¡n Ä‘Ã£ Ä‘Ã³ng gÃ³p cho HQC System!

