"use client";

import { Info, Users, BellOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import type { Contact } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

interface ChatHeaderProps {
  contact: Contact;
  isTyping: boolean;
  isGroup: boolean;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onShowInfo: () => void;
}

const HeaderRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 1rem 1rem 1.25rem;
  border-bottom: 1px solid rgb(219 219 219);
  background-color: rgb(255 255 255);
`;

const CenterBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderAvatar = styled(Avatar)`
  width: 56px;
  height: 56px;
`;

const ContactName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: rgb(38 38 38);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const InfoBtn = styled(Button)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: none;
  color: rgb(38 38 38);
  &:hover {
    background: rgb(239 239 239);
    color: rgb(38 38 38);
  }
`;

export function ChatHeader({
  contact,
  isTyping,
  isGroup,
  onVoiceCall,
  onVideoCall,
  onShowInfo,
}: ChatHeaderProps) {
  return (
    <HeaderRoot>
      <CenterBlock>
        <HeaderAvatar>
          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
          <AvatarFallback>{(contact.name ?? "?")[0]}</AvatarFallback>
        </HeaderAvatar>
        <ContactName>
          {contact.name}
          {contact.isGroup && <Users size={14} color="rgb(142 142 142)" />}
          {contact.muted && <BellOff size={14} color="rgb(142 142 142)" />}
        </ContactName>
      </CenterBlock>
      <InfoBtn
        variant="ghost"
        size="icon"
        onClick={onShowInfo}
        aria-label="Info"
      >
        <Info size={20} />
      </InfoBtn>
    </HeaderRoot>
  );
}
