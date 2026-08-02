"use client";

import { useCall } from "@whatschat/im";
import { getWebRTCManager } from "@/src/shared/utils/webrtc";

export function useRealCall() {
  return useCall({
    getCallManager: () => getWebRTCManager(),
  });
}
