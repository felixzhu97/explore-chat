# ExploreChat API Documentation

## Base URL

```bash
BASE_URL="http://localhost:3001"
API_PREFIX="${BASE_URL}/api/v1"
```

全局前缀：`/api/v1`。认证：Bearer JWT（除 health / 公开认证端点外）。

Postman：[postman_collection.json](./postman_collection.json)

---

## Table of Contents

1. [Health](#health)
2. [Auth](#auth)
3. [Users / Follow](#users--follow)
4. [Chats / Messages / Calls / Groups](#chats--messages--calls--groups)
5. [Posts / Comments / Media](#posts--comments--media)
6. [GraphQL Feed / Reels](#graphql-feed--reels)
7. [Search / Notifications / Analytics / Ads / Admin](#search--notifications--analytics--ads--admin)
8. [AI / Explore AI BFF](#ai--explore-ai-bff)
9. [Vision / Image / Video / Voice](#vision--image--video--voice)
10. [Side services](#side-services)

---

## Health

```bash
curl -X GET "${API_PREFIX}/health"
```

---

## Auth

| Method | Path             | Description |
| ------ | ---------------- | ----------- |
| POST   | `/auth/register` | 注册        |
| POST   | `/auth/login`    | 登录        |
| POST   | `/auth/refresh`  | 刷新令牌    |

---

## Users / Follow

| Method | Path                | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/users/...`        | 资料、搜索、粉丝/关注          |
| POST   | `/users/:id/follow` | 关注（以实际 controller 为准） |
| DELETE | `/users/:id/follow` | 取关                           |

---

## Chats / Messages / Calls / Groups

| Method | Path        | Description |
| ------ | ----------- | ----------- |
| \*     | `/chats`    | 会话        |
| \*     | `/messages` | 消息        |
| \*     | `/calls`    | 通话        |
| \*     | `/groups`   | 群组        |

实时通道：Socket.IO（消息、在线状态、通话信令、`notification:new`）。

---

## Posts / Comments / Media

| Method | Path                      | Description                                |
| ------ | ------------------------- | ------------------------------------------ |
| \*     | `/posts`                  | 发帖、列表；`mediaUrls` + 可选 `coverUrl`  |
| \*     | `/posts/:postId/comments` | 评论                                       |
| POST   | `/media/upload`           | multipart 上传，返回 url/key/mimeType/size |

---

## GraphQL Feed / Reels

```
POST ${API_PREFIX}/graphql
```

主要 Query：`feed(limit, pageState)`、`reels(limit, pageState)`。需 JWT。

---

## Search / Notifications / Analytics / Ads / Admin

| Prefix           | Description                   |
| ---------------- | ----------------------------- |
| `/search`        | 用户 / 帖子 / 话题（ES 可选） |
| `/notifications` | 活动通知                      |
| `/analytics`     | 事件与概览                    |
| `/ads`           | 广告配置                      |
| `/admin`         | 管理接口                      |

---

## AI / Explore AI BFF

| Prefix          | Description                                    |
| --------------- | ---------------------------------------------- |
| `/ai`           | 本地 Ollama 聊天等                             |
| `/ai/explore/*` | **Explore AI BFF** — 浏览器不得直连 Explore AI |

启用条件（服务端）：

- `EXPLORE_AI_ENABLED=true`
- `EXPLORE_AI_BASE_URL`
- `EXPLORE_AI_SERVICE_KEY`

上游使用服务间头：`X-Service-Key`、`X-Client-Id`（UUID）。SSE 响应需兼容 `data:` 行。

---

## Vision / Image / Video / Voice

| Prefix    | Upstream              |
| --------- | --------------------- |
| `/vision` | Vision 服务 `:8001`   |
| `/image`  | Media Gen / Replicate |
| `/video`  | Media Gen             |
| `/voice`  | Media Gen TTS         |

---

## Side services

| Service        | Default port | Docs (legacy merged here) |
| -------------- | ------------ | ------------------------- |
| Recommendation | 8000         | Feed/Explore 排序与召回   |
| Vision         | 8001         | 标签与 NSFW               |
| RAG            | 8002         | 语义搜索 / 问答           |
| Media Gen      | 3456         | 图片 / 视频 / 语音        |

客户端应优先经 Nest API，而不是在浏览器硬编码旁路服务密钥。
