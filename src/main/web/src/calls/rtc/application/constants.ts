import type { RTCCallState } from "../domain/call-manager";

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const INITIAL_CALL_STATE: RTCCallState = {
  isActive: false,
  isIncoming: false,
  contactId: "",
  contactName: "",
  contactAvatar: "",
  callType: "voice",
  status: "ended",
  duration: 0,
  isMuted: false,
  isVideoOff: false,
  isSpeakerOn: false,
};

export const RTC_EVENTS = {
  INCOMING: "call:incoming",
  ANSWER: "call:answer",
  OFFER: "call:offer",
  WEBRTC_ANSWER: "call:webrtc-answer",
  ICE_CANDIDATE: "call:ice-candidate",
  END: "call:end",
} as const;
