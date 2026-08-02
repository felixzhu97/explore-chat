"use client";

import { useState, useRef, useCallback } from "react";

export interface CallState {
  isActive: boolean;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended";
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: "voice" | "video";
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  isMinimized: boolean;
  beautyMode: boolean;
  currentFilter: string;
}

export function useCall() {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    status: "idle",
    contactId: "",
    contactName: "",
    contactAvatar: "",
    callType: "voice",
    duration: 0,
    isMuted: false,
    isVideoOff: false,
    isSpeakerOn: false,
    isRecording: false,
    isScreenSharing: false,
    isMinimized: false,
    beautyMode: false,
    currentFilter: "none",
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const startCall = useCallback(
    (
      contactId: string,
      contactName: string,
      contactAvatar: string,
      callType: "voice" | "video",
    ) => {
      setCallState({
        isActive: true,
        status: "connecting",
        contactId,
        contactName,
        contactAvatar,
        callType,
        duration: 0,
        isMuted: false,
        isVideoOff: callType === "voice",
        isSpeakerOn: false,
        isRecording: false,
        isScreenSharing: false,
        isMinimized: false,
        beautyMode: false,
        currentFilter: "none",
      });

      // Simulate getting user media
      navigator.mediaDevices
        .getUserMedia({
          video: callType === "video",
          audio: true,
        })
        .then((stream) => {
          setLocalStream(stream);
          setCallState((prev) => ({ ...prev, status: "connected" }));

          // Start duration timer
          durationInterval.current = setInterval(() => {
            setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
          }, 1000);
        })
        .catch((error) => {
          console.error("Failed to get user media:", error);
          setCallState((prev) => ({ ...prev, status: "ended" }));
        });
    },
    [],
  );

  const answerCall = useCallback(() => {
    setCallState((prev) => ({ ...prev, status: "connected" }));

    // Start duration timer
    durationInterval.current = setInterval(() => {
      setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  }, []);

  const endCall = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    setCallState({
      isActive: false,
      status: "idle",
      contactId: "",
      contactName: "",
      contactAvatar: "",
      callType: "voice",
      duration: 0,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: false,
      isRecording: false,
      isScreenSharing: false,
      isMinimized: false,
      beautyMode: false,
      currentFilter: "none",
    });

    setScreenShareError(null);
  }, [localStream, remoteStream]);

  const toggleMute = useCallback(() => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = callState.isMuted;
      });
    }
  }, [localStream, callState.isMuted]);

  const toggleVideo = useCallback(() => {
    setCallState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }));
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = callState.isVideoOff;
      });
    }
  }, [localStream, callState.isVideoOff]);

  const toggleSpeaker = useCallback(() => {
    setCallState((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  }, []);

  const switchCamera = useCallback(() => {
    // Implementation for switching camera
    console.log("Switching camera");
  }, []);

  const switchVideoLayout = useCallback(() => {
    // Implementation for switching video layout
    console.log("Switching video layout");
  }, []);

  const toggleBeautyMode = useCallback(() => {
    setCallState((prev) => ({ ...prev, beautyMode: !prev.beautyMode }));
  }, []);

  const applyFilter = useCallback((filter: string) => {
    setCallState((prev) => ({ ...prev, currentFilter: filter }));
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      setScreenShareError(null);

      // Check if screen sharing is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen sharing is not supported in this browser");
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setCallState((prev) => ({ ...prev, isScreenSharing: true }));

      // Handle screen share end
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenShare();
      });
    } catch (error: any) {
      console.error("Screen sharing failed:", error);

      let errorMessage = "屏幕共享失败";

      if (error.name === "NotAllowedError") {
        errorMessage = "屏幕共享被拒绝，请允许屏幕共享权限";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "您的浏览器不支持屏幕共享功能";
      } else if (error.message.includes("display-capture")) {
        errorMessage = "当前环境不支持屏幕共享功能";
      } else if (error.name === "AbortError") {
        errorMessage = "屏幕共享已取消";
      }

      setScreenShareError(errorMessage);

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setScreenShareError(null);
      }, 5000);
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    setCallState((prev) => ({ ...prev, isScreenSharing: false }));
    setScreenShareError(null);
  }, []);

  const startRecording = useCallback(() => {
    setCallState((prev) => ({ ...prev, isRecording: true }));
  }, []);

  const stopRecording = useCallback(() => {
    setCallState((prev) => ({ ...prev, isRecording: false }));
  }, []);

  const minimizeCall = useCallback(() => {
    setCallState((prev) => ({ ...prev, isMinimized: true }));
  }, []);

  const maximizeCall = useCallback(() => {
    setCallState((prev) => ({ ...prev, isMinimized: false }));
  }, []);

  const showControls = useCallback(() => {
    // Implementation for showing call controls
    console.log("Showing call controls");
  }, []);

  const simulateIncomingCall = useCallback(
    (
      contactId: string,
      contactName: string,
      contactAvatar: string,
      callType: "voice" | "video",
    ) => {
      setCallState({
        isActive: true,
        status: "ringing",
        contactId,
        contactName,
        contactAvatar,
        callType,
        duration: 0,
        isMuted: false,
        isVideoOff: callType === "voice",
        isSpeakerOn: false,
        isRecording: false,
        isScreenSharing: false,
        isMinimized: false,
        beautyMode: false,
        currentFilter: "none",
      });
    },
    [],
  );

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const isScreenShareSupported = useCallback((): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }, []);

  const clearScreenShareError = useCallback(() => {
    setScreenShareError(null);
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    screenShareError,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    switchVideoLayout,
    toggleBeautyMode,
    applyFilter,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    minimizeCall,
    maximizeCall,
    showControls,
    simulateIncomingCall,
    formatDuration,
    isScreenShareSupported,
    clearScreenShareError,
  };
}
