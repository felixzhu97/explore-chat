/**
 * AIP-193 / google.rpc.Status JSON shape for HTTP error bodies.
 * @see https://google.aip.dev/193
 */
export interface RpcStatus {
  code: string;
  message: string;
  details?: Array<{ "@type"?: string; [key: string]: unknown }>;
}

/**
 * @deprecated Prefer resource bodies and {@link RpcStatus} (AIP-193).
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * @deprecated Prefer AIP-158 page tokens.
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
