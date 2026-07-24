export type TourismWebSnippet = {
  title: string;
  snippet: string;
  url?: string;
  source: "wikipedia" | "tavily" | "serper";
};

export type TourismWebSearchResult = {
  regionLabel: string;
  queries: string[];
  snippets: TourismWebSnippet[];
  placeNames: string[];
  warning?: string;
};
