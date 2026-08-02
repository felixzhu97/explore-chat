import React from "react";
import { View, Text } from "react-native";
import { styled } from "@/shared/emotion";
import { useCall } from "@/calls/use-call";
import { IncomingCallOverlay } from "./IncomingCallOverlay";
import { ActiveCallOverlay, type StreamLike } from "./ActiveCallOverlay";

const ErrorBar = styled.View`
  position: absolute;
  bottom: 24px;
  left: 16px;
  right: 16px;
  background-color: rgba(255, 59, 48, 0.9);
  padding: 12px;
  border-radius: 8px;
  z-index: 999;
`;

const ErrorText = styled.Text`
  color: #fff;
  text-align: center;
  font-size: 14px;
`;

export function CallOverlay() {
  const {
    callState,
    localStream,
    remoteStream,
    error,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatDuration,
  } = useCall();

  if (callState.status === "ringing") {
    return (
      <IncomingCallOverlay
        callState={callState}
        onAnswer={answerCall}
        onDecline={endCall}
      />
    );
  }

  if (callState.isActive) {
    return (
      <ActiveCallOverlay
        callState={callState}
        localStream={localStream as StreamLike | null}
        remoteStream={remoteStream as StreamLike | null}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleSpeaker={toggleSpeaker}
        formatDuration={formatDuration}
      />
    );
  }

  if (error && !callState.isActive) {
    return (
      <ErrorBar pointerEvents="box-none">
        <ErrorText>{error}</ErrorText>
      </ErrorBar>
    );
  }

  return null;
}
