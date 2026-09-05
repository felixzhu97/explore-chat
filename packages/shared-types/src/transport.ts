/**
 * AIP-193 / google.rpc.Status JSON shape for HTTP error bodies.
 * @see https://google.aip.dev/193
 * @see https://cloud.google.com/apis/design/errors
 */
export type RpcCode =
  | "OK"
  | "CANCELLED"
  | "UNKNOWN"
  | "INVALID_ARGUMENT"
  | "DEADLINE_EXCEEDED"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "PERMISSION_DENIED"
  | "RESOURCE_EXHAUSTED"
  | "FAILED_PRECONDITION"
  | "ABORTED"
  | "OUT_OF_RANGE"
  | "UNIMPLEMENTED"
  | "INTERNAL"
  | "UNAVAILABLE"
  | "DATA_LOSS"
  | "UNAUTHENTICATED";

export interface RpcStatusDetail {
  /** Fully-qualified type URL or short type name, e.g. BadRequest */
  "@type"?: string;
  [key: string]: unknown;
}

export interface RpcStatus {
  code: RpcCode;
  message: string;
  details?: RpcStatusDetail[];
}

/**
 * AIP-158 list request query parameters.
 * @see https://google.aip.dev/158
 */
export interface ListQuery {
  page_size?: number;
  page_token?: string;
}

/**
 * AIP-158 list response envelope fields (resource collection key is plural).
 * @see https://google.aip.dev/158
 * @see https://google.aip.dev/132
 */
export interface ListResponseMeta {
  next_page_token?: string;
}

export type ListResponse<TResource extends string, TItem> = {
  [K in TResource]: TItem[];
} & ListResponseMeta;

/**
 * @deprecated Prefer resource bodies and {@link RpcStatus} (AIP-193).
 * Legacy `{ success, data }` envelope removed in AIP REST cutover.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * @deprecated Prefer {@link ListQuery} / {@link ListResponse} (AIP-158).
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
