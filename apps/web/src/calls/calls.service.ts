import {
  type Call,
  answerCall,
  endCallRecord,
  mapCall,
  markCallMissed,
} from "./call.model";
import { store } from "@/core/store/store";
import {
  addCall,
  updateCall,
  setActiveCall,
  setIncomingCall,
  setActiveCallNull,
  setIncomingCallNull,
} from "@/core/store/slices/callsSlice";

export class CallsService {
  private getState() {
    return store.getState().calls;
  }

  async startCall(contactId: string, type: "voice" | "video"): Promise<Call> {
    const call = mapCall({
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contactId,
      contactName: `联系人${contactId}`,
      contactAvatar: `/placeholder.svg?height=40&width=40&text=${contactId}`,
      type,
      status: "outgoing",
      startTime: new Date().toISOString(),
    });

    store.dispatch(addCall(call));
    store.dispatch(setActiveCall(call));

    return call;
  }

  endCall(callId: string, duration: number): void {
    const state = this.getState();
    const call = state.calls.find((c) => c.id === callId);
    if (call) {
      const endedCall = endCallRecord(call, new Date().toISOString(), duration);
      store.dispatch(updateCall({ callId, call: endedCall }));
      store.dispatch(setActiveCallNull());
    }
  }

  answerCall(callId: string): void {
    const state = this.getState();
    const call = state.calls.find((c) => c.id === callId);
    if (call) {
      const answeredCall = answerCall(call);
      store.dispatch(updateCall({ callId, call: answeredCall }));
      store.dispatch(setActiveCall(answeredCall));
      store.dispatch(setIncomingCallNull());
    }
  }

  declineCall(callId: string): void {
    const state = this.getState();
    const call = state.calls.find((c) => c.id === callId);
    if (call) {
      const missedCall = markCallMissed(call);
      store.dispatch(updateCall({ callId, call: missedCall }));
      store.dispatch(setIncomingCallNull());
    }
  }

  getCallById(callId: string): Call | null {
    return this.getState().calls.find((c) => c.id === callId) || null;
  }

  getCallsForContact(contactId: string): Call[] {
    return this.getState().calls.filter((c) => c.contactId === contactId);
  }

  getMissedCalls(): Call[] {
    return this.getState().calls.filter((c) => c.status === "missed");
  }

  getRecentCalls(limit: number = 50): Call[] {
    return [...this.getState().callHistory]
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
      .slice(0, limit);
  }

  getCallStats(): {
    total: number;
    missed: number;
    answered: number;
    totalDuration: number;
    averageDuration: number;
  } {
    const calls = this.getState().calls;
    const total = calls.length;
    const missed = calls.filter((c) => c.status === "missed").length;
    const answered = calls.filter(
      (c) => c.status === "answered" || c.status === "ended",
    ).length;
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageDuration = answered > 0 ? totalDuration / answered : 0;

    return {
      total,
      missed,
      answered,
      totalDuration,
      averageDuration,
    };
  }
}

let callsServiceInstance: CallsService | null = null;

export const getCallsService = (): CallsService => {
  if (!callsServiceInstance) {
    callsServiceInstance = new CallsService();
  }
  return callsServiceInstance;
};
