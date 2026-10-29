# E8 Explore AI BFF

← [用户故事地图](../User-Story-Map.md)

## 背景

Chat 通过 Spring BFF 代理 Explore AI，避免浏览器直连上游并暴露服务凭证。对标 Agentforce Service Agent：消息页可 Ask Agent。

---

## US-11 经 BFF 使用 Explore AI

**As a** 终端用户  
**I want** 通过 Chat 后端使用 Explore AI 能力  
**So that** 我无需也不应直接暴露上游 AI 服务凭证

### 验收标准

1. **Scenario** 客户端只调用 Chat API  
   **GIVEN** Explore AI BFF 已配置 `EXPLORE_AI_BASE_URL` 与 `EXPLORE_AI_SERVICE_KEY`  
   **WHEN** 用户触发经 BFF 暴露的 AI 能力  
   **THEN** 浏览器请求指向 Chat API（`/api/v1/ai/explore/*`）  
   **AND** 上游服务密钥不出现在客户端

2. **Scenario** Gallery list + invoke  
   **GIVEN** 同上且用户已登录  
   **WHEN** 调用 `GET /api/v1/ai/explore/agents` 与 `POST /api/v1/ai/explore/agents/{type}/invoke`  
   **THEN** Chat 以 `X-Service-Key` + `X-Client-Id` 转发 Explore AI 并返回 JSON  
   **AND** 未配置 service key 时返回 503

### 状态

已实现
