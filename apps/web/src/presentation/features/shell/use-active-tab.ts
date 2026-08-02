import { useMemo } from "react";
import { usePathname } from "next/navigation";

export type NavTab =
  | "home"
  | "messages"
  | "reels"
  | "explore"
  | "profile"
  | "search";

export function useActiveTab(searchDrawerOpen: boolean): NavTab {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname === "/profile" || pathname.startsWith("/profile/")) {
      return "profile";
    }
    if (pathname === "/reels") return "reels";
    if (pathname === "/explore") return "explore";
    if (searchDrawerOpen || pathname === "/search") return "search";
    if (pathname === "/messages") return "messages";
    return "home";
  }, [pathname, searchDrawerOpen]);
}
