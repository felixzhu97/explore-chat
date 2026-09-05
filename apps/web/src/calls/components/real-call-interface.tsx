"use client";

import { useRef, useEffect } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { styled } from "@/src/shared/utils/emotion";
import type { RTCCallState } from "@whatschat/im";

interface RealCallInterfaceProps {
  callState: RTCCallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  formatDuration: (seconds: number) => string;
}

const bgDark = "#0B141A";
const bgPanel = "#2A3942";
const textMuted = "#8696A0";

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background-color: ${bgDark};
`;

const TopBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: white;
`;

const TopAvatar = styled(Avatar)`
  height: 2.5rem;
  width: 2.5rem;
`;

const TopFallback = styled(AvatarFallback)`
  font-size: 0.875rem;
  background-color: ${bgPanel};
`;

const TopCenter = styled.div`
  text-align: center;
`;

const TopName = styled.p`
  font-size: 1rem;
  font-weight: 500;
`;

const TopStatus = styled.p`
  font-size: 0.875rem;
  color: ${textMuted};
`;

const MainArea = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
`;

const VideoFull = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${bgDark};
`;

const RemoteVideo = styled.video`
  height: 100%;
  width: 100%;
  object-fit: contain;
`;

const WaitingBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
`;

const WaitingAvatar = styled(Avatar)`
  height: 6rem;
  width: 6rem;
  margin-bottom: 1rem;
  border: 2px solid rgb(255 255 255 / 0.2);
`;

const WaitingFallback = styled(AvatarFallback)`
  font-size: 1.875rem;
  background-color: ${bgPanel};
`;

const WaitingName = styled.p`
  font-size: 1.125rem;
  font-weight: 500;
`;

const WaitingText = styled.p`
  font-size: 0.875rem;
  color: ${textMuted};
`;

const LocalVideoWrap = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
  height: 9rem;
  width: 7rem;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.2);
  background-color: black;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
`;

const LocalVideo = styled.video`
  height: 100%;
  width: 100%;
  object-fit: cover;
  transform: scaleX(-1);
`;

const VideoOffPlaceholder = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
  height: 9rem;
  width: 7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.2);
  background-color: ${bgPanel};
`;

const VideoOffIcon = styled(VideoOff)`
  height: 2.5rem;
  width: 2.5rem;
  color: rgb(255 255 255 / 0.7);
`;

const VoiceAvatarWrap = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const VoiceAvatar = styled(Avatar)`
  height: 8rem;
  width: 8rem;
  border: 2px solid rgb(255 255 255 / 0.2);
`;

const VoiceFallback = styled(AvatarFallback)`
  font-size: 2.25rem;
  background-color: ${bgPanel};
`;

const ControlsBar = styled.div`
  flex-shrink: 0;
  padding: 1.5rem 0 2.5rem;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const ControlBtn = styled(Button)<{ $active?: boolean; $off?: boolean }>`
  height: 3.5rem;
  width: 3.5rem;
  border-radius: 9999px;
  background-color: rgb(255 255 255 / 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgb(255 255 255 / 0.3);
  }

  ${(p) =>
    p.$active &&
    `
    background-color: #25D366;
    &:hover { background-color: #20BD5C; }
  `}
  ${(p) =>
    p.$off &&
    `
    &:hover { background-color: rgb(239 68 68 / 0.8); }
  `}
`;

const EndCallBtn = styled(Button)`
  height: 3.5rem;
  width: 3.5rem;
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

export function RealCallInterface({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  formatDuration,
}: RealCallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getStatusText = () => {
    switch (callState.status) {
      case "calling":
        return "正在呼叫...";
      case "ringing":
        return "响铃中...";
      case "connected":
        return formatDuration(callState.duration);
      case "ended":
        return "通话已结束";
      default:
        return "";
    }
  };

  return (
    <Root>
      <TopBar>
        <TopAvatar>
          <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
          <TopFallback>{callState.contactName[0]}</TopFallback>
        </TopAvatar>
        <TopCenter>
          <TopName>{callState.contactName}</TopName>
          <TopStatus>
            {getStatusText()}
            {callState.callType === "video" && " · 视频通话"}
            {callState.callType === "voice" && " · 语音通话"}
          </TopStatus>
        </TopCenter>
      </TopBar>

      <MainArea>
        {callState.callType === "video" ? (
          <>
            <VideoFull>
              {remoteStream ? (
                <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
              ) : (
                <WaitingBlock>
                  <WaitingAvatar>
                    <AvatarImage
                      src={callState.contactAvatar || "/placeholder.svg"}
                    />
                    <WaitingFallback>
                      {callState.contactName[0]}
                    </WaitingFallback>
                  </WaitingAvatar>
                  <WaitingName>{callState.contactName}</WaitingName>
                  <WaitingText>等待视频连接...</WaitingText>
                </WaitingBlock>
              )}
            </VideoFull>

            {localStream && !callState.isVideoOff && (
              <LocalVideoWrap>
                <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
              </LocalVideoWrap>
            )}

            {callState.isVideoOff && (
              <VideoOffPlaceholder>
                <VideoOffIcon />
              </VideoOffPlaceholder>
            )}
          </>
        ) : (
          <VoiceAvatarWrap>
            <VoiceAvatar>
              <AvatarImage
                src={callState.contactAvatar || "/placeholder.svg"}
              />
              <VoiceFallback>{callState.contactName[0]}</VoiceFallback>
            </VoiceAvatar>
          </VoiceAvatarWrap>
        )}
      </MainArea>

      <ControlsBar>
        <ControlsRow>
          <ControlBtn
            variant="ghost"
            size="icon"
            $off={callState.isMuted}
            onClick={onToggleMute}
          >
            {callState.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </ControlBtn>

          <ControlBtn
            variant="ghost"
            size="icon"
            $active={callState.isSpeakerOn}
            onClick={onToggleSpeaker}
          >
            {callState.isSpeakerOn ? (
              <Volume2 size={24} />
            ) : (
              <VolumeX size={24} />
            )}
          </ControlBtn>

          {callState.callType === "video" && (
            <ControlBtn
              variant="ghost"
              size="icon"
              $off={callState.isVideoOff}
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? (
                <VideoOff size={24} />
              ) : (
                <Video size={24} />
              )}
            </ControlBtn>
          )}

          <EndCallBtn variant="ghost" size="icon" onClick={onEndCall}>
            <PhoneOff size={24} />
          </EndCallBtn>
        </ControlsRow>
      </ControlsBar>
    </Root>
  );
}
