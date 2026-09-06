import Constants, { ExecutionEnvironment } from "expo-constants";
import {
  getCallManagerStub,
  createCallManager,
  type ICallManager,
} from "@/core/rtc";
import { createMobileRTCConfig } from "../rtc/mobile-rtc-config";
import type { CallState } from "./callTypes";

export type { CallState } from "./callTypes";
export type { ICallManager };

let cached: ICallManager | null = null;

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

export function getCallManager(): ICallManager {
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
