import { useCall as useRtcCall } from "@chat/im";
import { useSocketStore } from "@/core/store/hooks";
import { getCallManager } from "@/core/call/callManagerLoader";

export function useCall() {
  const socket = useSocketStore((s) => s.socket);
  return useRtcCall({
    getCallManager: () => getCallManager(),
    socket,
  });
}
