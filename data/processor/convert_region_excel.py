#!/usr/bin/env python3
"""
지역 중심 분석 Excel → JSON 변환기.

사용:
  pip install -r data/processor/requirements.txt
  python data/processor/convert_region_excel.py

기본 입력: data/excel/region/■중요■CARD_최종(260719).xlsx
기본 출력: data/excel/region/region-dashboard.json

JSON carbonRaw·industries 값은 tCO₂eq 단위로 저장합니다 (formatVersion 2).
Excel 산출 컬럼(A~H) 캐시가 비어 있으면 카드×계수×가중치×에너지·철도 입력으로 재계산합니다.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
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
PREFERRED_SOURCE = "■중요■CARD_최종(260719).xlsx"

CARBON_HEADERS = ("탄소배출량 ", "탄소배출량")
INDEX_HEADER = "탄소발자국 지수"
LEGACY_CARBON_SCALE = 1_000_000  # legacy raw → tCO₂eq
FORMULA_C_BLOCK = "C: 에너지보완(mg)\n=B×보정계수"
FORMULA_IDX_KG = 153
FORMULA_IDX_INDEX = 154
MG_TO_TCO2EQ = 1_000_000_000
KG_TO_TCO2EQ = 1_000

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

# 수식 파일에 존재하는 중분류 (여행업 제외)
FORMULA_INDUSTRIES = [name for name in INDUSTRY_COLUMNS if name != "여행업"]

# 신규 수식 파일에 없는 컬럼 — JSON에는 0으로 포함
MISSING_IN_FORMULA = ("여행업",)


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
    preferred = region_dir / PREFERRED_SOURCE
    if preferred.exists():
        return preferred

    files = sorted(region_dir.glob("*.xlsx")) + sorted(region_dir.glob("*.xls"))
    if not files:
        raise FileNotFoundError(f"Excel 파일이 없습니다: {region_dir}")
    return files[0]


def build_composite_headers(header_rows: list[tuple]) -> list[str]:
    r1 = [str(cell).strip() if cell is not None else "" for cell in header_rows[0]]
    r2 = [str(cell).strip() if cell is not None else "" for cell in header_rows[1]]
    composites: list[str] = []
    current = ""
    for group, sub in zip(r1, r2):
        if group:
            current = group
        if sub:
            composites.append(f"{current}||{sub}")
        elif current:
            composites.append(current)
        else:
            composites.append("")
    return composites


def carbon_column_index(headers: list[str]) -> int:
    for name in CARBON_HEADERS:
        if name in headers:
            return headers.index(name)
    for index, header in enumerate(headers):
        if header.strip() == "탄소배출량":
            return index
    raise KeyError("탄소배출량 컬럼을 찾을 수 없습니다.")


def build_region_label(sido: str, sgg: str) -> str:
    if sido == "세종특별자치시":
        return sido
    return f"{sido} {sgg}"


def append_record(
    records: list[dict],
    *,
    sido: str,
    sgg: str,
    year: int,
    month: int,
    carbon_t: float,
    carbon_index: float,
    industries_t: dict[str, float],
) -> None:
    if not sido or not sgg:
        return

    records.append(
        {
            "sidoNm": sido,
            "sggNm": sgg,
            "regionLabel": build_region_label(sido, sgg),
            "year": year,
            "month": month,
            "ym": f"{year}-{month:02d}",
            "carbonRaw": carbon_t,
            "carbonIndex": carbon_index,
            "industries": industries_t,
        }
    )


def convert_legacy_rows(rows: list[tuple]) -> tuple[list[dict], dict]:
    headers = [str(cell).strip() if cell is not None else "" for cell in rows[0]]
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
    for row in rows[1:]:
        if row is None or all(cell is None or str(cell).strip() == "" for cell in row):
            continue

        sido = str(row[col_map["sido_nm"]]).strip()
        sgg = str(row[col_map["sgg_nm"]]).strip()
        year = int(parse_number(row[col_map["year"]]))
        month = int(parse_number(row[col_map["month"]]))

        industries_t = {
            name: parse_number(row[col_map[name]]) / LEGACY_CARBON_SCALE
            for name in INDUSTRY_COLUMNS
        }

        append_record(
            records,
            sido=sido,
            sgg=sgg,
            year=year,
            month=month,
            carbon_t=parse_number(row[carbon_idx]) / LEGACY_CARBON_SCALE,
            carbon_index=parse_number(row[col_map[INDEX_HEADER]]),
            industries_t=industries_t,
        )

    meta_extra = {"format": "legacy", "carbonUnit": "tCO2eq"}
    return records, meta_extra


def find_header_index(composites: list[str], *needles: str) -> int | None:
    for idx, header in enumerate(composites):
        if all(needle in header for needle in needles):
            return idx
    return None


def resolve_formula_input_columns(composites: list[str]) -> dict:
    card_cols: dict[str, int] = {}
    coef_cols: dict[str, int] = {}
    weight_cols: dict[str, int] = {}

    for idx, header in enumerate(composites):
        if "||" not in header:
            continue
        group, sub = header.split("||", 1)
        if sub not in FORMULA_INDUSTRIES:
            continue
        if group.startswith("카드 사용량"):
            card_cols[sub] = idx
        elif group.startswith("탄소배출계수"):
            coef_cols[sub] = idx
        elif group.startswith("중분류 업종별 가중치"):
            weight_cols[sub] = idx

    ewrt_idx = find_header_index(composites, "에너지 조정승수", "보정계수")
    rail_coef_idx = find_header_index(composites, "철도 배출", "철도배출계수")
    rail_pkm_idx = find_header_index(composites, "철도 배출", "철도_인km")

    missing = [
        name
        for name in FORMULA_INDUSTRIES
        if name not in card_cols or name not in coef_cols or name not in weight_cols
    ]
    if missing:
        raise KeyError(f"입력 업종 컬럼 누락: {', '.join(missing)}")
    if ewrt_idx is None or rail_coef_idx is None or rail_pkm_idx is None:
        raise KeyError("에너지/철도 입력 컬럼을 찾을 수 없습니다.")

    return {
        "card": card_cols,
        "coef": coef_cols,
        "weight": weight_cols,
        "ewrt": ewrt_idx,
        "rail_coef": rail_coef_idx,
        "rail_pkm": rail_pkm_idx,
    }


def compute_row_from_inputs(
    row: tuple,
    input_cols: dict,
) -> tuple[dict[str, float], float]:
    """카드×계수×가중치×EWrt + 철도 → (업종별 C mg, 총 kg)."""
    ewrt = parse_number(row[input_cols["ewrt"]])
    industries_mg: dict[str, float] = {}
    card_total_mg = 0.0

    for name in FORMULA_INDUSTRIES:
        card = parse_number(row[input_cols["card"][name]])
        coef = parse_number(row[input_cols["coef"][name]])
        weight = parse_number(row[input_cols["weight"][name]])
        c_mg = card * coef * weight * ewrt
        industries_mg[name] = c_mg
        card_total_mg += c_mg

    rail_mg = parse_number(row[input_cols["rail_coef"]]) * parse_number(
        row[input_cols["rail_pkm"]]
    )
    total_kg = (card_total_mg + rail_mg) / 1_000_000
    return industries_mg, total_kg


def formula_cache_usable(rows: list[tuple], c_cols: dict[str, int]) -> bool:
    """C블록·H(kg) 캐시가 실제 수치로 채워져 있는지 샘플 검사."""
    sample = 0
    filled = 0
    first_c = next(iter(c_cols.values()))
    for row in rows[2:]:
        if row is None or all(cell is None or str(cell).strip() == "" for cell in row):
            continue
        sample += 1
        if row[first_c] is not None or row[FORMULA_IDX_KG] is not None:
            filled += 1
        if sample >= 20:
            break
    return sample > 0 and filled == sample


def convert_formula_rows(rows: list[tuple]) -> tuple[list[dict], dict]:
    if len(rows) < 3:
        raise ValueError("수식 파일은 헤더 2행 + 데이터 행이 필요합니다.")

    composites = build_composite_headers(rows[:2])
    col_map = {name: idx for idx, name in enumerate(composites) if name}

    required = ["sido_nm", "sgg_nm", "year", "month"]
    for col in required:
        if col not in col_map:
            raise KeyError(f"필수 컬럼 누락: {col}")

    c_cols = {
        name: col_map[f"{FORMULA_C_BLOCK}||{name}"]
        for name in FORMULA_INDUSTRIES
        if f"{FORMULA_C_BLOCK}||{name}" in col_map
    }

    missing_in_source = [name for name in FORMULA_INDUSTRIES if name not in c_cols]
    if missing_in_source:
        raise KeyError(f"C블록 업종 컬럼 누락: {', '.join(missing_in_source)}")

    use_cache = formula_cache_usable(rows, c_cols)
    input_cols = None if use_cache else resolve_formula_input_columns(composites)

    # 1차 패스: 업종·총량 수집 (지수는 연도 평균 필요)
    pending: list[dict] = []
    year_totals: dict[int, list[float]] = defaultdict(list)

    for row in rows[2:]:
        if row is None or all(cell is None or str(cell).strip() == "" for cell in row):
            continue

        sido = str(row[col_map["sido_nm"]]).strip()
        sgg = str(row[col_map["sgg_nm"]]).strip()
        year = int(parse_number(row[col_map["year"]]))
        month = int(parse_number(row[col_map["month"]]))

        if use_cache:
            industries_mg = {
                name: parse_number(row[idx]) for name, idx in c_cols.items()
            }
            total_kg = parse_number(row[FORMULA_IDX_KG])
            carbon_index = parse_number(row[FORMULA_IDX_INDEX])
        else:
            assert input_cols is not None
            industries_mg, total_kg = compute_row_from_inputs(row, input_cols)
            carbon_index = None  # 2차 패스에서 연평균 기준 산출

        industries_t = {
            name: industries_mg.get(name, 0.0) / MG_TO_TCO2EQ
            for name in FORMULA_INDUSTRIES
        }
        for name in MISSING_IN_FORMULA:
            industries_t[name] = 0.0

        carbon_t = total_kg / KG_TO_TCO2EQ
        year_totals[year].append(total_kg)

        pending.append(
            {
                "sido": sido,
                "sgg": sgg,
                "year": year,
                "month": month,
                "carbon_t": carbon_t,
                "carbon_index": carbon_index,
                "total_kg": total_kg,
                "industries_t": industries_t,
            }
        )

    year_avg_kg = {
        year: (sum(values) / len(values) if values else 0.0)
        for year, values in year_totals.items()
    }

    records: list[dict] = []
    for item in pending:
        carbon_index = item["carbon_index"]
        if carbon_index is None:
            avg = year_avg_kg.get(item["year"], 0.0)
            carbon_index = (item["total_kg"] / avg * 100.0) if avg > 0 else 0.0

        append_record(
            records,
            sido=item["sido"],
            sgg=item["sgg"],
            year=item["year"],
            month=item["month"],
            carbon_t=item["carbon_t"],
            carbon_index=carbon_index,
            industries_t=item["industries_t"],
        )

    meta_extra = {
        "format": "formula",
        "carbonUnit": "tCO2eq",
        "industryUnit": "tCO2eq",
        "industrySource": "C_energy_adjusted_mg",
        "carbonSource": "H_total_kg",
        "missingIndustryColumns": list(MISSING_IN_FORMULA),
        "formulaCache": "excel" if use_cache else "recomputed_from_inputs",
    }
    return records, meta_extra


def convert_workbook(sheet) -> tuple[list[dict], dict]:
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        raise ValueError("시트가 비어 있습니다.")

    headers = [str(cell).strip() if cell is not None else "" for cell in rows[0]]
    if INDEX_HEADER in headers:
        records, meta_extra = convert_legacy_rows(rows)
    else:
        records, meta_extra = convert_formula_rows(rows)

    if not records:
        raise ValueError("변환된 데이터 행이 없습니다.")

    return records, meta_extra


def main() -> None:
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else find_excel_file(REGION_DIR)
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    if not input_path.exists():
        raise FileNotFoundError(f"입력 파일 없음: {input_path}")

    workbook = openpyxl.load_workbook(input_path, read_only=True, data_only=True)
    sheet = workbook.active
    if sheet is None:
        raise ValueError("활성 시트가 없습니다.")

    rows, meta_extra = convert_workbook(sheet)
    workbook.close()

    payload = {
        "meta": {
            "sourceFile": input_path.name,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "rowCount": len(rows),
            "formatVersion": 2,
            **meta_extra,
        },
        "rows": rows,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"Converted {len(rows)} rows ({meta_extra.get('format', 'unknown')})")
    print(f"Input : {input_path}")
    print(f"Output: {output_path}")


if __name__ == "__main__":
    main()
