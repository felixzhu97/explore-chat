# IM contract

Language-neutral **protocol interface** for Chat wire shapes.

| Path | Role |
| --- | --- |
| [openapi.yaml](./openapi.yaml) | SSoT — REST shapes + Socket.IO `ImWsEvent` |

**How to integrate (all clients):**

1. Call Spring `HTTPS /api/v1` and Socket.IO `:9002` with the paths / event names in this file.
2. Keep hand-written DTOs in Java / TypeScript (web & mobile) / Swift aligned with the YAML.
3. Change the wire first here, then update each client.

TypeScript clients (`web`, `mobile`) organize IM code per feature as
`controller(hooks) → service → domain ← infra (+ mapper)`. Domain events stay
in-process and are not wire. Java and Swift are unchanged in the current TS DDD slice.

There is **no** codegen and **no** shared runtime package in this directory.
