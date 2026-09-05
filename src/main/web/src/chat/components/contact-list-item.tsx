"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pin,
  PinOff,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import type { Contact } from "@/shared/types";
import { useLongPress } from "@/shared/use-long-press";
import {
  styled,
  instagramListRowColors,
  instagramShadows,
} from "@/src/shared/utils/emotion";

const ContactRow = styled.div<{
  $isSelected?: boolean;
  $showActions?: boolean;
  $isLongPressing?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid rgb(243 244 246);
  position: relative;
  transition: all 0.2s;
  user-select: none;
  background: ${(p) =>
    p.$showActions
      ? instagramListRowColors.active
      : p.$isSelected
        ? instagramListRowColors.selected
        : instagramListRowColors.default};
  box-shadow: ${(p) =>
    p.$showActions ? instagramShadows.listRowActive : "none"};
  transform: ${(p) => (p.$isLongPressing ? "scale(0.95)" : "none")};
  &:hover {
    background: ${(p) =>
      p.$showActions
        ? instagramListRowColors.active
        : p.$isSelected
          ? instagramListRowColors.selected
          : instagramListRowColors.hover};
  }
`;

const PinBadge = styled(Pin)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  height: 0.75rem;
  width: 0.75rem;
  color: #22c55e;
`;

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarSized = styled(Avatar)`
  height: 3rem;
  width: 3rem;
`;

const OnlineDot = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.75rem;
  height: 0.75rem;
  background-color: #22c55e;
  border-radius: 9999px;
  border: 2px solid white;
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Name = styled.h3`
  font-weight: 500;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaIcon = styled(Users)`
  height: 0.75rem;
  width: 0.75rem;
  color: rgb(107 114 128);
`;

const MuteIcon = styled(BellOff)`
  height: 0.75rem;
  width: 0.75rem;
  color: rgb(156 163 175);
`;

const TimeText = styled.span`
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LastMessage = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MutedMeta = styled.span`
  font-size: 0.75rem;
  color: rgb(156 163 175);
`;

const MutedDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background-color: rgb(156 163 175);
  border-radius: 9999px;
`;

const UnreadBadge = styled(Badge)`
  background-color: #22c55e;
  color: white;
  font-size: 0.75rem;
`;

const LongPressHint = styled.div`
  position: absolute;
  top: -2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: black;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  z-index: 20;
`;

const ActionsPanel = styled.div`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: 1px solid hsl(var(--border));
  padding: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 10;
`;

const ActionBtn = styled(Button)`
  height: 1.75rem;
  width: 1.75rem;

  &:hover {
    background-color: rgb(243 244 246);
  }
`;

const DeleteItem = styled(DropdownMenuItem)`
  color: rgb(220 38 38);

  &:focus {
    color: rgb(220 38 38);
  }
`;

const CloseBtn = styled(Button)`
  height: 1.75rem;
  width: 1.75rem;
  margin-left: 0.25rem;
  border-left: 1px solid hsl(var(--border));

  &:hover {
    background-color: rgb(243 244 246);
  }
`;

const MenuIcon = styled(MoreVertical)`
  height: 0.75rem;
  width: 0.75rem;
`;

const PinIcon = styled(Pin)`
  height: 0.75rem;
  width: 0.75rem;
`;

const PinOffIcon = styled(PinOff)`
  height: 0.75rem;
  width: 0.75rem;
  color: #22c55e;
`;

const BellIcon = styled(Bell)`
  height: 0.75rem;
  width: 0.75rem;
  color: #22c55e;
`;

const BellOffIcon = styled(BellOff)`
  height: 0.75rem;
  width: 0.75rem;
`;

const ArchiveIcon = styled(Archive)`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
`;

const TrashIcon = styled(Trash2)`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
`;

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (contact: Contact) => void;
  onAction: (action: string, contact: Contact) => void;
}

export function ContactListItem({
  contact,
  isSelected,
  onSelect,
  onAction,
}: ContactListItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localContact, setLocalContact] = useState(contact);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalContact(contact);
  }, [contact]);

  const longPressEvents = useLongPress({
    onLongPress: () => {
      setShowActions(true);
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    },
    onPress: () => {
      if (!showActions) {
        onSelect(localContact);
      }
    },
    delay: 500,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [showActions]);

  useEffect(() => {
    if (!showMenu) {
      const timeout = setTimeout(() => {
        setShowActions(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [showMenu]);

  const handleQuickAction = (action: string) => {
    if (action === "pin") {
      setLocalContact((prev) => ({ ...prev, pinned: !prev.pinned }));
    } else if (action === "mute") {
      setLocalContact((prev) => ({ ...prev, muted: !prev.muted }));
    }
    onAction(action, localContact);
    setShowActions(false);
  };

  return (
    <ContactRow
      ref={itemRef}
      $isSelected={isSelected}
      $showActions={showActions}
      $isLongPressing={longPressEvents.isLongPressing}
      onMouseDown={longPressEvents.onMouseDown}
      onMouseUp={longPressEvents.onMouseUp}
      onMouseLeave={longPressEvents.onMouseLeave}
      onTouchStart={longPressEvents.onTouchStart}
      onTouchEnd={longPressEvents.onTouchEnd}
    >
      {localContact.pinned && <PinBadge />}

      <AvatarWrap>
        <AvatarSized>
          <AvatarImage src={localContact.avatar || "/placeholder.svg"} />
          <AvatarFallback>{localContact.name[0]}</AvatarFallback>
        </AvatarSized>
        {localContact.isOnline && <OnlineDot />}
      </AvatarWrap>

      <MainContent>
        <TopRow>
          <NameBlock>
            <Name>{localContact.name}</Name>
            {localContact.isGroup && <MetaIcon />}
            {localContact.muted && <MuteIcon />}
          </NameBlock>
          <TimeText>{localContact.timestamp}</TimeText>
        </TopRow>
        <BottomRow>
          <LastMessage>{localContact.lastMessage}</LastMessage>
          <BadgeRow>
            {localContact.isGroup && localContact.memberCount && (
              <MutedMeta>{localContact.memberCount}人</MutedMeta>
            )}
            {(localContact.unreadCount ?? 0) > 0 && localContact.muted ? (
              <MutedDot />
            ) : (localContact.unreadCount ?? 0) > 0 && !localContact.muted ? (
              <UnreadBadge>{localContact.unreadCount}</UnreadBadge>
            ) : null}
          </BadgeRow>
        </BottomRow>
      </MainContent>

      {longPressEvents.isLongPressing && (
        <LongPressHint>松开显示选项</LongPressHint>
      )}

      {showActions && (
        <ActionsPanel>
          <ActionBtn
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAction("pin");
            }}
            title={localContact.pinned ? "取消置顶" : "置顶"}
          >
            {localContact.pinned ? <PinOffIcon /> : <PinIcon />}
          </ActionBtn>

          <ActionBtn
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAction("mute");
            }}
            title={localContact.muted ? "取消静音" : "静音"}
          >
            {localContact.muted ? <BellIcon /> : <BellOffIcon />}
          </ActionBtn>

          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <ActionBtn
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                title="更多选项"
              >
                <MenuIcon />
              </ActionBtn>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleQuickAction("archive")}>
                <ArchiveIcon />
                归档聊天
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteItem onClick={() => handleQuickAction("delete")}>
                <TrashIcon />
                删除聊天
              </DeleteItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CloseBtn
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
            }}
            title="关闭"
          >
            ✕
          </CloseBtn>
        </ActionsPanel>
      )}
    </ContactRow>
  );
}
