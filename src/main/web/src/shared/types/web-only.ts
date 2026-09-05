import type { CallType } from "@whatschat/shared-types";

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  url?: string;
  error?: string;
}

export interface CallState {
  isActive: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: CallType;
  status: "idle" | "connecting" | "ringing" | "connected" | "ended";
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isMinimized: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  participants?: CallParticipant[];
  effects?: {
    beautyMode: boolean;
    filter: string | null;
    virtualBackground: string | null;
  };
}

export interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isHost: boolean;
  joinedAt: number;
  stream?: MediaStream;
}
