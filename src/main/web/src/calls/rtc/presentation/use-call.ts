"use client";

import { useState, useEffect, useCallback } from "react";
import type { RTCCallState } from "../domain";
import type { ICallManager } from "../domain";
import { formatDuration, INITIAL_CALL_STATE } from "../application";

export interface UseCallOptions {
  getCallManager: () => ICallManager;
  socket?: unknown;
}

export function useCall(options: UseCallOptions) {
  const { getCallManager, socket } = options;
  const manager = getCallManager();

  const [callState, setCallState] = useState<RTCCallState>(INITIAL_CALL_STATE);
  const [localStream, setLocalStream] = useState<unknown>(null);
  const [remoteStream, setRemoteStream] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (manager.setSocket && socket !== undefined) {
      manager.setSocket(socket);
    }
  }, [manager, socket]);

  useEffect(() => {
    const onState = (data: unknown) => setCallState(data as RTCCallState);
    const onLocal = (s: unknown) => setLocalStream(s);
    const onRemote = (s: unknown) => setRemoteStream(s);
    const onEnded = () => {
      setLocalStream(null);
      setRemoteStream(null);
      setError(null);
    };

    manager.on("callStateChanged", onState);
    manager.on("localStream", onLocal);
    manager.on("remoteStream", onRemote);
    manager.on("callEnded", onEnded);

    setCallState(manager.getCallState());
    setLocalStream(manager.getLocalStream() ?? null);
    setRemoteStream(manager.getRemoteStream() ?? null);

    return () => {
      manager.off("callStateChanged", onState);
      manager.off("localStream", onLocal);
      manager.off("remoteStream", onRemote);
      manager.off("callEnded", onEnded);
    };
  }, [manager]);

  const startCall = useCallback(
    async (
      contactId: string,
      contactName: string,
      contactAvatar: string,
      callType: "voice" | "video",
      opts?: { chatId?: string }
    ) => {
      try {
        setError(null);
        await manager.startCall(
          contactId,
          contactName,
          contactAvatar,
          callType,
          opts
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Call failed";
        setError(msg);
      }
    },
    [manager]
  );

  const answerCall = useCallback(async () => {
    try {
      setError(null);
      await manager.answerCall();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Answer failed";
      setError(msg);
    }
  }, [manager]);

  const endCall = useCallback(() => {
    manager.endCall();
    setError(null);
  }, [manager]);

  return {
    callState,
    localStream,
    remoteStream,
    error,
    startCall,
    answerCall,
    endCall,
    toggleMute: () => manager.toggleMute(),
    toggleVideo: () => manager.toggleVideo(),
    toggleSpeaker: () => manager.toggleSpeaker(),
    formatDuration,
  };
}
