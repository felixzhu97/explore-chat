import type { ICallManager } from "../domain/call-manager";
import type { RTCCallState } from "../domain/call-manager";
import { INITIAL_CALL_STATE } from "../application/constants";

type Listener = (data: unknown) => void;

const DEFAULT_EXPO_GO_MESSAGE =
  "Calls require a development build. Expo Go does not support WebRTC.";

export class CallManagerStub implements ICallManager {
  private listeners = new Map<string, Listener[]>();
  private callState: RTCCallState = { ...INITIAL_CALL_STATE };

  setSocket(_socket: unknown) {}

  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Listener) {
    const list = this.listeners.get(event);
    if (list) {
      const i = list.indexOf(cb);
      if (i >= 0) list.splice(i, 1);
    }
  }

  getCallState(): RTCCallState {
    return { ...this.callState };
  }

  getLocalStream(): null {
    return null;
  }

  getRemoteStream(): null {
    return null;
  }

  async startCall() {
    throw new Error(DEFAULT_EXPO_GO_MESSAGE);
  }

  async answerCall() {
    throw new Error("Calls require a development build.");
  }

  endCall() {}

  toggleMute() {}
  toggleVideo() {}
  toggleSpeaker() {}
}

let stubInstance: CallManagerStub | null = null;

export function getCallManagerStub(): CallManagerStub {
  if (!stubInstance) stubInstance = new CallManagerStub();
  return stubInstance;
}
