#!/usr/bin/env python3
"""region-dashboard.json QA — 변환 후 실행."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "data" / "excel" / "region" / "region-dashboard.json"

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

EXPECTED_ROWS = 10_320
EXPECTED_REGIONS = 258
YM_MIN = (2023, 1)
YM_MAX = (2026, 4)


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    if not JSON_PATH.exists():
        fail(f"JSON 없음: {JSON_PATH}")

    payload = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    meta = payload.get("meta", {})
    rows = payload.get("rows", [])

    if meta.get("formatVersion") != 2:
        fail(f"formatVersion 기대=2, 실제={meta.get('formatVersion')}")

    if meta.get("carbonUnit") != "tCO2eq":
        fail(f"carbonUnit 기대=tCO2eq, 실제={meta.get('carbonUnit')}")

    if len(rows) != EXPECTED_ROWS:
        fail(f"rowCount 기대={EXPECTED_ROWS}, 실제={len(rows)}")

    regions = {(r["sidoNm"], r["sggNm"]) for r in rows}
    if len(regions) != EXPECTED_REGIONS:
        fail(f"regionCount 기대={EXPECTED_REGIONS}, 실제={len(regions)}")

    yms = {(r["year"], r["month"]) for r in rows}
    if min(yms) != YM_MIN or max(yms) != YM_MAX:
        fail(f"ym 범위 기대={YM_MIN}~{YM_MAX}, 실제={min(yms)}~{max(yms)}")

    carbon_values = [r["carbonRaw"] for r in rows if r["carbonRaw"] > 0]
    if not carbon_values:
        fail("carbonRaw 양수 값 없음")

    if max(carbon_values) > 5_000_000:
        fail(f"carbonRaw 최대값 비정상: {max(carbon_values)}")

    if min(carbon_values) < 0:
        fail("carbonRaw 음수 존재")

    for index, row in enumerate(rows[:50]):
        for name in INDUSTRY_COLUMNS:
            if name not in row.get("industries", {}):
                fail(f"행 {index + 1} industries.{name} 누락")

    jeju = next(
        (
            r
            for r in rows
            if r["sidoNm"] == "제주특별자치도"
            and r["sggNm"] == "제주시"
            and r["year"] == 2024
            and r["month"] == 7
        ),
        None,
    )
    if not jeju:
        fail("제주시 2024-07 샘플 행 없음")

    if jeju["carbonRaw"] < 10_000 or jeju["carbonRaw"] > 2_000_000:
        fail(f"제주시 2024-07 carbonRaw 범위 이상: {jeju['carbonRaw']}")

    ind_sum = sum(jeju["industries"].get(n, 0) for n in INDUSTRY_COLUMNS if n != "여행업")
    if abs(ind_sum - jeju["carbonRaw"]) / jeju["carbonRaw"] > 0.2:
        fail(
            f"제주시 2024-07 업종합≈총량 불일치: sum={ind_sum}, total={jeju['carbonRaw']}"
        )

    if jeju["industries"].get("여행업") != 0:
        fail("여행업은 신규 원본에 없어 0이어야 함")

    print("PASS: region-dashboard.json QA")
    print(f"  source : {meta.get('sourceFile')}")
    print(f"  rows   : {len(rows)}")
    print(f"  regions: {len(regions)}")
    print(f"  jeju 2024-07 carbonRaw: {jeju['carbonRaw']:.2f} tCO2eq")


if __name__ == "__main__":
    main()
