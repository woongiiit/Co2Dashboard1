# DashBoard1 프로젝트 히스토리

> 관광 탄소발자국(CO₂) 분석 대시보드 — Next.js 15 · React 19 · TypeScript · ECharts · MapLibre GL  
> 최종 갱신: 2026-06-20

**문서 유지**: 주요 기능·데이터·UI 변동은 작업 시마다 본 파일 **§9 변경 이력**에 누적 기록한다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 저장소 | [woongiiit/Co2Dashboard1](https://github.com/woongiiit/Co2Dashboard1) |
| 배포(예정) | Railway |
| 주요 화면 | 커버 · 지역중심분석 · 업종중심분석 · 심화분석 · AI 컨설팅 |
| 데이터 | 엑셀 원본 → JSON 변환 → API 집계 (지역 페이지는 연동 완료) |

---

## 2. 타임라인

### 2026-06 — 프로젝트 착수

- **초기 커밋** (`1638085`): Cursor Agent Skills(`.cursor/skills/`) 및 레포 기본 구조
- **MVP UI 커밋** (`81f14bf`): 관광 탄소발자국 대시보드 1차 UI 구현
  - 커버 페이지, 지역/업종/AI 컨설팅 라우트
  - KPI 카드, 필터 바, 차트·지도·테이블 플레이스홀더
  - MapLibre GL 시군구 지도, ECharts 월별 추세
  - Mock 데이터 기반 프로토타입

### 2026-06 — 심화분석(업종) UI 재구성

- `/industry/deep-analysis` 와이어프레임 기준 레이아웃 구현
  - 필터: 지역 · 업종 · 비교(전년/직전) · 초기화
  - 연도별 KPI 4개, 월별 추세 · 구성비 · 증감률 차트
  - 지표 비교 테이블, AI 한줄 요약, 안내사항
- 후속 수정
  - 사용자 관점 필터 제거
  - 월별 추세 `markPoint` 연도별 겹침 → `symbolOffset` + `grid.top` 조정
  - 안내사항 ↔ AI 한줄 요약 위치 교환
- **데이터**: `lib/deep-analysis-data.ts`, `lib/charts/deep-analysis-chart-options.ts` (Mock)

### 2026-06 — 데이터 경로 및 엑셀 구조 정리

- `data/excel/{region,industry,shared}/` 디렉터리 체계 확립
- `data/excel/README.md` — 용도·경로·Git 정책 문서화
- `lib/excel-data-paths.ts` — 코드에서 참조하는 경로 상수

**지역 원본 엑셀**

- 파일: `data/excel/region/대시보드_임의데이터_확장_탄소발자국지수(260605).xlsx`
- 규모: 약 10,320행 · 31열
- 주요 컬럼: `sido_nm`, `sgg_nm`, `year`, `month`, 23개 중분류, `탄소배출량 `(끝 공백 주의), `탄소발자국 지수`
- 지역 키: `sido_nm + sgg_nm` → `regionLabel` (예: `경기도 부천시 원미구`)

### 2026-06 — 지역중심분석 엑셀/JSON 연동

**배경**: Next.js 서버에서 `xlsx` 런타임 파싱 시 한글 경로·파일 잠금 이슈 → **JSON 전환** 채택

| 구성요소 | 경로 | 역할 |
|----------|------|------|
| Python 변환기 | `data/processor/convert_region_excel.py` | xlsx → JSON |
| 런타임 JSON | `data/excel/region/region-dashboard.json` | API가 읽는 단일 소스 |
| 로더 | `lib/region-excel/load-region-data.ts` | JSON만 로드 |
| 집계 | `lib/region-excel/query-region-dashboard.ts` | KPI·순위·추세·지도·인사이트 |
| API | `GET /api/region/dashboard` | 쿼리: `sido`, `start`, `end`, `compare`, `metric` |
| UI | `components/region/RegionDashboardContent.tsx` | 필터 변경 시 fetch |

**KPI 재정의 (엑셀 기준)**

- 총 관광 탄소발자국, 평균 탄소발자국 지수, 월평균, 상위 20% 시군구 비중, 분석 시군구 수

**단위**

- 원시값 ÷ 1,000,000 → **tCO₂eq** 표시 (`lib/region-excel/constants.ts`)

**재변환 명령**

```bash
pip install -r data/processor/requirements.txt
python data/processor/convert_region_excel.py
```

### 2026-06 — 지도 범례 고정

- 다색 계열 → **파란 단일 5단계** (`lib/sigungu-map.ts`)
- 권장 임계치(tCO₂eq) 고정:
  - 0 ~ 700,000 / 700,000 ~ 2,000,000 / 2,000,000 ~ 4,700,000 / 4,700,000 ~ 8,200,000 / 8,200,000 이상
  - `co2 === 0` → 데이터 없음(회색)
- `RegionCarbonMap.tsx`: 동적 `maxCo2` 제거, 고정 expression 사용

### 2026-06 — 행정구역 개정 레지스트리 및 집계 정책

**레지스트리**: `data/admin-boundary-revisions.json`

| ID | 시행 | 유형 | 요약 |
|----|------|------|------|
| `gunwi-jurisdiction-2023` | 2023-07 | 관할 변경 | 경북 군위군 → 대구 군위군 |
| `bucheon-split-2024` | 2024-01 | 분할 | 부천시 → 원미·소사·오정구 |
| `hwaseong-split-2026` | 2026-02 | 분할 | 화성시 → 만세·효행·병점·동탄구 |
| `incheon-reorg-2026` | 2026-07 | 통합·분할(예정) | 중·동·서구 → 제물포·영종·서해·검단구 |

**집계 정책** (`lib/region-excel/resolve-admin-boundary.ts`)

| 대상 | 정책 | 설명 |
|------|------|------|
| KPI 총량 · 월별 추세 | `point_in_time` | 각 월에 유효한 행정단위만 합산 (이중 집계 방지) |
| 지도 · 순위 · 시군구 수 | `as_of_period_end` | 기간 종료월 시점 경계 기준 |
| 관할 변경(군위) | `stableRegionId` | 전후 데이터를 종료 시점 라벨로 통합·비교 매칭 |
| API | `boundaryWarnings` | 개정·비교 제한 메시지 (전용 페이지 예정) |

---

## 3. 해결한 주요 이슈

| 이슈 | 원인 | 해결 |
|------|------|------|
| Excel `Cannot access file` | 한글 경로·Next 번들 | `fs.readFileSync` + buffer 파싱 → 이후 JSON 전환 |
| 클라이언트에 `fs`/`xlsx` 유입 | 잘못된 import 경계 | JSON 로더 분리, `xlsx` 의존성 제거 |
| 심화분석 8월 markPoint 겹침 | 동일 x좌표 | 연도별 `symbolOffset` |
| 지도 범례 데이터마다 변동 | `maxCo2` 동적 구간 | 고정 임계치 상수 |
| 부천·군위 이중 집계 | 개정 전후 행 혼재 | 월별 유효 단위 필터 |

---

## 4. 현재 데이터·화면 상태

| 화면 | 데이터 | 비고 |
|------|--------|------|
| `/region` | JSON + API | 엑셀 연동 **완료** |
| `/region/[sigungu]` | Mock | JSON 연동 **미착수** |
| `/industry` | Mock | 엑셀 연동 **미착수** |
| `/industry/deep-analysis` | Mock | UI **완료** |
| `/ai-consulting` | 엑셀 + HF | UI·API **완료** |

**탄소 지표 필터** (`total` / `per-capita` / `per-spend`): UI만 존재, 집계는 아직 `total` 고정

---

## 5. 알려진 제약·후속 과제

1. **GeoJSON ↔ 엑셀 명칭 불일치** — KOSTAT GeoJSON `부천시원미구` vs 엑셀 `경기도 부천시 원미구` (code 기반 매칭 필요)
2. **GeoJSON vintage** — `public/data/skorea-municipalities.geojson` 2013 기준; 화성·인천 구 신설 경계 미반영
3. **인천 2026-07 개편** — 레지스트리만 등록, 데이터·경계 파일 대기
4. **split 역사 backfill** — 2023 부천시 단일 → 2024 3구 환산 미구현
5. **업종중심분석** — `region-dashboard.json` 업종 컬럼 집계로 API 연동 완료 (별도 industry xlsx 없음)
6. **지역 상세 페이지** — `/region/[sigungu]` API 연동 완료
7. **행정구역 개정 안내 전용 페이지** — `boundaryWarnings`·레지스트리 UI (지역 대시보드 배너는 제거됨)
8. **Git** — 대부분 작업이 로컬/세션 기준; `81f14bf` 이후 커밋은 아직 반영되지 않았을 수 있음

---

## 6. 주요 디렉터리 맵

```
app/
├── page.tsx                          # 커버
├── region/page.tsx                   # 지역중심분석
├── region/[sigungu]/page.tsx         # 지역 상세
├── industry/page.tsx                 # 업종중심분석
├── industry/deep-analysis/page.tsx   # 심화분석
├── ai-consulting/page.tsx            # AI 컨설팅
└── api/region/dashboard/route.ts     # 지역 대시보드 API

components/
├── region/RegionDashboardContent.tsx
├── map/RegionCarbonMap.tsx
├── industry/deep-analysis/*          # 심화분석 UI
└── dashboard/*                       # 공통 KPI·필터·카드

lib/
├── region-excel/                     # 지역 JSON·집계·행정개정
├── sigungu-map.ts                    # 지도 색상·범례·GeoJSON enrichment
├── deep-analysis-data.ts             # 심화분석 Mock
└── charts/                           # ECharts option builders

data/
├── excel/region/                     # 원본 xlsx + region-dashboard.json
├── admin-boundary-revisions.json     # 행정구역 개정 레지스트리
└── processor/convert_region_excel.py # xlsx → JSON 변환기

docs/
├── history.md                        # 본 문서
└── design/dashboard-wireframe-v1.pdf
```

---

## 7. 로컬 개발

```bash
npm install
npm run dev
# http://localhost:3000
# 지역중심분석: http://localhost:3000/region
```

엑셀 수정 후:

```bash
python data/processor/convert_region_excel.py
```

---

## 8. 참고 대화·작업 맥락

본 히스토리는 MVP 구현 이후 Cursor Agent 세션에서 진행된 작업(심화분석 UI, 지역 엑셀 분석·JSON 전환, 지도 범례, 행정개정 레지스트리 등)을 정리한 문서입니다.  
세부 구현 논의는 에이전트 트랜스크립트 및 `docs/design/` 와이어프레임을 함께 참고하면 됩니다.

---

## 9. 변경 이력 (Changelog)

| 날짜 | 변경 |
|------|------|
| 2026-06-20 | `docs/history.md` 최초 작성 — 프로젝트 타임라인·디렉터리·후속 과제 정리 |
| 2026-06-20 | 지역중심분석 **「행정구역 개정 안내」** 배너 제거 (`RegionDashboardContent.tsx`, `.dashboard-notice` CSS). API `boundaryWarnings`·집계 로직은 유지. 전용 페이지는 후속 |
| 2026-06-20 | 문서 유지 정책: 주요 변동사항을 본 §9에 작업 시마다 추가 |
| 2026-06-20 | 지역 추세 차트 **시군구 개정 연혁** markLine 제거. `buildTrendRevisionMarkers()`는 전용 페이지용으로 `resolve-admin-boundary.ts`에 유지 |
| 2026-06-20 | `/region` ChunkLoadError 대응 — MapLibre·ECharts `dynamic()` lazy 로드, `npm run dev:clean` 권장 |
| 2026-06-20 | `/region` AI 한줄 요약 — Hugging Face Inference API 연동 (`/api/region/insights`, `.env.example`) |
| 2026-06-20 | HF Qwen3.5 빈 응답 — reasoning 토큰 소진·`content` 공란; `enable_thinking:false`, `max_tokens` 1500 |
| 2026-06-20 | `/region/[sigungu]` 지역 상세 — 엑셀 JSON·`/api/region/detail`·업종 구성·비교·월별 추세·지도 연동 |
| 2026-06-20 | 지역 상세 AI 인사이트 — `/api/region/detail/insights` (HF 3섹션: 지역 평가·여행자·지자체), 규칙 기반 fallback |
| 2026-06-20 | `region-dashboard.json` 업종 필드(`industries`) 재생성 — `convert_region_excel.py` |
| 2026-06-21 | `/industry`·`/industry/deep-analysis` — 엑셀(지역 JSON) 업종 컬럼 집계 API·HF 연동 |
| 2026-06-21 | `/api/industry/dashboard`, `/insights`, `/deep-analysis`, `/deep-analysis/insights` 추가 |
| 2026-06-21 | `/ai-consulting` — 지역 JSON 기반 KPI·섹션별 HF 프롬pt·`/api/ai-consulting/dashboard`·`/insights` 연동 |
