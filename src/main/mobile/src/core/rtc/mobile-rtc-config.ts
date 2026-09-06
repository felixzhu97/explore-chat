import {
  createCallManager,
  type RTCCallConfig,
  type RTCSignalingAdapter,
  type RTCMediaAdapter,
  type RTCPeerHandle,
  type RTCApiAdapter,
} from "@/core/rtc";
import type { Socket } from "socket.io-client";
import { apiClient } from "@/core/api-client";
import { store } from "@/core/store/hooks";

type WebRTCModule = {
  RTCPeerConnection: typeof import("react-native-webrtc").RTCPeerConnection;
  RTCSessionDescription: typeof import("react-native-webrtc").RTCSessionDescription;
  RTCIceCandidate: typeof import("react-native-webrtc").RTCIceCandidate;
  mediaDevices: typeof import("react-native-webrtc").mediaDevices;
};

let webrtc: WebRTCModule | null = null;

function getWebRTC(): WebRTCModule {
  if (!webrtc) {
    const m = require("react-native-webrtc") as WebRTCModule & {
      default?: WebRTCModule["RTCPeerConnection"];
    };
    webrtc = {
      RTCPeerConnection: m.default ?? m.RTCPeerConnection,
      RTCSessionDescription: m.RTCSessionDescription,
      RTCIceCandidate: m.RTCIceCandidate,
      mediaDevices: m.mediaDevices,
    };
  }
  return webrtc;
}

function getCurrentUserId(): string | null {
  const user = store.getState().auth.user;
  return user?.id ?? null;
}

function createSignalingAdapter(socket: Socket | null): RTCSignalingAdapter {
  const handlers = new Map<string, ((p: unknown) => void)[]>();
  let currentSocket: Socket | null = socket;

  function bindSocket(s: Socket | null) {
    if (currentSocket === s) return;
    if (currentSocket) {
      currentSocket.off("call:incoming");
      currentSocket.off("call:answer");
      currentSocket.off("call:offer");
      currentSocket.off("call:webrtc-answer");
      currentSocket.off("call:ice-candidate");
      currentSocket.off("call:end");
    }
    currentSocket = s;
    if (s) {
      s.on("call:incoming", (d) =>
        handlers.get("call:incoming")?.forEach((h) => h(d)),
      );
      s.on("call:answer", (d) =>
        handlers.get("call:answer")?.forEach((h) => h(d)),
      );
      s.on("call:offer", (d) =>
        handlers.get("call:offer")?.forEach((h) => h(d)),
      );
      s.on("call:webrtc-answer", (d) =>
        handlers.get("call:webrtc-answer")?.forEach((h) => h(d)),
      );
      s.on("call:ice-candidate", (d) =>
        handlers.get("call:ice-candidate")?.forEach((h) => h(d)),
      );
      s.on("call:end", () => handlers.get("call:end")?.forEach((h) => h(null)));
    }
  }

  bindSocket(socket);

  return {
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event)!.push(handler);
    },
    off(event, handler) {
      const list = handlers.get(event);
      if (list) {
        const i = list.indexOf(handler);
        if (i >= 0) list.splice(i, 1);
      }
    },
    send(event, payload) {
      currentSocket?.emit(event, payload);
    },
    setSocket(s: unknown) {
      bindSocket(s as Socket | null);
    },
  };
}

function createMediaAdapter(): RTCMediaAdapter {
  return {
    createPeerConnection(iceServers) {
      const RTCPC = getWebRTC().RTCPeerConnection as any;
      const pc = new RTCPC({ iceServers });
      return {
        addTrack(t: unknown, s: unknown) {
          pc.addTrack(t, s);
        },
        createOffer: () => pc.createOffer(),
        createAnswer: () => pc.createAnswer(),
        setLocalDescription: (d) => pc.setLocalDescription(d),
        setRemoteDescription: (d) =>
          pc.setRemoteDescription(
            new (getWebRTC().RTCSessionDescription as any)(d),
          ),
        addIceCandidate: (c) =>
          pc.addIceCandidate(new (getWebRTC().RTCIceCandidate as any)(c)),
        close: () => pc.close(),
        getLocalDescription: () => pc.localDescription,
        getRemoteDescription: () => pc.remoteDescription,
        getSignalingState: () => pc.signalingState,
        setOnIceCandidate(fn) {
          pc.onicecandidate = (e: { candidate: RTCIceCandidateInit | null }) =>
            fn(e.candidate);
        },
        setOnTrack(fn) {
          pc.ontrack = (e: { streams?: unknown[] }) => {
            const s = e.streams?.[0];
            if (s) fn(s);
          };
        },
        setOnConnectionStateChange(fn) {
          pc.onconnectionstatechange = () =>
            fn(pc.connectionState ?? pc._connectionState);
        },
      } as RTCPeerHandle;
    },
    getUserMedia(video) {
      return getWebRTC().mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: 640, height: 480 } : false,
      });
    },
    fromPlainSessionDesc(init) {
      return new (getWebRTC().RTCSessionDescription as any)(init);
    },
    fromPlainIceCandidate(c) {
      return new (getWebRTC().RTCIceCandidate as any)(c);
    },
    stopStream(stream) {
      (stream as { getTracks: () => { stop: () => void }[] })
        .getTracks()
        .forEach((t) => t.stop());
    },
    getAudioTracks(s) {
      return (s as { getAudioTracks: () => unknown[] }).getAudioTracks();
    },
    getVideoTracks(s) {
      return (s as { getVideoTracks: () => unknown[] }).getVideoTracks();
    },
    setTrackEnabled(track, enabled) {
      (track as { enabled: boolean }).enabled = enabled;
    },
  };
}

function createApiAdapter(): RTCApiAdapter {
  return {
    async createCall(body) {
      const res = await apiClient.post<{
        id: string;
        participants?: unknown[];
      }>("/calls", body);
      const data = res.data;
      if (!data?.id) throw new Error("Failed to create call");
      return { callId: data.id };
    },
    answerCall(callId) {
      return apiClient.post(`/calls/${callId}:answer`);
    },
    async endCall(callId) {
      await apiClient.post(`/calls/${callId}:end`).catch(() => {});
    },
  };
}

export function createMobileRTCConfig(socket: Socket | null): RTCCallConfig {
  return {
    signaling: createSignalingAdapter(socket),
    media: createMediaAdapter(),
    api: createApiAdapter(),
    getCurrentUserId,
  };
}
