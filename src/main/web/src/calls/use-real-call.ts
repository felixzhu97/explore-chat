"use client";

import { useCall } from "@/calls/rtc";
import { getWebRTCManager } from "@/calls/web-rtc-config";

export function useRealCall() {
  return useCall({
    getCallManager: () => getWebRTCManager(),
  });
}
