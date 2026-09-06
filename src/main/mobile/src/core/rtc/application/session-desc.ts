export interface SessionDescInput {
  type?: string | null;
  sdp?: string;
  _type?: string;
  _sdp?: string;
}

export function sessionDescToPlain(
  desc: SessionDescInput | null,
  defaultType?: "offer" | "answer"
): RTCSessionDescriptionInit | null {
  if (!desc) return null;
  const t = desc.type ?? desc._type ?? defaultType ?? null;
  const s = desc.sdp ?? desc._sdp;
  if (t == null && (s == null || s === "")) return null;
  const typeVal = (t ?? defaultType ?? "offer") as RTCSdpType;
  return { type: typeVal, sdp: typeof s === "string" ? s : "" };
}
