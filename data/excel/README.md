# 엑셀 데이터 디렉터리

대시보드 화면에 표시할 원본 데이터를 이 폴더에 둡니다.  
앱은 **서버(API/Route Handler)** 에서만 이 경로를 읽으며, 브라우저에 직접 노출되지 않습니다.

## 폴더 구조

```
data/excel/
├── region/     # 지역 중심 분석 (/region)
├── industry/   # 업종 중심 분석 (/industry)
└── shared/     # 공통 코드표·매핑·기준정보
```

## 사용 방법

1. **운영 원본**: `region/★최종★탄소발자국_수식_산정(시안용).xlsx`
2. JSON 변환:
   ```bash
   pip install -r data/processor/requirements.txt
   python data/processor/convert_region_excel.py
   python data/processor/validate_region_json.py
   ```
3. 앱은 `region/region-dashboard.json` (formatVersion 2, tCO₂eq)만 읽습니다.
4. 이전 임의데이터 파일은 `region/archive/`에 보관합니다.

### 폴더 구조 (region)

```
data/excel/region/
├── ★최종★탄소발자국_수식_산정(시안용).xlsx   # 운영 원본
├── region-dashboard.json                      # 변환 결과
└── archive/                                   # 구버전 xlsx
```

## 레거시 안내

| formatVersion | carbonRaw 단위 | 원본 |
|---------------|----------------|------|
| 1 | raw (÷1,000,000 → tCO₂eq) | 대시보드_임의데이터_…xlsx |
| 2 | tCO₂eq (그대로 사용) | ★최종★…xlsx |

---

## (구) 사용 방법

1. 분석 유형에 맞는 하위 폴더에 `.xlsx` 또는 `.xls` 파일을 넣습니다.
2. 파일명은 영문·숫자·하이픈·언더스코어를 권장합니다. (예: `region-carbon-monthly.xlsx`)
3. 필터(지역·기간·업종 등) 연동은 이후 단계에서 `lib/excel-data-paths.ts` 경로 상수를 사용해 구현합니다.

## 코드에서 경로 참조

```ts
import {
  EXCEL_DATA_REGION_DIR,
  EXCEL_DATA_INDUSTRY_DIR,
  EXCEL_DATA_SHARED_DIR,
} from "@/lib/excel-data-paths";
```

## Git

- 폴더 구조만 저장하고, 용량이 크거나 민감한 원본은 커밋하지 않을 수 있습니다.
- 필요 시 `.gitignore`에 `data/excel/**/*.xlsx` 등을 추가하세요.
