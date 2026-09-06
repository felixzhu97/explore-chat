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

/** Web path for each Primary Destination (platform-specific). */
export const WebPrimaryDestinationPaths: Record<PrimaryDestination, string> = {
  [PrimaryDestinations.Feed]: "/",
  [PrimaryDestinations.Chat]: "/messages",
  [PrimaryDestinations.Reels]: "/reels",
  [PrimaryDestinations.Explore]: "/explore",
  [PrimaryDestinations.User]: "/profile",
  [PrimaryDestinations.Search]: "/search",
};

export function primaryDestinationFromPathname(
  pathname: string,
): PrimaryDestination {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return PrimaryDestinations.User;
  }
  if (pathname === "/reels") return PrimaryDestinations.Reels;
  if (pathname === "/explore") return PrimaryDestinations.Explore;
  if (pathname === "/search") return PrimaryDestinations.Search;
  if (pathname === "/messages") return PrimaryDestinations.Chat;
  return PrimaryDestinations.Feed;
}
