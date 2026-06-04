import fs from "fs";

const geo = JSON.parse(
  fs.readFileSync("public/data/skorea-municipalities.geojson", "utf8"),
);

const SIDO_NAMES = {
  "11": "서울특별시",
  "21": "부산광역시",
  "22": "대구광역시",
  "23": "인천광역시",
  "24": "광주광역시",
  "25": "대전광역시",
  "26": "울산광역시",
  "29": "세종특별자치시",
  "31": "경기도",
  "32": "강원특별자치도",
  "33": "충청북도",
  "34": "충청남도",
  "35": "전북특별자치도",
  "36": "전라남도",
  "37": "경상북도",
  "38": "경상남도",
  "39": "제주특별자치도",
};

const SIDO_CODES = [
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "29",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
];

const SIDO_OPTIONS = [
  { value: "all", label: "전국" },
  ...SIDO_CODES.map((code) => ({ value: code, label: SIDO_NAMES[code] })),
];

const bySido = {};
for (const f of geo.features) {
  const code = f.properties.code;
  const name = f.properties.name;
  const prefix = code.slice(0, 2);
  const sido = SIDO_NAMES[prefix];
  if (!sido) continue;
  const label = sido === "세종특별자치시" ? sido : `${sido} ${name}`;
  if (!bySido[prefix]) bySido[prefix] = [];
  if (!bySido[prefix].includes(label)) bySido[prefix].push(label);
}
for (const key of Object.keys(bySido)) {
  bySido[key].sort((a, b) => a.localeCompare(b, "ko"));
}

const months = [];
for (let y = 2023; y <= 2026; y += 1) {
  const endM = y === 2026 ? 4 : 12;
  for (let m = 1; m <= endM; m += 1) {
    const mm = String(m).padStart(2, "0");
    months.push({ value: `${y}-${mm}`, label: `${y}.${mm}` });
  }
}

const out = `/** Korean administrative regions for region-page filters. */

export type FilterOption = { value: string; label: string };

export const KOREA_SIDO_OPTIONS: FilterOption[] = ${JSON.stringify(SIDO_OPTIONS, null, 2)};

export const SIGUNGU_LABELS_BY_SIDO_CODE: Record<string, string[]> = ${JSON.stringify(bySido, null, 2)};

export const YEAR_MONTH_OPTIONS: FilterOption[] = ${JSON.stringify(months, null, 2)};

export const DEFAULT_PERIOD_START = "2023-01";
export const DEFAULT_PERIOD_END = "2026-04";

export function getSigunguOptionsForSido(sidoCode: string): FilterOption[] {
  if (sidoCode === "all") {
    return [{ value: "all", label: "전체" }];
  }
  const labels = SIGUNGU_LABELS_BY_SIDO_CODE[sidoCode] ?? [];
  return [
    { value: "all", label: "전체" },
    ...labels.map((label) => ({ value: label, label })),
  ];
}

export function getSidoLabel(sidoCode: string): string | undefined {
  return KOREA_SIDO_OPTIONS.find((option) => option.value === sidoCode)?.label;
}
`;

fs.writeFileSync("lib/korea-admin-regions.ts", out);
console.log("Generated lib/korea-admin-regions.ts");
