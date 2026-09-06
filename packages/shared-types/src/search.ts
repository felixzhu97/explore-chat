/**
 * Search Scope values for GET /api/v1/search?type=.
 * Wire values must stay stable across web, mobile, and server.
 */
export const SearchScopes = {
  Posts: "posts",
  Users: "users",
  Hashtags: "hashtags",
} as const;

export type SearchScope = (typeof SearchScopes)[keyof typeof SearchScopes];
