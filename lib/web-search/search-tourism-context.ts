import type { TourismWebSearchResult, TourismWebSnippet } from "@/lib/web-search/types";

const SEARCH_TIMEOUT_MS = 8_000;
const MAX_SNIPPETS = 8;
const MAX_PLACE_NAMES = 12;

const PLACE_NOISE = new Set([
  "총생산",
  "1차산",
  "저산성",
  "인구",
  "면적",
  "특별시",
  "광역시",
  "자치시",
  "선거구",
  "고등학교",
  "중학교",
  "초등학교",
  "접근성",
  "역사테마공원",
]);

function withTimeout(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function regionKeywords(regionLabel: string): string[] {
  const parts = regionLabel.replace(/\s+/g, " ").trim().split(" ");
  const last = parts[parts.length - 1] ?? regionLabel;
  const base = last.replace(
    /(특별자치시|특별자치도|광역시|특별시|자치시|자치군|시|군|구)$/u,
    "",
  );
  return [...new Set([regionLabel, last, base].filter((item) => item.length >= 2))];
}

function mentionsRegion(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractPlaceLikeTokens(text: string, regionLabel: string): string[] {
  const names = new Set<string>();
  const keywords = regionKeywords(regionLabel);
  const regionToken = keywords[keywords.length - 1] ?? regionLabel;

  const pattern =
    /([가-힣A-Za-z0-9]{2,16}(?:산|호수|호|강|섬|공원|시장|마을|성|사|궁|타워|거리|온천|폭포|동굴|박물관|미술관|해수욕장|리조트|테마파크|식물원|수목원|유적|향교|민속촌|아울렛|타운|광장|전망대|휴양림|계곡|폭포|아일랜드|랜드|타운))/g;

  for (const match of text.matchAll(pattern)) {
    const name = match[1];
    if (!name) continue;
    if (name === regionToken || name === regionLabel) continue;
    if (PLACE_NOISE.has(name)) continue;
    if (/^\d/u.test(name)) continue;
    if (name === "자연휴양림" || name === "휴양림") continue;
    if (name.endsWith("시") || name.endsWith("군") || name.endsWith("구")) continue;
    if (name.length < 2) continue;
    names.add(name);
  }

  return [...names];
}

async function searchWikipedia(
  regionLabel: string,
): Promise<TourismWebSnippet[]> {
  const keywords = regionKeywords(regionLabel);
  const shortName = keywords[keywords.length - 1] ?? regionLabel;
  const queries = [
    `${shortName} 관광명소`,
    `${shortName} 관광지`,
    `${regionLabel} 관광`,
    `${shortName} 가볼만한곳`,
  ];
  const snippets: TourismWebSnippet[] = [];

  for (const query of queries) {
    try {
      const searchUrl = new URL("https://ko.wikipedia.org/w/api.php");
      searchUrl.searchParams.set("action", "query");
      searchUrl.searchParams.set("list", "search");
      searchUrl.searchParams.set("srsearch", query);
      searchUrl.searchParams.set("srlimit", "6");
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("utf8", "1");

      const response = await fetch(searchUrl, {
        signal: withTimeout(SEARCH_TIMEOUT_MS),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) continue;

      const payload = (await response.json()) as {
        query?: { search?: Array<{ title: string; snippet: string }> };
      };

      for (const hit of payload.query?.search ?? []) {
        const title = cleanText(hit.title);
        const snippet = cleanText(
          hit.snippet.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"'),
        );
        if (!title || !snippet) continue;

        const municipalName =
          keywords.find((item) => /(시|군|구)$/u.test(item) && !item.includes(" ")) ??
          shortName;

        // 다른 시·군·구 문서 제외 (포천시 ≠ 양주시)
        if (
          /(특별자치시|광역시|특별시|시|군|구)$/u.test(title) &&
          title !== municipalName &&
          !title.startsWith(`${municipalName}`)
        ) {
          continue;
        }

        if (!mentionsRegion(`${title} ${snippet}`, [municipalName, shortName])) {
          continue;
        }
        // 행정·선거·학교 문서 제외
        if (/(선거구|고등학교|중학교|초등학교)$/u.test(title)) continue;
        snippets.push({
          title,
          snippet,
          url: `https://ko.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          source: "wikipedia",
        });
      }
    } catch {
      // ignore provider errors — other sources may still work
    }
  }

  // 시군구 본문 요약 (시·군·구 단위 표제어 우선)
  try {
    const pageTitle =
      keywords.find((item) => /(시|군|구)$/u.test(item) && !item.includes(" ")) ??
      shortName;
    const summaryUrl = `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const response = await fetch(summaryUrl, {
      signal: withTimeout(SEARCH_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const payload = (await response.json()) as {
        title?: string;
        extract?: string;
        content_urls?: { desktop?: { page?: string } };
      };
      if (payload.extract) {
        snippets.unshift({
          title: cleanText(payload.title ?? pageTitle),
          snippet: cleanText(payload.extract).slice(0, 400),
          url: payload.content_urls?.desktop?.page,
          source: "wikipedia",
        });
      }
    }
  } catch {
    // optional
  }

  return snippets;
}

async function searchTavily(regionLabel: string): Promise<TourismWebSnippet[]> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return [];

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: withTimeout(SEARCH_TIMEOUT_MS),
      body: JSON.stringify({
        api_key: apiKey,
        query: `${regionLabel} 관광명소 대표 관광지 코스`,
        search_depth: "basic",
        include_answer: false,
        max_results: 5,
        country: "south korea",
      }),
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as {
      results?: Array<{ title?: string; content?: string; url?: string }>;
    };

    return (payload.results ?? [])
      .map((item) => ({
        title: cleanText(item.title ?? ""),
        snippet: cleanText(item.content ?? "").slice(0, 280),
        url: item.url,
        source: "tavily" as const,
      }))
      .filter((item) => item.title && item.snippet);
  } catch {
    return [];
  }
}

async function searchSerper(regionLabel: string): Promise<TourismWebSnippet[]> {
  const apiKey = process.env.SERPER_API_KEY?.trim();
  if (!apiKey) return [];

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      signal: withTimeout(SEARCH_TIMEOUT_MS),
      body: JSON.stringify({
        q: `${regionLabel} 관광명소 대표 관광지`,
        gl: "kr",
        hl: "ko",
        num: 5,
      }),
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as {
      organic?: Array<{ title?: string; snippet?: string; link?: string }>;
    };

    return (payload.organic ?? [])
      .map((item) => ({
        title: cleanText(item.title ?? ""),
        snippet: cleanText(item.snippet ?? "").slice(0, 280),
        url: item.link,
        source: "serper" as const,
      }))
      .filter((item) => item.title && item.snippet);
  } catch {
    return [];
  }
}

function dedupeSnippets(items: TourismWebSnippet[]): TourismWebSnippet[] {
  const seen = new Set<string>();
  const result: TourismWebSnippet[] = [];
  for (const item of items) {
    const key = `${item.title}::${item.snippet.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= MAX_SNIPPETS) break;
  }
  return result;
}

/**
 * 시군구 관광 맥락용 웹 검색.
 * - 기본: 한국어 위키백과 (키 불필요)
 * - 선택: TAVILY_API_KEY / SERPER_API_KEY
 */
export async function searchTourismWebContext(
  regionLabel: string,
): Promise<TourismWebSearchResult> {
  const label = regionLabel.trim();
  const queries = [
    `${label} 관광명소`,
    `${label} 대표 관광지 코스`,
    `${label} 관광`,
  ];

  if (!label) {
    return { regionLabel: label, queries, snippets: [], placeNames: [] };
  }

  const settled = await Promise.allSettled([
    searchWikipedia(label),
    searchTavily(label),
    searchSerper(label),
  ]);

  const collected: TourismWebSnippet[] = [];
  const warnings: string[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      collected.push(...result.value);
    } else {
      warnings.push("일부 검색 소스 실패");
    }
  }

  const snippets = dedupeSnippets(collected);
  const placeNames = [
    ...new Set(
      snippets.flatMap((item) =>
        extractPlaceLikeTokens(`${item.title} ${item.snippet}`, label),
      ),
    ),
  ].slice(0, MAX_PLACE_NAMES);

  const hasPaidKey = Boolean(
    process.env.TAVILY_API_KEY?.trim() || process.env.SERPER_API_KEY?.trim(),
  );

  return {
    regionLabel: label,
    queries,
    snippets,
    placeNames,
    warning:
      snippets.length === 0
        ? "웹 검색 결과가 없어 엑셀 데이터만으로 생성합니다."
        : !hasPaidKey && snippets.every((s) => s.source === "wikipedia")
          ? "위키백과 기반 검색만 사용 중입니다. TAVILY_API_KEY 또는 SERPER_API_KEY를 설정하면 웹 검색이 보강됩니다."
          : warnings[0],
  };
}

export function formatTourismWebSearchForPrompt(
  result: TourismWebSearchResult | null | undefined,
): string {
  if (!result || result.snippets.length === 0) {
    return `## 웹 검색 관광 맥락
- 검색 결과 없음. 지명은 모델 일반 지식에만 의존하지 말고, 엑셀 업종·동선 힌트 중심으로 작성하세요.`;
  }

  const snippetLines = result.snippets
    .map(
      (item, index) =>
        `${index + 1}. [${item.source}] ${item.title}: ${item.snippet}${item.url ? ` (${item.url})` : ""}`,
    )
    .join("\n");

  const places =
    result.placeNames.length > 0
      ? result.placeNames.map((name) => `- ${name}`).join("\n")
      : "- (고유명사 후보 추출 없음 — 스니펫 제목·본문의 실제 지명만 사용)";

  return `## 웹 검색 관광 맥락 (참고용 — 배출 수치 아님)
검색 쿼리: ${result.queries.join(" / ")}
${result.warning ? `참고: ${result.warning}` : ""}

### 검색 스니펫
${snippetLines}

### 사용 가능 지명 후보 (가능하면 이 목록·스니펫에 나온 이름만 사용)
${places}

규칙:
- 배출량·비율·순위 등 **수치는 엑셀만** 사용하세요.
- 관광명소·코스·체험 이름은 **위 스니펫/지명 후보에 나온 것만** 우선 사용하세요.
- 목록에 없는 유명 지명을 새로 만들어 넣지 마세요.`;
}
