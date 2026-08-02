import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import type { CallState } from "@/core/call/callManagerLoader";

export interface StreamLike {
  toURL(): string;
}

let RTCViewComponent: React.ComponentType<{
  streamURL: string;
  style: unknown;
  objectFit?: string;
}> | null = null;
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  try {
    RTCViewComponent = require("react-native-webrtc").RTCView;
  } catch {}
}

interface ActiveCallOverlayProps {
  callState: CallState;
  localStream: StreamLike | null;
  remoteStream: StreamLike | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  formatDuration: (seconds: number) => string;
}

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: #0b141a;
`;

const TopBar = styled.View`
  padding-top: 56px;
  padding-bottom: 12px;
  padding-horizontal: 16px;
  align-items: center;
`;

const TopName = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: #e9edef;
`;

const TopStatus = styled.Text`
  font-size: 14px;
  color: #8696a0;
  margin-top: 4px;
`;

const RemoteContainer = styled.View`
  flex: 1;
`;

const RemoteVideo = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const Placeholder = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const PlaceholderName = styled.Text`
  font-size: 20px;
  font-weight: 500;
  margin-top: 16px;
  color: #e9edef;
`;

const PlaceholderStatus = styled.Text`
  font-size: 15px;
  color: #8696a0;
  margin-top: 8px;
`;

const LocalContainer = styled.View`
  position: absolute;
  top: 100px;
  right: 16px;
  width: 112px;
  height: 144px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #000;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
`;

const LocalVideo = styled.View`
  width: 100%;
  height: 100%;
`;

const LocalPlaceholder = styled.View`
  position: absolute;
  top: 100px;
  right: 16px;
  width: 112px;
  height: 144px;
  border-radius: 12px;
  background-color: #2a3942;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
`;

const Controls = styled.View`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: center;
  gap: 24px;
`;

const ControlBtn = styled.TouchableOpacity`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
`;

const ControlBtnOff = styled(ControlBtn)`
  background-color: rgba(255, 255, 255, 0.15);
`;

const ControlBtnEnd = styled(ControlBtn)`
  background-color: #e53935;
`;

export function ActiveCallOverlay({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  formatDuration,
}: ActiveCallOverlayProps) {
  const { colors } = useTheme();
  const statusText =
    callState.status === "calling"
      ? "正在呼叫..."
      : callState.status === "connected"
        ? formatDuration(callState.duration)
        : "连接中...";

  const RemoteRTC = RTCViewComponent;
  const LocalRTC = RTCViewComponent;

  return (
    <Overlay>
      <TopBar>
        <TopName numberOfLines={1}>{callState.contactName}</TopName>
        <TopStatus>
          {statusText}
          {callState.callType === "video" ? " · 视频通话" : " · 语音通话"}
        </TopStatus>
      </TopBar>

      <RemoteContainer>
        {remoteStream && RemoteRTC ? (
          <RemoteRTC
            streamURL={remoteStream.toURL()}
            style={{ flex: 1, width: "100%", height: "100%" }}
            objectFit="contain"
          />
        ) : (
          <Placeholder>
            <Ionicons name="person" size={80} color="#8696A0" />
            <PlaceholderName>{callState.contactName}</PlaceholderName>
            <PlaceholderStatus>等待视频连接...</PlaceholderStatus>
          </Placeholder>
        )}
      </RemoteContainer>

      {callState.callType === "video" &&
        localStream &&
        LocalRTC &&
        !callState.isVideoOff && (
          <LocalContainer>
            <LocalRTC
              streamURL={localStream.toURL()}
              style={{ width: "100%", height: "100%" }}
              objectFit="cover"
            />
          </LocalContainer>
        )}

      {callState.callType === "video" &&
        (callState.isVideoOff || !localStream) && (
          <LocalPlaceholder>
            <Ionicons
              name="videocam-off"
              size={32}
              color="rgba(255,255,255,0.7)"
            />
          </LocalPlaceholder>
        )}

      <Controls>
        {callState.isMuted ? (
          <ControlBtnOff onPress={onToggleMute}>
            <Ionicons name="mic-off" size={26} color="#fff" />
          </ControlBtnOff>
        ) : (
          <ControlBtn onPress={onToggleMute}>
            <Ionicons name="mic" size={26} color="#fff" />
          </ControlBtn>
        )}
        {callState.callType === "video" &&
          (callState.isVideoOff ? (
            <ControlBtnOff onPress={onToggleVideo}>
              <Ionicons name="videocam-off" size={26} color="#fff" />
            </ControlBtnOff>
          ) : (
            <ControlBtn onPress={onToggleVideo}>
              <Ionicons name="videocam" size={26} color="#fff" />
            </ControlBtn>
          ))}
        <ControlBtn
          onPress={onToggleSpeaker}
          style={
            callState.isSpeakerOn
              ? { backgroundColor: colors.primaryGreen }
              : undefined
          }
        >
          <Ionicons
            name={callState.isSpeakerOn ? "volume-high" : "volume-medium"}
            size={26}
            color="#fff"
          />
        </ControlBtn>
        <ControlBtnEnd onPress={onEndCall}>
          <Ionicons name="close" size={26} color="#fff" />
        </ControlBtnEnd>
      </Controls>
    </Overlay>
  );
}
