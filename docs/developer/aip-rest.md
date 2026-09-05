# AIP REST contract (ExploreChat)

Breaking cutover under prefix `/api/v1` (no `api/v2`, no dual envelope).

## Normative AIPs

| Topic                    | AIP                                                                   | ExploreChat shape                                     |
| ------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------- |
| Resource-oriented design | [121](https://google.aip.dev/121) / [122](https://google.aip.dev/122) | Noun collections; child resources under parents       |
| Standard methods         | [131](https://google.aip.dev/131)–[135](https://google.aip.dev/135)   | Get/List/Create/Update/Delete; Update prefers `PATCH` |
| Custom methods           | [136](https://google.aip.dev/136)                                     | `POST …/{resource}:verb`                              |
| Pagination               | [158](https://google.aip.dev/158)                                     | `page_size` + opaque `page_token` → `next_page_token` |
| Errors                   | [193](https://google.aip.dev/193)                                     | HTTP status + `{ code, message, details[] }`          |
| Versioning               | [180](https://google.aip.dev/180)                                     | Keep `api/v1` prefix; semantics redefined             |

## Success bodies

Return the resource or list object directly. Do **not** wrap in `{ success, data, message }`.

List example:

```json
{
  "messages": [],
  "next_page_token": "…"
}
```

## Errors

```json
{
  "code": "NOT_FOUND",
  "message": "User not found",
  "details": []
}
```

Shared types: `RpcStatus` / `ListQuery` / `ListResponse` in `@whatschat/shared-types`.

## Key path remaps

| Legacy                    | AIP                           |
| ------------------------- | ----------------------------- |
| `GET /messages/:chatId`   | `GET /chats/{chat}/messages`  |
| `POST /messages`          | `POST /chats/{chat}/messages` |
| `POST /chats/:id/archive` | `POST /chats/{chat}:archive`  |
| `POST /users/:id/follow`  | `POST /users/{user}:follow`   |

## Validation

- No protobuf → no `api-linter`
- OpenAPI via Nest Swagger at `/api/docs` (non-production)
- Spectral rules: [`.spectral.yml`](../../.spectral.yml) against [`openapi-aip-contract.yaml`](./openapi-aip-contract.yaml)
- Controller guard: `pnpm check:aip-rest` (rejects legacy `success: true` envelopes in Nest controllers)

## Package layout note

On this trunk, Nest HTTP controllers live under `*/presentation/` until the package-rename stack lands; treat those files as the wired AIP surface (no unused `presentation/` duplicates to delete).
