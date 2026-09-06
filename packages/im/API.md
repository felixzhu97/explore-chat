# @chat/im

即时通讯（IM）和实时通话（RTC）逻辑的共享包，提供聊天管理和 WebRTC 通话功能。

## 安装

```bash
pnpm add @chat/im
```

**peerDependencies:**

- `@reduxjs/toolkit ^2.0.0`
- `react ^18.0.0`

## 模块概览

```ts
import {
  // Domain
  type WebSocketMessage,
  type ChatState,
  type IWebSocketAdapter,
  type IChatsService,
  type ChatListItem,

  // Application
  type ApiMessageLike,
  type SocketMessagePayload,
  MESSAGE_LIMIT,
  mapApiMessageToMessage,
  mapSocketPayloadToMessage,
  mergeAndSortMessages,
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setSelectedChat,
  chatReducer,
  addMessage,
  updateMessage,
  deleteMessage,
  setMessages,
  messageReducer,

  // Presentation
  useChatsWithLiveMessages,
  type UseChatsWithLiveMessagesOptions,

  // RTC
  type RTCCallState,
  type ICallManager,
  type StartCallOptions,
  type RTCSignalingAdapter,
  type RTCMediaAdapter,
  type RTCPeerHandle,
  type RTCApiAdapter,
  type RTCCallConfig,
  CallManagerStub,
  getCallManagerStub,
  createCallManager,
  formatDuration,
  ICE_SERVERS,
  INITIAL_CALL_STATE,
  RTC_EVENTS,
} from "@chat/im";
```

---

## Domain

### WebSocketMessage

WebSocket 传输的消息结构。

```ts
interface WebSocketMessage {
  type:
    | "message"
    | "typing"
    | "call_offer"
    | "call_answer"
    | "call_ice_candidate"
    | "call_end"
    | "call:incoming"
    | "call:answer"
    | "call:reject"
    | "call:offer"
    | "call:webrtc-answer"
    | "call:ice-candidate"
    | "call:end"
    | "user_status"
    | "message_read";
  data: Record<string, unknown>;
  from?: string;
  to?: string;
  timestamp?: number;
}
```

### ChatState

聊天状态，包含消息列表、输入状态和连接状态。

```ts
interface ChatState {
  messages: Message[];
  isTyping: boolean;
  typingUsers: string[];
  isConnected: boolean;
}
```

### IWebSocketAdapter

WebSocket 适配器接口。

```ts
interface IWebSocketAdapter {
  send(message: WebSocketMessage): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  disconnect(): void;
  isConnected(): boolean;
  setSimulatedMode?(enabled: boolean): void;
}
```

**支持的事件:**

| 事件名           | 描述               |
| ---------------- | ------------------ |
| `connected`      | WebSocket 连接成功 |
| `disconnected`   | WebSocket 连接断开 |
| `message`        | 收到新消息         |
| `message_status` | 消息状态更新       |
| `typing`         | 对方正在输入       |

### IChatsService

聊天服务接口，提供聊天 CRUD 和消息发送能力。

```ts
interface IChatsService {
  getChats(): Promise<ChatListItem[]>;
  getChatById(chatId: string): Promise<ChatListItem | null>;
  createChat(data: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<ChatListItem>;
  getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number },
  ): Promise<Message[]>;
  sendMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "video" | "audio" | "file";
      replyToMessageId?: string;
    },
  ): Promise<Message>;
  markMessageAsRead(chatId: string, messageId: string): Promise<void>;
}
```

### ChatListItem

聊天列表项数据结构。

```ts
interface ChatListItem {
  id: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  type?: string;
  participants?: unknown[];
  [key: string]: unknown;
}
```

---

## Application

### MESSAGE_LIMIT

默认消息拉取上限。

```ts
const MESSAGE_LIMIT: 50;
```

### mapApiMessageToMessage

将 API 返回的消息格式转换为 `Message` 类型。

```ts
function mapApiMessageToMessage(apiMsg: ApiMessageLike): Message;
```

### mapSocketPayloadToMessage

将 WebSocket 消息负载转换为 `Message` 类型。

```ts
function mapSocketPayloadToMessage(payload: SocketMessagePayload): Message;
```

### mergeAndSortMessages

合并 API 消息和实时消息并按时间排序。

```ts
function mergeAndSortMessages(api: Message[], live: Message[]): Message[];
```

### Chat Slice (Redux)

管理全局聊天列表和当前选中聊天。

```ts
// Actions
setChats(chats: Chat[]): void;
addChat(chat: Chat): void;
updateChat({ chatId, updates }: { chatId: string; updates: Partial<Chat> }): void;
deleteChat(chatId: string): void;
setSelectedChat(chat: Chat | null): void;

// Reducer
chatReducer: Reducer<State>;
```

**State 结构:**

```ts
interface State {
  chats: Chat[];
  selectedChat: Chat | null;
}
```

### Message Slice (Redux)

管理各聊天的消息列表。

```ts
// Actions
addMessage({ chatId, message }: { chatId: string; message: Message }): void;
updateMessage({ chatId, messageId, updates }: { chatId: string; messageId: string; updates: Partial<Message> }): void;
deleteMessage({ chatId, messageId }: { chatId: string; messageId: string }): void;
setMessages({ chatId, messages }: { chatId: string; messages: Message[] }): void;

// Reducer
messageReducer: Reducer<State>;
```

**State 结构:**

```ts
interface State {
  messages: Record<string, Message[]>;
}
```

---

## Presentation

### useChatsWithLiveMessages

用于聊天列表与会话的 hook：HTTP 拉历史，WebSocket
`message:send` 发送，并按 `message:sent` / `delivered` / `read` 推进状态。

```ts
function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined,
  options: UseChatsWithLiveMessagesOptions,
): {
  apiChats: ChatListItem[];
  isApiChat: boolean;
  messagesForSelected: Message[];
  isConnected: boolean;
  handleSendMessage: (
    content: string,
    type?: "text" | "image" | "video" | "audio" | "file",
    options?: { mediaUrl?: string },
  ) => void;
};
```

**UseChatsWithLiveMessagesOptions:**

```ts
interface UseChatsWithLiveMessagesOptions {
  getChatsService: () => IChatsService;
  getWebSocketAdapter: () => IWebSocketAdapter;
}
```

**用法示例:**

```tsx
import { useChatsWithLiveMessages } from "@chat/im";
import type { Message } from "@chat/im";

function ChatListPage({ contactId, userId }) {
  const { apiChats, messagesForSelected, isConnected, handleSendMessage } =
    useChatsWithLiveMessages(contactId, userId, {
      getChatsService: () => chatsService,
      getWebSocketAdapter: () => wsAdapter,
    });

  const handleSend = (text) => {
    handleSendMessage(text, "text");
  };

  return <div>...</div>;
}
```

---

## RTC (实时通话)

### RTCCallState

通话状态结构。

```ts
interface RTCCallState {
  isActive: boolean;
  isIncoming: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: "voice" | "video";
  status: "calling" | "ringing" | "connected" | "ended";
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
}
```

### ICallManager

通话管理器接口。

```ts
interface ICallManager {
  setSocket?(socket: unknown): void;
  on(event: string, cb: (data: unknown) => void): void;
  off(event: string, cb: (data: unknown) => void): void;
  getCallState(): RTCCallState;
  getLocalStream(): unknown;
  getRemoteStream(): unknown;
  startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video",
    options?: StartCallOptions,
  ): Promise<void>;
  answerCall(): Promise<void>;
  endCall(): void;
  toggleMute(): void;
  toggleVideo(): void;
  toggleSpeaker(): void;
}
```

**通话事件:**

| 事件名             | 描述           |
| ------------------ | -------------- |
| `callStateChanged` | 通话状态变更   |
| `localStream`      | 本地媒体流就绪 |
| `remoteStream`     | 远程媒体流就绪 |
| `callEnded`        | 通话结束       |
| `incomingCall`     | 收到来电       |

### createCallManager

创建通话管理器实例。需要传入完整的配置对象。

```ts
function createCallManager(config: RTCCallConfig): ICallManager;
```

**RTCCallConfig:**

```ts
interface RTCCallConfig {
  signaling: RTCSignalingAdapter; // 信令适配器（WebSocket）
  media: RTCMediaAdapter; // 媒体适配器（WebRTC）
  api: RTCApiAdapter; // API 适配器（通话创建/接听/结束）
  getCurrentUserId: () => string | null;
}
```

**RTCSignalingAdapter:**

```ts
interface RTCSignalingAdapter {
  on(event: string, handler: (payload: unknown) => void): void;
  off(event: string, handler: (payload: unknown) => void): void;
  send(event: string, payload: unknown): void;
  setSocket?(socket: unknown): void;
}
```

**RTCMediaAdapter:**

```ts
interface RTCMediaAdapter {
  createPeerConnection(iceServers: RTCIceServer[]): RTCPeerHandle;
  getUserMedia(video: boolean): Promise<unknown>;
  fromPlainSessionDesc(init: RTCSessionDescriptionInit): unknown;
  fromPlainIceCandidate(candidate: RTCIceCandidateInit): unknown;
  stopStream(stream: unknown): void;
  getAudioTracks(stream: unknown): unknown[];
  getVideoTracks(stream: unknown): unknown[];
  setTrackEnabled(track: unknown, enabled: boolean): void;
}
```

**RTCApiAdapter:**

```ts
interface RTCApiAdapter {
  createCall(body: {
    type: string;
    targetUserId?: string;
    chatId?: string;
  }): Promise<{ callId: string; participants?: { userId: string }[] }>;
  answerCall(callId: string): Promise<void>;
  endCall(callId: string): Promise<void>;
}
```

**用法示例:**

```ts
import { createCallManager } from "@chat/im";

// 假设已实现了以下适配器
const callManager = createCallManager({
  signaling: webSocketSignalingAdapter,
  media: webRTCMediaAdapter,
  api: callApiAdapter,
  getCurrentUserId: () => currentUserId,
});
```

### CallManagerStub / getCallManagerStub

用于不支持 WebRTC 的环境（如 Expo Go）的空实现。所有通话操作会抛出提示性错误。

```ts
// 抛出错误: "Calls require a development build. Expo Go does not support WebRTC."
const stub = getCallManagerStub();
```

### useCall

React hook，封装通话管理器，提供响应式的通话状态。

```ts
function useCall(options: UseCallOptions): {
  callState: RTCCallState;
  localStream: unknown;
  remoteStream: unknown;
  error: string | null;
  startCall: (
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video",
    opts?: { chatId?: string },
  ) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  formatDuration: (seconds: number) => string;
};
```

**UseCallOptions:**

```ts
interface UseCallOptions {
  getCallManager: () => ICallManager;
  socket?: unknown;
}
```

**用法示例:**

```tsx
import { useCall, CallManagerStub, getCallManagerStub } from "@chat/im";

function CallButton({ contact }) {
  const { callState, startCall, endCall, answerCall, toggleMute, toggleVideo } =
    useCall({
      getCallManager: getCallManagerStub,
    });

  return (
    <div>
      <button
        onClick={() =>
          startCall(contact.id, contact.name, contact.avatar, "voice")
        }
      >
        拨打语音
      </button>
      <button onClick={toggleMute}>静音</button>
      <button onClick={toggleVideo}>视频</button>
      <button onClick={endCall}>挂断</button>
    </div>
  );
}
```

### formatDuration

将秒数格式化为 `MM:SS` 或 `HH:MM:SS` 字符串。

```ts
function formatDuration(seconds: number): string;

// 示例
formatDuration(65); // "01:05"
formatDuration(3661); // "01:01:01"
```

### ICE_SERVERS

默认 STUN 服务器配置。

```ts
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
```

### INITIAL_CALL_STATE

通话状态的初始值。

```ts
const INITIAL_CALL_STATE: RTCCallState = {
  isActive: false,
  isIncoming: false,
  contactId: "",
  contactName: "",
  contactAvatar: "",
  callType: "voice",
  status: "ended",
  duration: 0,
  isMuted: false,
  isVideoOff: false,
  isSpeakerOn: false,
};
```

### RTC_EVENTS

信令事件常量集合。

```ts
const RTC_EVENTS = {
  INCOMING: "call:incoming",
  ANSWER: "call:answer",
  OFFER: "call:offer",
  WEBRTC_ANSWER: "call:webrtc-answer",
  ICE_CANDIDATE: "call:ice-candidate",
  END: "call:end",
} as const;
```

---

## 整体架构

```
@chat/im
├── Domain (核心接口)
│   ├── WebSocketMessage / ChatState       类型定义
│   ├── IWebSocketAdapter                  WebSocket 接口
│   └── IChatsService                      聊天服务接口
│
├── Application (业务逻辑)
│   ├── 消息映射 (mapApiMessageToMessage 等)
│   ├── Chat Slice (Redux)                 聊天列表状态管理
│   └── Message Slice (Redux)              消息列表状态管理
│
├── Presentation (React Hooks)
│   └── useChatsWithLiveMessages           会话列表 + 发送/回执
│
└── RTC (实时通话)
    ├── Domain
    │   ├── RTCCallState                   通话状态类型
    │   ├── ICallManager                    通话管理器接口
    │   └── Adapters (信令/媒体/API 适配器接口)
    ├── Application
    │   ├── formatDuration                  时长格式化
    │   └── constants (ICE_SERVERS, RTC_EVENTS 等)
    ├── Presentation
    │   └── useCall                         通话 UI hook
    └── Infrastructure
        ├── CallManagerStub                空实现（Expo Go）
        └── createCallManager              完整实现
```

---

## 最佳实践

1. **IChatsService 和 IWebSocketAdapter 的实现**: 由使用方（通常是 app 层）提供具体实现，IM 包不绑定具体的网络实现。

2. **通话适配器的实现**: RTC 模块依赖三个适配器（signaling、media、api），需要由使用方按接口规范实现。

3. **Redux Store 配置**: 需要在 Redux store 中注册 `chatReducer` 和 `messageReducer`。

```ts
import { combineReducers } from "@reduxjs/toolkit";
import { chatReducer, messageReducer } from "@chat/im";

const rootReducer = combineReducers({
  im: combineReducers({
    chat: chatReducer,
    message: messageReducer,
  }),
  // ...其他 reducers
});
```

4. **乐观对账**: 发送方生成 `clientMsgId`，以 `message:sent` /
   `message:delivered` / `message:read` 推进状态，勿在客户端伪造回执。

---

## 测试

### 运行测试

```bash
# 安装依赖
pnpm install

# 运行所有测试
pnpm test

# 运行测试并监听变化
pnpm test:watch

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试并显示 UI
pnpm test:ui
```

### 测试结构

```
src/__tests__/
├── domain.test.ts                    # Domain 层接口和类型测试
├── mappers.test.ts                   # 消息映射函数测试
├── chat.slice.test.ts               # Chat Redux slice 测试
├── message.slice.test.ts            # Message Redux slice 测试
├── use-chats-with-live-messages.test.ts  # 会话 hook 测试
├── use-chats-with-live-messages.test.ts  # useChatsWithLiveMessages hook 测试
└── rtc.test.ts                      # RTC 通话管理器测试
```

### 测试覆盖范围

| 模块                                | 覆盖率 |
| ----------------------------------- | ------ |
| Domain (类型/接口)                  | ✓      |
| Application (mappers, Redux slices) | ✓      |
| Presentation (hooks 接口)           | ✓      |
| RTC (call manager, constants)       | ✓      |

### 编写新测试

```ts
import { describe, it, expect, vi } from "vitest";
import { mapApiMessageToMessage } from "../application/mappers";

describe("mapApiMessageToMessage", () => {
  it("should map basic API message to Message", () => {
    const apiMessage = {
      id: "msg-1",
      senderId: "user-123",
      senderName: "John",
      content: "Hello",
      timestamp: "2024-01-01T00:00:00.000Z",
      type: "text",
      status: "sent",
    };

    const result = mapApiMessageToMessage(apiMessage);

    expect(result.id).toBe("msg-1");
    expect(result.senderId).toBe("user-123");
  });
});
```
