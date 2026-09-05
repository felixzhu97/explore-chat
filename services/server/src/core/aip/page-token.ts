/**
 * Opaque AIP-158 page_token helpers.
 * @see https://google.aip.dev/158
 */

export type PageTokenPayload =
  | { kind: "offset"; offset: number }
  | { kind: "page"; page: number }
  | { kind: "cursor"; cursor: string }
  | { kind: "page_state"; pageState: string };

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function clampPageSize(
  pageSize: number | undefined,
  fallback = DEFAULT_PAGE_SIZE,
): number {
  if (pageSize == null || Number.isNaN(pageSize) || pageSize < 1) {
    return fallback;
  }
  return Math.min(Math.floor(pageSize), MAX_PAGE_SIZE);
}

export function encodePageToken(payload: PageTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodePageToken(
  token: string | undefined | null,
): PageTokenPayload | null {
  if (!token) {
    return null;
  }
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as PageTokenPayload;
    if (!parsed || typeof parsed !== "object" || !("kind" in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Offset pagination: page_token encodes absolute offset. */
export function offsetFromPageToken(
  pageToken: string | undefined,
  pageSize: number,
): number {
  const payload = decodePageToken(pageToken);
  if (payload?.kind === "offset") {
    return Math.max(0, payload.offset);
  }
  if (payload?.kind === "page") {
    return Math.max(0, (payload.page - 1) * pageSize);
  }
  return 0;
}

export function nextOffsetPageToken(
  offset: number,
  pageSize: number,
  hasMore: boolean,
): string | undefined {
  if (!hasMore) {
    return undefined;
  }
  return encodePageToken({ kind: "offset", offset: offset + pageSize });
}

export function nextCursorPageToken(
  cursor: string | undefined | null,
): string | undefined {
  if (!cursor) {
    return undefined;
  }
  return encodePageToken({ kind: "cursor", cursor });
}

export function nextPageStateToken(
  pageState: string | undefined | null,
): string | undefined {
  if (!pageState) {
    return undefined;
  }
  return encodePageToken({ kind: "page_state", pageState });
}

export function cursorFromPageToken(
  pageToken: string | undefined,
): string | undefined {
  const payload = decodePageToken(pageToken);
  return payload?.kind === "cursor" ? payload.cursor : undefined;
}

export function pageStateFromPageToken(
  pageToken: string | undefined,
): string | undefined {
  const payload = decodePageToken(pageToken);
  return payload?.kind === "page_state" ? payload.pageState : undefined;
}
