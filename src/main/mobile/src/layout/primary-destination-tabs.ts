import {
  PrimaryDestinations,
  type PrimaryDestination,
} from "@chat/shared-types";

/**
 * Expo Router tab file names for each Primary Destination (platform-specific).
 * Do not rename `(tabs)/*.tsx` without updating this map.
 */
export const MobilePrimaryDestinationTabs = {
  [PrimaryDestinations.Feed]: "status",
  [PrimaryDestinations.Chat]: "chats",
  [PrimaryDestinations.Reels]: "reels",
  [PrimaryDestinations.Explore]: "explore",
  [PrimaryDestinations.User]: "profile",
} as const satisfies Partial<Record<PrimaryDestination, string>>;

export type MobilePrimaryDestinationTab =
  (typeof MobilePrimaryDestinationTabs)[keyof typeof MobilePrimaryDestinationTabs];
