"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Clapperboard,
  Send,
  Search,
  Compass,
  Heart,
  SquarePlus,
  Menu,
  Camera,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/presentation/components/ui/avatar";
import {
  PrimaryDestinations,
  type PrimaryDestination,
} from "@whatschat/shared-types";
import type { User } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const NavWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const NavPaddingV = 8;
const NavPaddingH = 12;

const NavRoot = styled.nav`
  position: relative;
  z-index: 11;
  width: 72px;
  min-width: 72px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: ${NavPaddingV}px 0 ${NavPaddingV}px ${NavPaddingH}px;
  background-color: rgb(255 255 255);
  overflow: hidden;
`;

const TopHeight = 56;
const RowHeight = 48;

const LogoWrap = styled.div`
  height: ${TopHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LogoIconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(38 38 38);
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const HoverBg = "rgb(239 239 239)";

const NavItem = styled.li<{ $hovered?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${RowHeight}px;
  min-height: ${RowHeight}px;
  border-radius: ${(p) => (p.$hovered ? "8px 0 0 8px" : "0")};
  cursor: pointer;
  color: rgb(38 38 38);
  font-size: 16px;
  background-color: ${(p) => (p.$hovered ? HoverBg : "transparent")};
`;

const NavIcon = styled.span<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(38 38 38);
  flex-shrink: 0;
`;

const Spacer = styled.div`
  flex: 1;
  min-height: 0;
`;

const NavWidth = 72;
const ExpandedWidth = 238;
const FlyoutWidth = ExpandedWidth - NavWidth;
const FlyoutListOffset = NavWidth + NavPaddingH;

const Flyout = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: ${NavWidth}px;
  top: 0;
  bottom: 0;
  width: ${FlyoutWidth}px;
  padding: ${NavPaddingV}px ${NavPaddingH}px;
  background-color: rgb(255 255 255);
  display: flex;
  flex-direction: column;
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.15s ease;
  z-index: 10;
  box-sizing: border-box;
  overflow: visible;
`;

const FlyoutTop = styled.div`
  height: ${TopHeight}px;
  flex-shrink: 0;
`;

const FlyoutList = styled.ul`
  list-style: none;
  margin: 0 0 0 -${FlyoutListOffset}px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: calc(100% + ${FlyoutListOffset}px);
  box-sizing: border-box;
`;

const FlyoutRow = styled.li<{
  $active?: boolean;
  $hovered?: boolean;
  $visible?: boolean;
  $clickable?: boolean;
}>`
  display: flex;
  align-items: center;
  width: 100%;
  height: ${RowHeight}px;
  min-height: ${RowHeight}px;
  padding: 0 ${NavPaddingH}px 0 ${NavWidth}px;
  border-radius: ${(p) => (p.$hovered ? "0 8px 8px 0" : "0")};
  font-size: 16px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  color: rgb(38 38 38);
  background-color: ${(p) => (p.$hovered ? HoverBg : "transparent")};
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  box-sizing: border-box;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: translateX(${(p) => (p.$visible ? 0 : -12)}px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
`;

const FlyoutBottom = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 0 0 -${FlyoutListOffset}px;
  width: calc(100% + ${FlyoutListOffset}px);
  box-sizing: border-box;
`;

const MetaLogo = styled.div`
  width: 24px;
  height: 24px;
  background-color: rgb(38 38 38);
  border-radius: 4px;
  flex-shrink: 0;
`;

interface InstagramNavProps {
  user: User | null;
  activeTab: PrimaryDestination;
  onHomeClick: () => void;
  onMessagesClick: () => void;
  onProfileClick: () => void;
  onReelsClick?: () => void;
  onExploreClick?: () => void;
  onCreateClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
}

/** Platform-only: Create / Notifications are not Primary Destinations. */
type DestinationTabKey = PrimaryDestination | null;

interface NavEntry {
  id: number;
  label: string;
  tab: DestinationTabKey;
  Icon: LucideIcon;
  onClick?: () => void;
}

export function InstagramNav({
  user,
  activeTab,
  onHomeClick,
  onMessagesClick,
  onProfileClick,
  onReelsClick,
  onExploreClick,
  onCreateClick,
  onSearchClick,
  onNotificationsClick,
}: InstagramNavProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const mainItems: NavEntry[] = [
    {
      id: 0,
      label: t("nav.home"),
      tab: PrimaryDestinations.Feed,
      Icon: Home,
      onClick: onHomeClick,
    },
    {
      id: 1,
      label: t("nav.reels"),
      tab: PrimaryDestinations.Reels,
      Icon: Clapperboard,
      onClick: onReelsClick,
    },
    {
      id: 2,
      label: t("nav.messages"),
      tab: PrimaryDestinations.Chat,
      Icon: Send,
      onClick: onMessagesClick,
    },
    {
      id: 3,
      label: t("nav.search"),
      tab: PrimaryDestinations.Search,
      Icon: Search,
      onClick: onSearchClick,
    },
    {
      id: 4,
      label: t("nav.explore"),
      tab: PrimaryDestinations.Explore,
      Icon: Compass,
      onClick: onExploreClick,
    },
    {
      id: 5,
      label: t("nav.notifications"),
      tab: null,
      Icon: Heart,
      onClick: onNotificationsClick,
    },
    {
      id: 6,
      label: t("nav.create"),
      tab: null,
      Icon: SquarePlus,
      onClick: onCreateClick,
    },
    {
      id: 7,
      label: t("nav.profile"),
      tab: PrimaryDestinations.User,
      Icon: Heart,
      onClick: onProfileClick,
    },
  ];

  const bottomItems: { id: number; label: string }[] = [
    { id: 8, label: t("nav.more") },
    { id: 9, label: t("nav.fromMeta") },
  ];

  const active = (tab: DestinationTabKey) => tab !== null && activeTab === tab;
  const isHovered = (id: number) => hovered === id;

  return (
    <NavWrapper
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setHovered(null);
      }}
    >
      <NavRoot>
        <LogoWrap>
          <LogoIconWrap>
            <Camera size={24} strokeWidth={1.5} fill="none" />
          </LogoIconWrap>
        </LogoWrap>
        <Spacer />
        <NavList>
          {mainItems.map(({ id, label, tab, Icon, onClick }) => (
            <NavItem
              key={id}
              $hovered={isHovered(id)}
              onClick={onClick}
              onMouseEnter={() => setHovered(id)}
            >
              <NavIcon $active={active(tab)}>
                {id === 7 ? (
                  <Avatar style={{ width: 24, height: 24 }}>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {(user?.name ?? t("common.me"))[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon
                    size={24}
                    strokeWidth={active(tab) ? 2.5 : 1.5}
                    fill={active(tab) ? "currentColor" : "none"}
                  />
                )}
              </NavIcon>
            </NavItem>
          ))}
        </NavList>
        <Spacer />
        <NavList>
          <NavItem $hovered={isHovered(8)} onMouseEnter={() => setHovered(8)}>
            <NavIcon>
              <Menu size={24} strokeWidth={1.5} />
            </NavIcon>
          </NavItem>
          <NavItem $hovered={isHovered(9)} onMouseEnter={() => setHovered(9)}>
            <MetaLogo />
          </NavItem>
        </NavList>
      </NavRoot>

      <Flyout $visible={expanded}>
        <FlyoutTop />
        <Spacer />
        <FlyoutList>
          {mainItems.map(({ id, label, tab, onClick }) => (
            <FlyoutRow
              key={id}
              $active={active(tab)}
              $hovered={isHovered(id)}
              $visible={expanded}
              $clickable={!!onClick || (id === 5 && !!onNotificationsClick)}
              onMouseEnter={() => setHovered(id)}
              onClick={onClick}
              role={onClick ? "button" : undefined}
              tabIndex={onClick ? 0 : undefined}
              onKeyDown={
                onClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick();
                      }
                    }
                  : undefined
              }
            >
              {label}
            </FlyoutRow>
          ))}
        </FlyoutList>
        <Spacer />
        <FlyoutBottom>
          {bottomItems.map(({ id, label }) => (
            <FlyoutRow
              key={id}
              $hovered={isHovered(id)}
              $visible={expanded}
              onMouseEnter={() => setHovered(id)}
            >
              {label}
            </FlyoutRow>
          ))}
        </FlyoutBottom>
      </Flyout>
    </NavWrapper>
  );
}
