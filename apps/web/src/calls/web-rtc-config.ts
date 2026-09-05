"use client";

import {
  createCallManager,
  type RTCCallConfig,
  type RTCSignalingAdapter,
  type RTCMediaAdapter,
  type RTCPeerHandle,
  type RTCApiAdapter,
  type WebSocketMessage,
} from "@whatschat/im";
import { getWebSocketManager } from "@/chat/websocket";
import { API_CONFIG } from "@/auth/api.config";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    null
  );
}

function getCurrentUserId(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || "{}"));
    return payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const res = await fetch(`${API_CONFIG.baseURL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json().catch(() => ({}));
}

function createSignalingAdapter(): RTCSignalingAdapter {
  const ws = getWebSocketManager();
  return {
    on(event, handler) {
      ws.on(event, (...args: unknown[]) => {
        const raw = args[0];
        const payload =
          raw != null && typeof raw === "object" && "data" in raw
            ? ((raw as { data?: unknown }).data ?? raw)
            : raw;
        handler(payload);
      });
    },
    off() {},
    send(event, payload) {
      ws.send({
        type: event as WebSocketMessage["type"],
        data: payload as Record<string, unknown>,
      });
    },
  };
}

function createMediaAdapter(): RTCMediaAdapter {
  return {
    createPeerConnection(iceServers) {
      const pc = new RTCPeerConnection({ iceServers });
      return {
        addTrack(t: unknown, s: unknown) {
          (pc as RTCPeerConnection).addTrack(
            t as MediaStreamTrack,
            s as MediaStream,
          );
        },
        createOffer: () => pc.createOffer(),
        createAnswer: () => pc.createAnswer(),
        setLocalDescription: (d) => pc.setLocalDescription(d),
        setRemoteDescription: (d) =>
          pc.setRemoteDescription(d as RTCSessionDescriptionInit),
        addIceCandidate: (c) => pc.addIceCandidate(c as RTCIceCandidateInit),
        close: () => pc.close(),
        getLocalDescription: () => pc.localDescription,
        getRemoteDescription: () => pc.remoteDescription,
        getSignalingState: () => pc.signalingState,
        setOnIceCandidate(fn) {
          pc.onicecandidate = (e) => fn(e.candidate ?? null);
        },
        setOnTrack(fn) {
          pc.ontrack = (e) => {
            const s =
              e.streams?.[0] ??
              (() => {
                const stream = new MediaStream();
                if (e.track) stream.addTrack(e.track);
                return stream;
              })();
            if (s.getTracks().length) fn(s);
          };
        },
        setOnConnectionStateChange(fn) {
          pc.onconnectionstatechange = () => fn(pc.connectionState);
        },
      } as RTCPeerHandle;
    },
    getUserMedia(video) {
      return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: 640, height: 480 } : false,
      });
    },
    fromPlainSessionDesc(init) {
      return new RTCSessionDescription(init);
    },
    fromPlainIceCandidate(c) {
      return new RTCIceCandidate(c);
    },
    stopStream(stream) {
      (stream as MediaStream).getTracks().forEach((t) => t.stop());
    },
    getAudioTracks(s) {
      return (s as MediaStream).getAudioTracks();
    },
    getVideoTracks(s) {
      return (s as MediaStream).getVideoTracks();
    },
    setTrackEnabled(track, enabled) {
      (track as MediaStreamTrack).enabled = enabled;
    },
  };
}

function createApiAdapter(): RTCApiAdapter {
  return {
    async createCall(body) {
      const res = await apiFetch("/calls", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = res?.data;
      if (!data?.id) throw new Error("Failed to create call");
      return { callId: data.id, participants: data.participants };
    },
    answerCall(callId) {
      return apiFetch(`/calls/${callId}/answer`, { method: "PUT" });
    },
    endCall(callId) {
      return apiFetch(`/calls/${callId}/end`, { method: "PUT" });
    },
  };
}

export function createWebRTCConfig(): RTCCallConfig {
  return {
    signaling: createSignalingAdapter(),
    media: createMediaAdapter(),
    api: createApiAdapter(),
    getCurrentUserId,
  };
}

let webRtcManager: ReturnType<typeof createCallManager> | null = null;

export function getWebRTCManager() {
  if (!webRtcManager) {
    webRtcManager = createCallManager(createWebRTCConfig());
  }
  return webRtcManager;
}
