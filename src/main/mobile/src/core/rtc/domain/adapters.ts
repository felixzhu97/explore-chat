export interface RTCSignalingAdapter {
  on(event: string, handler: (payload: unknown) => void): void;
  off(event: string, handler: (payload: unknown) => void): void;
  send(event: string, payload: unknown): void;
  setSocket?(socket: unknown): void;
}

export interface RTCMediaAdapter {
  createPeerConnection(iceServers: RTCIceServer[]): RTCPeerHandle;
  getUserMedia(video: boolean): Promise<unknown>;
  fromPlainSessionDesc(init: RTCSessionDescriptionInit): unknown;
  fromPlainIceCandidate(candidate: RTCIceCandidateInit): unknown;
  stopStream(stream: unknown): void;
  getAudioTracks(stream: unknown): unknown[];
  getVideoTracks(stream: unknown): unknown[];
  setTrackEnabled(track: unknown, enabled: boolean): void;
}


export interface RTCPeerHandle {
  addTrack(track: unknown, stream: unknown): void;
  createOffer(): Promise<RTCSessionDescriptionInit>;
  createAnswer(): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(desc: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(desc: unknown): Promise<void>;
  addIceCandidate(candidate: unknown): Promise<void>;
  close(): void;
  getLocalDescription(): RTCSessionDescriptionInit | null;
  getRemoteDescription(): unknown;
  getSignalingState(): string;
  setOnIceCandidate(fn: (candidate: RTCIceCandidateInit | null) => void): void;
  setOnTrack(fn: (stream: unknown) => void): void;
  setOnConnectionStateChange(fn: (state: string) => void): void;
}

export interface RTCApiAdapter {
  createCall(body: {
    type: string;
    targetUserId?: string;
    chatId?: string;
  }): Promise<{ callId: string; participants?: { userId: string }[] }>;
  answerCall(callId: string): Promise<void>;
  endCall(callId: string): Promise<void>;
}

export interface RTCCallConfig {
  signaling: RTCSignalingAdapter;
  media: RTCMediaAdapter;
  api: RTCApiAdapter;
  getCurrentUserId: () => string | null;
}
