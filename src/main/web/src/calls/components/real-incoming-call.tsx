"use client";

import { Phone, PhoneOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { styled } from "@/src/shared/utils/emotion";
import type { RTCCallState } from "@whatschat/im";

interface RealIncomingCallProps {
  callState: RTCCallState;
  onAnswer: () => void;
  onDecline: () => void;
}

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0b141a;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
`;

const AvatarWrap = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const AvatarLarge = styled(Avatar)`
  height: 7rem;
  width: 7rem;
  border: 2px solid rgb(255 255 255 / 0.2);
`;

const Fallback = styled(AvatarFallback)`
  font-size: 1.875rem;
  background-color: #2a3942;
`;

const PingRing = styled.div`
  position: absolute;
  inset: -0.25rem;
  border-radius: 9999px;
  border: 2px solid rgb(37 211 102 / 0.4);
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;

  @keyframes ping {
    75%,
    100% {
      transform: scale(1.1);
      opacity: 0;
    }
  }
`;

const Name = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const Status = styled.p`
  color: #8696a0;
  font-size: 0.875rem;
  margin-bottom: 2.5rem;
`;

const BtnRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
`;

const DeclineBtn = styled(Button)`
  height: 4rem;
  width: 4rem;
  border-radius: 9999px;
  background-color: #e53935;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #d32f2f;
  }
`;

const AnswerBtn = styled(Button)`
  height: 4rem;
  width: 4rem;
  border-radius: 9999px;
  background-color: #25d366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  &:hover {
    background-color: #20bd5c;
  }
`;

export function RealIncomingCall({
  callState,
  onAnswer,
  onDecline,
}: RealIncomingCallProps) {
  return (
    <Root>
      <Content>
        <AvatarWrap>
          <AvatarLarge>
            <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
            <Fallback>{callState.contactName[0]}</Fallback>
          </AvatarLarge>
          <PingRing />
        </AvatarWrap>

        <Name>{callState.contactName}</Name>
        <Status>
          {callState.callType === "video" ? "视频通话" : "语音通话"} ·
          正在响铃...
        </Status>

        <BtnRow>
          <DeclineBtn variant="ghost" size="icon" onClick={onDecline}>
            <PhoneOff size={32} />
          </DeclineBtn>
          <AnswerBtn variant="ghost" size="icon" onClick={onAnswer}>
            <Phone size={32} />
          </AnswerBtn>
        </BtnRow>
      </Content>
    </Root>
  );
}
