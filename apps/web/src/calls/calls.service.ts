export type CallType = "voice" | "video";
export type CallStatus =
  | "incoming"
  | "outgoing"
  | "missed"
  | "answered"
  | "ended";

export interface Call {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: CallType;
  status: CallStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  isGroup?: boolean;
  participants?: string[];
}

export function mapCall(
  data: Pick<
    Call,
    | "id"
    | "contactId"
    | "contactName"
    | "contactAvatar"
    | "type"
    | "status"
    | "startTime"
  > &
    Partial<Call>,
): Call {
  return data;
}

export function answerCall(call: Call): Call {
  return { ...call, status: "answered" };
}

export function endCallRecord(
  call: Call,
  endTime: string,
  duration: number,
): Call {
  return { ...call, status: "ended", endTime, duration };
}

export function markCallMissed(call: Call): Call {
  return { ...call, status: "missed" };
}

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface CallsState {
  calls: Call[];
  activeCall: Call | null;
  incomingCall: Call | null;
  callHistory: Call[];
}

const initialState: CallsState = {
  calls: [],
  activeCall: null,
  incomingCall: null,
  callHistory: [],
};

const callsSlice = createSlice({
  name: "calls",
  initialState,
  reducers: {
    setActiveCall: (state, action: PayloadAction<Call | null>) => {
      state.activeCall = action.payload;
    },
    setIncomingCall: (state, action: PayloadAction<Call | null>) => {
      state.incomingCall = action.payload;
    },
    addCall: (state, action: PayloadAction<Call>) => {
      state.calls.push(action.payload);
      state.callHistory.push(action.payload);
    },
    updateCall: (
      state,
      action: PayloadAction<{ callId: string; call: Call }>,
    ) => {
      const { callId, call } = action.payload;
      const idx = state.calls.findIndex((c) => c.id === callId);
      if (idx !== -1) state.calls[idx] = call;
      const histIdx = state.callHistory.findIndex((c) => c.id === callId);
      if (histIdx !== -1) state.callHistory[histIdx] = call;
    },
    setActiveCallNull: (state) => {
      state.activeCall = null;
    },
    setIncomingCallNull: (state) => {
      state.incomingCall = null;
    },
  },
});

export const {
  setActiveCall,
  setIncomingCall,
  addCall,
  updateCall,
  setActiveCallNull,
  setIncomingCallNull,
} = callsSlice.actions;
export const callsReducer = callsSlice.reducer;
export default callsReducer;

import { store } from "@/layout/store";

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
