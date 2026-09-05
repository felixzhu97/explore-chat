import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Call } from "@/calls/call.model";

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
export default callsSlice.reducer;
