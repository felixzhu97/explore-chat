import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

function mapPathToPage(pathname: string): string {
  if (pathname === "/profile" || pathname.startsWith("/profile/"))
    return "profile";
  if (pathname === "/messages") return "messages";
  if (pathname === "/status") return "status";
  if (pathname === "/calls") return "calls";
  if (pathname === "/starred") return "starred";
  if (pathname === "/settings") return "settings";
  if (pathname === "/search") return "search";
  if (pathname === "/reels") return "reels";
  if (pathname === "/explore") return "explore";
  return "chat";
}

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = useMemo(() => mapPathToPage(pathname), [pathname]);

  const navigateToPage = useCallback(
    (page: string) => {
      if (page === "profile") router.push("/profile");
      else if (page === "status") router.push("/status");
      else if (page === "calls") router.push("/calls");
      else if (page === "starred") router.push("/starred");
      else if (page === "settings") router.push("/settings");
      else if (page === "search") router.push("/search");
      else if (page === "reels") router.push("/reels");
      else if (page === "explore") router.push("/explore");
      else router.push("/");
    },
    [router],
  );

  const handleProfileClick = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const handleStatusClick = useCallback(() => {
    router.push("/status");
  }, [router]);

  const handleCallsClick = useCallback(() => {
    router.push("/calls");
  }, [router]);

  const handleStarredClick = useCallback(() => {
    router.push("/starred");
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const handleSearchPageClick = useCallback(() => {
    router.push("/search");
  }, [router]);

  const handleReelsClick = useCallback(() => {
    router.push("/reels");
  }, [router]);

  const handleExploreClick = useCallback(() => {
    router.push("/explore");
  }, [router]);

  const handleBackToChat = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    currentPage,
    navigateToPage,
    handleProfileClick,
    handleReelsClick,
    handleExploreClick,
    handleStatusClick,
    handleCallsClick,
    handleStarredClick,
    handleSettingsClick,
    handleSearchPageClick,
    handleBackToChat,
  };
}
