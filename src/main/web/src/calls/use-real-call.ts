"use client";

import { useCall } from "@whatschat/im";
import { getWebRTCManager } from "@/calls/web-rtc-config";

export function useRealCall() {
  return useCall({
    getCallManager: () => getWebRTCManager(),
  });
}
