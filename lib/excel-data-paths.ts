import path from "path";

/** 프로젝트 루트 기준 엑셀 데이터 루트 (`data/excel/`) */
export const EXCEL_DATA_ROOT = path.join(process.cwd(), "data", "excel");

/** 지역 중심 분석용 엑셀 (`data/excel/region/`) */
export const EXCEL_DATA_REGION_DIR = path.join(EXCEL_DATA_ROOT, "region");

/** 업종 중심 분석용 엑셀 (`data/excel/industry/`) */
export const EXCEL_DATA_INDUSTRY_DIR = path.join(EXCEL_DATA_ROOT, "industry");

/** 공통 참조·코드표 등 (`data/excel/shared/`) */
export const EXCEL_DATA_SHARED_DIR = path.join(EXCEL_DATA_ROOT, "shared");

/** 서버에서 읽을 런타임 JSON (지역) */
export const REGION_DASHBOARD_JSON = "region-dashboard.json";

/** 서버에서 읽을 엑셀 확장자 (컨verter 입력용) */
export const EXCEL_FILE_EXTENSIONS = [".xlsx", ".xls"] as const;
