# Catalog — Value Streams

> 负责人：Product Owner · ADM Phase B  
> as-is 主旅程；进行中 / 规划中的 Capability 不另开 Value Stream

## VS-01 Consume & Create Social Content

| Stage ID | Stage name              | 退出条件（简述）             |
| -------- | ----------------------- | ---------------------------- |
| VS01-S1  | Authenticate            | 用户已登录                   |
| VS01-S2  | Browse Feed / Discovery | 可见信息流、Reels 或探索内容 |
| VS01-S3  | Engage or Publish       | 完成互动或成功发帖           |

Enabling L1：`BC-L1-01`、`BC-L1-03`、`BC-L1-04`、`BC-L1-05`

## VS-02 Communicate in Real Time

| Stage ID | Stage name        | 退出条件（简述） |
| -------- | ----------------- | ---------------- |
| VS02-S1  | Open Conversation | 会话就绪         |
| VS02-S2  | Exchange Messages | 消息已送达/可见  |
| VS02-S3  | Optional Call     | 通话建立或结束   |

Enabling L1：`BC-L1-02`、`BC-L1-06`（会话依赖 `BC-L1-01`）

## VS-03 Operate & Augment with AI

| Stage ID | Stage name               | 退出条件（简述）                  |
| -------- | ------------------------ | --------------------------------- |
| VS03-S1  | Admin Access or AI Entry | 管理入口或 AI 入口可用            |
| VS03-S2  | Configure or Invoke      | 完成运营操作或经 BFF 发起 AI 请求 |
| VS03-S3  | Observe Outcome          | 配置生效或 AI 结果返回客户端      |

Enabling L1：`BC-L1-07`、`BC-L1-08`
