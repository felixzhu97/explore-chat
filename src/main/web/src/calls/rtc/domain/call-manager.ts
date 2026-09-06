export interface RTCCallState {
  isActive: boolean;
  isIncoming: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: "voice" | "video";
  status: "calling" | "ringing" | "connected" | "ended";
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
}

export interface StartCallOptions {
  chatId?: string;
}

export interface ICallManager {
  setSocket?(socket: unknown): void;
  on(event: string, cb: (data: unknown) => void): void;
  off(event: string, cb: (data: unknown) => void): void;
  getCallState(): RTCCallState;
  getLocalStream(): unknown;
  getRemoteStream(): unknown;
  startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video",
    options?: StartCallOptions
  ): Promise<void>;
  answerCall(): Promise<void>;
  endCall(): void;
  toggleMute(): void;
  toggleVideo(): void;
  toggleSpeaker(): void;
}
