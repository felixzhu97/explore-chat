/**
 * Canonical primary product destinations (Glossary Preferred Terms).
 * Platform path / tab file names stay in each client.
 */
export const PrimaryDestinations = {
  Feed: "feed",
  Chat: "chat",
  Reels: "reels",
  Explore: "explore",
  User: "user",
  Search: "search",
} as const;

export type PrimaryDestination =
  (typeof PrimaryDestinations)[keyof typeof PrimaryDestinations];
