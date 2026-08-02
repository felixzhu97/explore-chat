import type { Contact, Message, StoryItem } from "@/shared/types";

export const mockContacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好，最近怎么样？",
    timestamp: "10:30",
    unreadCount: 2,
    isOnline: true,
    isGroup: false,
    phone: "+86 138 0013 8000",
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "明天见面吧",
    timestamp: "09:15",
    unreadCount: 0,
    isOnline: false,
    isGroup: false,
    phone: "+86 139 0013 9000",
  },
  {
    id: "3",
    name: "工作群",
    avatar: "/placeholder.svg?height=40&width=40&text=工",
    lastMessage: "会议时间改到下午3点",
    timestamp: "昨天",
    unreadCount: 5,
    isOnline: true,
    isGroup: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      senderName: "张三",
      content: "你好！",
      timestamp: new Date("2024-01-15T10:00:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "2",
      senderId: "current-user",
      senderName: "我",
      content: "你好，最近怎么样？",
      timestamp: new Date("2024-01-15T10:30:00Z").toISOString(),
      type: "text",
      status: "read",
    },
  ],
  "2": [
    {
      id: "3",
      senderId: "2",
      senderName: "李四",
      content: "明天见面吧",
      timestamp: new Date("2024-01-15T09:15:00Z").toISOString(),
      type: "text",
      status: "delivered",
    },
  ],
  "3": [
    {
      id: "4",
      senderId: "1",
      senderName: "张三",
      content: "会议时间改到下午3点",
      timestamp: new Date("2024-01-14T18:00:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "5",
      senderId: "2",
      senderName: "李四",
      content: "好的，我知道了",
      timestamp: new Date("2024-01-14T18:01:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "6",
      senderId: "current-user",
      senderName: "我",
      content: "收到，准时参加",
      timestamp: new Date("2024-01-14T18:02:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "7",
      senderId: "4",
      senderName: "王五",
      content: "我可能会晚到几分钟",
      timestamp: new Date("2024-01-14T18:03:00Z").toISOString(),
      type: "text",
      status: "read",
    },
  ],
};

export const mockUser = {
  id: "current-user",
  username: "me",
  name: "我",
  avatar: "/placeholder.svg?height=40&width=40&text=我",
  phone: "+86 138 0000 0000",
  email: "me@example.com",
  status: "在线",
  isOnline: true,
  lastSeen: new Date().toISOString(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockStories: StoryItem[] = [
  {
    id: "s1",
    userId: "u1",
    username: "appletv",
    avatar: "/placeholder.svg?height=64&width=64&text=A",
    hasUnseen: true,
  },
  {
    id: "s2",
    userId: "u2",
    username: "redbull",
    avatar: "/placeholder.svg?height=64&width=64&text=R",
  },
  {
    id: "s3",
    userId: "u3",
    username: "architect",
    avatar: "/placeholder.svg?height=64&width=64&text=Ar",
  },
  {
    id: "s4",
    userId: "u4",
    username: "olympics",
    avatar: "/placeholder.svg?height=64&width=64&text=O",
  },
  {
    id: "s5",
    userId: "u5",
    username: "dezeen",
    avatar: "/placeholder.svg?height=64&width=64&text=D",
  },
  {
    id: "s6",
    userId: "u6",
    username: "archdaily",
    avatar: "/placeholder.svg?height=64&width=64&text=Ad",
  },
];
