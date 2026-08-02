import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "@/shared/emotion";
import type { CallState } from "@/core/call/callManagerLoader";

interface IncomingCallOverlayProps {
  callState: CallState;
  onAnswer: () => void;
  onDecline: () => void;
}

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  justify-content: center;
  align-items: center;
  background-color: #0b141a;
`;

const Content = styled.View`
  align-items: center;
`;

const Avatar = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const Name = styled.Text`
  font-size: 20px;
  font-weight: 500;
  color: #e9edef;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #8696a0;
  margin-bottom: 48px;
`;

const Buttons = styled.View`
  flex-direction: row;
  gap: 48px;
`;

const Btn = styled.TouchableOpacity<{ isDecline?: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  justify-content: center;
  align-items: center;
  background-color: ${(p) =>
    p.isDecline ? p.theme.colors.iosRed : p.theme.colors.primaryGreen};
`;

export function IncomingCallOverlay({
  callState,
  onAnswer,
  onDecline,
}: IncomingCallOverlayProps) {
  return (
    <Overlay>
      <Content>
        <Avatar>
          <Ionicons name="person" size={64} color="#8696A0" />
        </Avatar>
        <Name>{callState.contactName}</Name>
        <Subtitle>
          {callState.callType === "video" ? "视频通话" : "语音通话"} ·
          正在响铃...
        </Subtitle>
        <Buttons>
          <Btn isDecline onPress={onDecline} activeOpacity={0.8}>
            <Ionicons name="close-circle" size={32} color="#fff" />
          </Btn>
          <Btn onPress={onAnswer} activeOpacity={0.8}>
            <Ionicons name="call" size={32} color="#fff" />
          </Btn>
        </Buttons>
      </Content>
    </Overlay>
  );
}
