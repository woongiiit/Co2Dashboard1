/** Encode 시군구 for dynamic route segment (supports Korean). */
export function encodeSigunguParam(sigungu: string): string {
  return encodeURIComponent(sigungu);
}

/** Decode 시군구 from dynamic route segment. */
export function decodeSigunguParam(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function regionDetailPath(sigungu: string): string {
  return `/region/${encodeSigunguParam(sigungu)}`;
}
