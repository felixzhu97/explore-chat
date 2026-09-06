# Chat iOS — API Contract

Frozen against the Spring Boot API (`:9001`) and Socket.IO gateway (`:9002`).
Swift clients must not invent alternate paths or event names.

## Bases

| Channel | Default | Notes |
| --- | --- | --- |
| REST | `http://localhost:9001/api/v1` | Simulator; device uses LAN IP |
| Socket.IO | `http://localhost:9002` | path `/socket.io`; auth `token` or `Authorization` |
| Auth header | `Authorization: Bearer <accessToken>` | 401 → clear session |

## Errors (AIP-193 RpcStatus)

```json
{ "code": "UNAUTHENTICATED", "message": "...", "details": [] }
```

`code` is the `RpcCode` enum name (string), not a numeric gRPC status.

## REST (mobile surface)

### Auth — `/auth`

| Method | Path | Body / notes |
| --- | --- | --- |
| POST | `/auth/register` | `{ email, password, username?, phone? }` → `{ user, token, refreshToken }` |
| POST | `/auth/login` | `{ email, password }` → same |
| POST | `/auth/refreshToken` | `{ refreshToken }` → `{ token, refreshToken }` |
| POST | `/auth/logout` | 204 |
| GET | `/auth/me` | `{ user }` |
| PATCH | `/auth/profile` | `{ username?, phone?, status?, avatar? }` |
| POST | `/auth/changePassword` | `{ currentPassword, newPassword }` |
| POST | `/auth/forgotPassword` | `{ email }` |
| POST | `/auth/resetPassword` | `{ token, newPassword }` |

### Users / Follow — `/users`

| Method | Path |
| --- | --- |
| GET | `/users/me`, `/users/{user}`, `/users?q=` |
| GET | `/users/suggestions?page_size=` |
| POST | `/users/following:check` body `{ userIds }` |
| POST | `/users/{user}:follow` / `:unfollow` / `:block` / `:unblock` |
| GET | `/users/{user}/followers`, `/users/{user}/following` |
| DELETE | `/users/me` |

### Posts / Comments / Media

| Method | Path |
| --- | --- |
| GET | `/posts`, `/posts/feed`, `/posts/explore`, `/posts/reels`, `/posts/user/{user}`, `/posts/{post}` |
| POST | `/posts` body `{ caption?, mediaUrls?, type?, coverUrl? }` |
| POST | `/posts/{post}:like` / `:unlike` / `:save` / `:unsave` |
| DELETE | `/posts/{post}` |
| GET/POST | `/posts/{post}/comments` ; DELETE `/posts/{post}/comments/{comment}` |
| POST | `/media` or `/media/upload` multipart `file` |

### Status / Search / Notifications / Analytics

| Method | Path |
| --- | --- |
| GET/POST | `/status` ; DELETE `/status/{status}` ; POST `/status/{status}:view` |
| GET | `/search?q=&type=users\|posts\|hashtags\|all` |
| GET | `/notifications` ; POST `/{id}:read`, `/read:all`, `/read:batch` |
| POST | `/analytics/events` body `{ name\|event, payload? }` or batch compatible |

### Chats / Messages / Calls / Groups

| Method | Path |
| --- | --- |
| GET/POST | `/chats` ; GET/PATCH/DELETE `/chats/{chat}` ; `:archive` / `:mute` |
| GET/POST | `/chats/{chat}/messages` ; PATCH/DELETE message ; `:react` / `:read` |
| GET/POST | `/calls` ; `:answer` / `:reject` / `:end` |
| GET/POST | `/groups` ; participants add/remove |

### Health

| Method | Path |
| --- | --- |
| GET | `/health` |

Admin / Ads endpoints exist on the API but are out of scope for the consumer iOS app.

## Socket.IO events

### Client → server

`chat:join`, `chat:leave`, `message:send`, `message:typing`, `message:read`, `message:reaction`,
`call:incoming`, `call:answer`, `call:reject`, `call:end`,
`call:ice-candidate`, `call:offer`, `call:webrtc-answer`,
`status:create`, `user:status`

### Server → client

`message:received`, `message:typing`, `message:read`, `message:reaction`,
`call:incoming`, `call:answer`, `call:reject`, `call:end`,
`call:ice-candidate`, `call:offer`, `call:webrtc-answer`,
`status:create`, `user:status`, `notification:new`

Rooms: `user:{userId}`, `chat:{chatId}`.

## Pagination

List endpoints accept `page_size` and opaque `page_token`; responses may include `next_page_token`.

## User shape

`id`, `username`, `email`, `phone?`, `avatar?`, `status?`, `isOnline?`
