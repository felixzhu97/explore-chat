import Constants, { ExecutionEnvironment } from "expo-constants";
import { getCallManagerStub, createCallManager } from "@chat/im";
import { createMobileRTCConfig } from "../rtc/mobile-rtc-config";
import type { CallState } from "./callTypes";

export type { CallState } from "./callTypes";
export type { ICallManager } from "@chat/im";

let cached: import("@chat/im").ICallManager | null = null;

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

export function getCallManager(): import("@chat/im").ICallManager {
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
