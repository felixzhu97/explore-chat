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
