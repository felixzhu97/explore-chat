import {
  PrimaryDestinations,
  type PrimaryDestination,
} from "@whatschat/shared-types";

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
