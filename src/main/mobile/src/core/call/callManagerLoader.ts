import Constants, { ExecutionEnvironment } from "expo-constants";
import { getCallManagerStub, createCallManager } from "@whatschat/im";
import { createMobileRTCConfig } from "../rtc/mobile-rtc-config";
import type { CallState } from "./callTypes";

export type { CallState } from "./callTypes";
export type { ICallManager } from "@whatschat/im";

let cached: import("@whatschat/im").ICallManager | null = null;

function isExpoGo(): boolean {
  try {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient)
      return true;
    const { NativeModules } = require("react-native");
    const hasWebRTC =
      NativeModules?.WebRTCModule != null || NativeModules?.RTCModule != null;
    return !hasWebRTC;
  } catch {
    return true;
  }
}

export function getCallManager(): import("@whatschat/im").ICallManager {
  if (cached) return cached;
  if (isExpoGo()) {
    cached = getCallManagerStub();
  } else {
    try {
      cached = createCallManager(createMobileRTCConfig(null));
    } catch {
      cached = getCallManagerStub();
    }
  }
  return cached!;
}
