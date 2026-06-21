#!/usr/bin/env python3
"""
지역 중심 분석 Excel → JSON 변환기.

사용:
  pip install -r data/processor/requirements.txt
  python data/processor/convert_region_excel.py

기본 입력: data/excel/region/*.xlsx (첫 번째 파일)
기본 출력: data/excel/region/region-dashboard.json
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("openpyxl이 필요합니다: pip install -r data/processor/requirements.txt", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[2]
REGION_DIR = ROOT / "data" / "excel" / "region"
DEFAULT_OUTPUT = REGION_DIR / "region-dashboard.json"

CARBON_HEADERS = ("탄소배출량 ", "탄소배출량")
INDEX_HEADER = "탄소발자국 지수"

INDUSTRY_COLUMNS = [
    "기타관광쇼핑",
    "대형쇼핑몰",
    "레저용품쇼핑",
    "면세점",
    "기타숙박",
    "캠핑장/펜션",
    "콘도",
    "호텔",
    "일반외식업",
    "제과음료업",
    "골프장",
    "관광유원시설",
    "기타레저",
    "문화서비스",
    "스키장",
    "카지노",
    "여행업",
    "렌터카",
    "수상운송",
    "육상운송",
    "항공운송",
    "뷰티",
    "의료관광",
]


def parse_number(value: object) -> float:
    if value is None or value == "":
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).replace(",", "").strip()
    if not text:
        return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def find_excel_file(region_dir: Path) -> Path:
    files = sorted(region_dir.glob("*.xlsx")) + sorted(region_dir.glob("*.xls"))
    if not files:
        raise FileNotFoundError(f"Excel 파일이 없습니다: {region_dir}")
    return files[0]


def carbon_column_index(headers: list[str]) -> int:
    for name in CARBON_HEADERS:
        if name in headers:
            return headers.index(name)
    for index, header in enumerate(headers):
        if header.strip() == "탄소배출량":
            return index
    raise KeyError("탄소배출량 컬럼을 찾을 수 없습니다.")


def convert_workbook(sheet) -> list[dict]:
    rows_iter = sheet.iter_rows(values_only=True)
    header_row = next(rows_iter, None)
    if not header_row:
        raise ValueError("헤더 행이 비어 있습니다.")

    headers = [str(cell).strip() if cell is not None else "" for cell in header_row]
    required = ["sido_nm", "sgg_nm", "year", "month", INDEX_HEADER]
    for col in required:
        if col not in headers:
            raise KeyError(f"필수 컬럼 누락: {col}")

    carbon_idx = carbon_column_index(headers)
    col_map = {name: headers.index(name) for name in headers if name}

    missing_industry = [name for name in INDUSTRY_COLUMNS if name not in col_map]
    if missing_industry:
        raise KeyError(f"업종 컬럼 누락: {', '.join(missing_industry)}")

    records: list[dict] = []
    for row in rows_iter:
        if row is None or all(cell is None or str(cell).strip() == "" for cell in row):
            continue

        sido = str(row[col_map["sido_nm"]]).strip()
        sgg = str(row[col_map["sgg_nm"]]).strip()
        year = int(parse_number(row[col_map["year"]]))
        month = int(parse_number(row[col_map["month"]]))

        if not sido or not sgg:
            continue

        industries = {
            name: parse_number(row[col_map[name]]) for name in INDUSTRY_COLUMNS
        }

        records.append(
            {
                "sidoNm": sido,
                "sggNm": sgg,
                "regionLabel": f"{sido} {sgg}",
                "year": year,
                "month": month,
                "ym": f"{year}-{month:02d}",
                "carbonRaw": parse_number(row[carbon_idx]),
                "carbonIndex": parse_number(row[col_map[INDEX_HEADER]]),
                "industries": industries,
            }
        )

    if not records:
        raise ValueError("변환된 데이터 행이 없습니다.")

    return records


def main() -> None:
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else find_excel_file(REGION_DIR)
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    if not input_path.exists():
        raise FileNotFoundError(f"입력 파일 없음: {input_path}")

    workbook = openpyxl.load_workbook(input_path, read_only=True, data_only=True)
    sheet = workbook.active
    if sheet is None:
        raise ValueError("활성 시트가 없습니다.")

    rows = convert_workbook(sheet)
    workbook.close()

    payload = {
        "meta": {
            "sourceFile": input_path.name,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "rowCount": len(rows),
            "formatVersion": 1,
        },
        "rows": rows,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"Converted {len(rows)} rows")
    print(f"Input : {input_path}")
    print(f"Output: {output_path}")


if __name__ == "__main__":
    main()
