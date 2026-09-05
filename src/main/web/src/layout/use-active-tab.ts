import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  PrimaryDestinations,
  type PrimaryDestination,
} from "@chat/shared-types";
import { primaryDestinationFromPathname } from "./primary-destination-routes";

export type { PrimaryDestination };

export function useActiveTab(searchDrawerOpen: boolean): PrimaryDestination {
  const pathname = usePathname();

  return useMemo(() => {
    if (searchDrawerOpen) return PrimaryDestinations.Search;
    return primaryDestinationFromPathname(pathname);
  }, [pathname, searchDrawerOpen]);
}
