import type { ICallManager } from "../domain/call-manager";
import type { RTCCallState } from "../domain/call-manager";
import type { RTCCallConfig, RTCPeerHandle } from "../domain/adapters";
import { ICE_SERVERS, INITIAL_CALL_STATE } from "../application/constants";
import { sessionDescToPlain } from "../application/session-desc";

type Listener = (data: unknown) => void;

export function createCallManager(config: RTCCallConfig): ICallManager {
  const { signaling, media, api, getCurrentUserId } = config;
  let peerConnection: RTCPeerHandle | null = null;
  let localStream: unknown = null;
  let remoteStream: unknown = null;
  const listeners = new Map<string, Listener[]>();
  let callState: RTCCallState = { ...INITIAL_CALL_STATE };
  let durationTimer: ReturnType<typeof setInterval> | null = null;
  let currentCallId: string | null = null;
  let currentInitiatorId: string | null = null;
  const pendingIceCandidates: RTCIceCandidateInit[] = [];

  function emit(event: string, data: unknown) {
    listeners.get(event)?.forEach((cb) => cb(data));
  }

  function updateState(updates: Partial<RTCCallState>) {
    callState = { ...callState, ...updates };
    emit("callStateChanged", callState);
  }

  function targetUserId(): string {
    if (callState.isIncoming && currentInitiatorId) return currentInitiatorId;
    return callState.contactId;
  }

  function startDurationTimer() {
    if (durationTimer) clearInterval(durationTimer);
    durationTimer = setInterval(() => {
      updateState({ duration: callState.duration + 1 });
    }, 1000);
  }

  async function createPeerConnection(): Promise<RTCPeerHandle | null> {
    if (peerConnection) return peerConnection;
    const pc = media.createPeerConnection(ICE_SERVERS);
    peerConnection = pc;
    const callId = currentCallId;
    const target = targetUserId();

    pc.setOnIceCandidate((candidate) => {
      if (candidate && callId) {
        signaling.send("call:ice-candidate", { callId, targetUserId: target, candidate });
      }
    });

    pc.setOnTrack((stream) => {
      remoteStream = stream;
      emit("remoteStream", remoteStream);
    });

    pc.setOnConnectionStateChange((state) => {
      if (state === "connected") {
        updateState({ status: "connected" });
        startDurationTimer();
      } else if (state === "disconnected" || state === "failed") {
        doEndCall();
      }
    });

    return pc;
  }

  async function drainPendingIceCandidates() {
    if (!peerConnection) return;
    for (const c of pendingIceCandidates) {
      try {
        await peerConnection.addIceCandidate(media.fromPlainIceCandidate(c));
      } catch (e) {
        console.warn("[RTC] drainPendingIceCandidates", e);
      }
    }
    pendingIceCandidates.length = 0;
  }

  function doEndCall() {
    if (currentCallId) {
      const me = getCurrentUserId();
      const participants =
        me && currentInitiatorId
          ? callState.isIncoming
            ? [currentInitiatorId, me]
            : [me, callState.contactId]
          : [callState.contactId];
      api.endCall(currentCallId).catch(() => {});
      signaling.send("call:end", { callId: currentCallId, participants });
    }
    resetCall();
  }

  function resetCall() {
    if (durationTimer) {
      clearInterval(durationTimer);
      durationTimer = null;
    }
    if (localStream) {
      media.stopStream(localStream);
      localStream = null;
    }
    if (remoteStream) {
      media.stopStream(remoteStream);
      remoteStream = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    pendingIceCandidates.length = 0;
    currentCallId = null;
    currentInitiatorId = null;
    updateState({ isActive: false, status: "ended", duration: 0 });
    emit("callEnded", null);
  }

  function handleCallIncoming(payload: unknown) {
    const d = (payload as { data?: Record<string, unknown> })?.data ?? (payload as Record<string, unknown>);
    const initiatorId = d.initiatorId as string;
    const callId = d.callId as string;
    const callType = ((d.type as string) || "voice") as "voice" | "video";
    currentCallId = callId;
    currentInitiatorId = initiatorId;
    updateState({
      isActive: true,
      isIncoming: true,
      contactId: initiatorId,
      contactName: (d.callerName as string) ?? "Unknown",
      contactAvatar: (d.callerAvatar as string) ?? "",
      callType,
      status: "ringing",
      isVideoOff: callType === "voice",
    });
    emit("incomingCall", callState);
  }

  async function handleCallAnswer(payload: unknown) {
    const d = (payload as { data?: Record<string, unknown> })?.data ?? (payload as Record<string, unknown>);
    if (d.callId !== currentCallId || !callState.isActive || callState.isIncoming) return;
    try {
      await createPeerConnection();
      if (!peerConnection || !localStream) return;
      const audioTracks = media.getAudioTracks(localStream);
      const videoTracks = media.getVideoTracks(localStream);
      [...audioTracks, ...videoTracks].forEach((t) => peerConnection!.addTrack(t, localStream));
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      const plain = sessionDescToPlain(peerConnection.getLocalDescription(), "offer");
      signaling.send("call:offer", {
        callId: currentCallId,
        targetUserId: callState.contactId,
        offer: plain,
      });
    } catch (err) {
      console.error("[RTC] handleCallAnswer", err);
      doEndCall();
    }
  }

  async function handleCallOffer(payload: unknown) {
    const d = (payload as { data?: Record<string, unknown> })?.data ?? (payload as Record<string, unknown>);
    if (d.callId !== currentCallId || !callState.isIncoming) return;
    const offerInit = sessionDescToPlain(d.offer as Parameters<typeof sessionDescToPlain>[0], "offer");
    if (!offerInit || offerInit.type !== "offer" || typeof offerInit.sdp !== "string" || !offerInit.sdp) return;
    try {
      if (peerConnection) {
        const state = peerConnection.getSignalingState();
        if (state === "have-remote-offer" || state === "have-local-pranswer") return;
        peerConnection.close();
        peerConnection = null;
        pendingIceCandidates.length = 0;
      }
      const peer = await createPeerConnection();
      if (!peer) return;
      if (!localStream) {
        localStream = await media.getUserMedia(callState.callType === "video");
        emit("localStream", localStream);
      }
      const audioTracks = media.getAudioTracks(localStream);
      const videoTracks = media.getVideoTracks(localStream);
      [...audioTracks, ...videoTracks].forEach((t) => peer.addTrack(t, localStream));
      await peer.setRemoteDescription(media.fromPlainSessionDesc(offerInit));
      await drainPendingIceCandidates();
      const state = peer.getSignalingState();
      if (state !== "have-remote-offer" && state !== "have-local-pranswer") return;
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const answerPlain = sessionDescToPlain(peer.getLocalDescription(), "answer");
      signaling.send("call:webrtc-answer", {
        callId: currentCallId,
        targetUserId: (d.userId as string) ?? currentInitiatorId,
        answer: answerPlain,
      });
      updateState({ status: "connected", isIncoming: false });
      startDurationTimer();
    } catch (err) {
      console.error("[RTC] handleCallOffer", err);
      doEndCall();
    }
  }

  async function handleWebRTCAnswer(payload: unknown) {
    const d = (payload as { data?: Record<string, unknown> })?.data ?? (payload as Record<string, unknown>);
    if (d.callId !== currentCallId || !peerConnection || !d.answer) return;
    const answerInit = sessionDescToPlain(d.answer as Parameters<typeof sessionDescToPlain>[0], "answer");
    if (!answerInit) return;
    try {
      await peerConnection.setRemoteDescription(media.fromPlainSessionDesc(answerInit));
      await drainPendingIceCandidates();
      updateState({ status: "connected" });
      startDurationTimer();
    } catch (err) {
      console.error("[RTC] handleWebRTCAnswer", err);
      doEndCall();
    }
  }

  async function handleIceCandidate(payload: unknown) {
    const d = (payload as { data?: Record<string, unknown> })?.data ?? (payload as Record<string, unknown>);
    if (d.callId !== currentCallId || !peerConnection || !d.candidate) return;
    try {
      if (!peerConnection.getRemoteDescription()) {
        pendingIceCandidates.push(d.candidate as RTCIceCandidateInit);
        return;
      }
      await peerConnection.addIceCandidate(media.fromPlainIceCandidate(d.candidate as RTCIceCandidateInit));
    } catch (err) {
      console.error("[RTC] handleIceCandidate", err);
    }
  }

  function setupSignaling() {
    signaling.on("call:incoming", handleCallIncoming);
    signaling.on("call:answer", handleCallAnswer);
    signaling.on("call:offer", handleCallOffer);
    signaling.on("call:webrtc-answer", handleWebRTCAnswer);
    signaling.on("call:ice-candidate", handleIceCandidate);
    signaling.on("call:end", resetCall);
  }

  setupSignaling();

  const manager: ICallManager = {
    setSocket(socket: unknown) {
      if (signaling.setSocket) signaling.setSocket(socket);
    },
    on(event: string, cb: Listener) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event)!.push(cb);
    },
    off(event: string, cb: Listener) {
      const list = listeners.get(event);
      if (list) {
        const i = list.indexOf(cb);
        if (i >= 0) list.splice(i, 1);
      }
    },
    getCallState: () => ({ ...callState }),
    getLocalStream: () => localStream,
    getRemoteStream: () => remoteStream,

    async startCall(
      contactId: string,
      contactName: string,
      contactAvatar: string,
      callType: "voice" | "video",
      options?: { chatId?: string }
    ) {
      try {
        updateState({
          isActive: true,
          isIncoming: false,
          contactId,
          contactName,
          contactAvatar,
          callType,
          status: "calling",
          isVideoOff: callType === "voice",
        });
        const apiType = callType === "video" ? "VIDEO" : "AUDIO";
        const body: { type: string; targetUserId?: string; chatId?: string } = { type: apiType };
        if (options?.chatId) {
          body.chatId = options.chatId;
        } else {
          body.targetUserId = contactId;
        }
        const created = await api.createCall(body);
        const callId = created.callId;
        if (!callId) throw new Error("Failed to create call");
        const myId = getCurrentUserId();
        const targetUserId =
          created.participants?.find((p) => p.userId !== myId)?.userId ?? contactId;
        currentCallId = callId;
        currentInitiatorId = myId;
        updateState({ contactId: targetUserId });
        signaling.send("call:incoming", {
          targetUserId,
          callId,
          type: callType,
          callerName: contactName,
          callerAvatar: contactAvatar,
        });
        localStream = await media.getUserMedia(callType === "video");
        emit("localStream", localStream);
      } catch (err) {
        console.error("[RTC] startCall", err);
        resetCall();
        throw err;
      }
    },

    async answerCall() {
      try {
        if (!callState.isIncoming) throw new Error("No incoming call");
        if (!currentCallId) throw new Error("Call id missing");
        await api.answerCall(currentCallId);
        signaling.send("call:answer", {
          callId: currentCallId,
          initiatorId: currentInitiatorId,
        });
        localStream = await media.getUserMedia(callState.callType === "video");
        emit("localStream", localStream);
        await createPeerConnection();
        if (peerConnection && localStream) {
      const audioTracks = media.getAudioTracks(localStream);
      const videoTracks = media.getVideoTracks(localStream);
      [...audioTracks, ...videoTracks].forEach((t) => peerConnection!.addTrack(t, localStream));
    }
    updateState({ status: "calling", isIncoming: false });
      } catch (err) {
        console.error("[RTC] answerCall", err);
        resetCall();
        throw err;
      }
    },

    endCall: doEndCall,

    toggleMute() {
      const tracks = media.getAudioTracks(localStream);
      if (tracks.length) {
        media.setTrackEnabled(tracks[0], callState.isMuted);
        updateState({ isMuted: !callState.isMuted });
      }
    },

    toggleVideo() {
      if (callState.callType !== "video") return;
      const tracks = media.getVideoTracks(localStream);
      if (tracks.length) {
        media.setTrackEnabled(tracks[0], callState.isVideoOff);
        updateState({ isVideoOff: !callState.isVideoOff });
      }
    },

    toggleSpeaker() {
      updateState({ isSpeakerOn: !callState.isSpeakerOn });
    },
  };

  return manager;
}
