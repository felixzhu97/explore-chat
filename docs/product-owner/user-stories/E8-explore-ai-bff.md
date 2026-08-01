# E8 Explore AI BFF

← [用户故事地图](../User-Story-Map.md)

## 背景

WhatsFeed 通过 Nest BFF 代理 Explore AI，避免浏览器直连上游并暴露服务凭证。

---

## US-11 经 BFF 使用 Explore AI

**As a** 终端用户  
**I want** 通过 WhatsFeed 后端使用 Explore AI 能力  
**So that** 我无需也不应直接暴露上游 AI 服务凭证

### 验收标准

1. **Scenario** 客户端只调用 WhatsFeed API
   **GIVEN** Explore AI BFF 已启用且服务端配置了上游地址与服务密钥  
   **WHEN** 用户触发经 BFF 暴露的 AI 能力  
   **THEN** 浏览器请求指向 WhatsFeed API（`/api/v1/ai/explore/*`）  
   **AND** 上游服务密钥不出现在客户端

### 状态

已实现
