/**
 * Search Scope values accepted by Nest `GET /api/v1/search?type=`.
 * Wire values must stay stable across web, mobile, and server.
 */
export const SearchScopes = {
  Posts: "posts",
  Users: "users",
  Hashtags: "hashtags",
} as const;

export type SearchScope = (typeof SearchScopes)[keyof typeof SearchScopes];

/**
 * Client UI scopes including All (fan-out). Never send `all` as Nest `type`.
 */
export const SearchUiScopes = {
  Posts: "posts",
  Users: "users",
  Hashtags: "hashtags",
  All: "all",
} as const;

export type SearchUiScope =
  (typeof SearchUiScopes)[keyof typeof SearchUiScopes];
