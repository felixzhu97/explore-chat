import type { Message, Contact } from "../types";

// 获取联系人的消息
export function getMessagesForContact(
  contactId: string,
  messages: Record<string, Message[]>
): Message[] {
  const contactMessages = messages[contactId];
  return Array.isArray(contactMessages) ? contactMessages : [];
}

// 创建新消息
export function createMessage(
  content: string,
  type: "text" | "image" | "video" | "audio" | "file" = "text",
  senderId: string = "current-user",
  senderName: string = "我"
): Message {
  return {
    id: Date.now().toString(),
    senderId,
    senderName,
    content,
    timestamp: new Date().toISOString(),
    type,
    status: "sent",
  };
}

// 添加消息到消息列表
export function addMessageToContact(
  contactId: string,
  message: Message,
  messages: Record<string, Message[]>
): void {
  if (messages[contactId]) {
    messages[contactId].push(message);
  } else {
    messages[contactId] = [message];
  }
}

// 模拟群组响应
export function simulateGroupResponse(
  contactId: string,
  messages: Record<string, Message[]>
): void {
  const groupMembers = [
    { id: "1", name: "张三" },
    { id: "2", name: "李四" },
    { id: "4", name: "王五" },
  ];

  const randomMember =
    groupMembers[Math.floor(Math.random() * groupMembers.length)];
  const groupResponses = [
    "同意！",
    "好主意",
    "我也这么想",
    "没问题",
    "👍",
    "收到",
    "让我想想",
    "这个可以",
    "支持",
    "赞成",
  ];

  const randomResponse =
    groupResponses[Math.floor(Math.random() * groupResponses.length)];

  const responseMessage = createMessage(
    randomResponse,
    "text",
    randomMember.id,
    randomMember.name
  );

  addMessageToContact(contactId, responseMessage, messages);
}

// 模拟个人响应
export function simulateIndividualResponse(
  contactId: string,
  contactName: string,
  messages: Record<string, Message[]>
): void {
  const responses = [
    "好的，收到了！",
    "谢谢你的消息",
    "我稍后回复你",
    "明白了",
    "👍",
    "没问题",
  ];
  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];

  const responseMessage = createMessage(
    randomResponse,
    "text",
    contactId,
    contactName
  );

  addMessageToContact(contactId, responseMessage, messages);
}

// 处理联系人操作
export function handleContactAction(
  action: string,
  contact: Contact,
  onStartCall: (
    contactId: string,
    contactName: string,
    avatar: string,
    type: "voice" | "video"
  ) => void
) {
  switch (action) {
    case "call":
      console.log("Starting voice call with:", contact.name);
      onStartCall(contact.id, contact.name, contact.avatar || "", "voice");
      break;
    case "video-call":
      console.log("Starting video call with:", contact.name);
      onStartCall(contact.id, contact.name, contact.avatar || "", "video");
      break;
    case "delete":
      console.log("Delete contact:", contact);
      break;
    case "block":
      console.log("Block contact:", contact);
      break;
    case "pin":
      console.log("Pin contact:", contact);
      break;
    case "mute":
      console.log("Mute contact:", contact);
      break;
    default:
      break;
  }
}
