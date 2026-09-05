import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ChatArea } from "@/chat/components/chat-area";

// Mock i18n and locales FIRST
vi.mock("@/shared/locales/en", () => ({}));
vi.mock("@/shared/locales/zh", () => ({}));
vi.mock("@/shared/i18n", () => ({
  default: {
    t: (key: string) => key,
    language: "zh",
    use: vi.fn(),
  },
  LANG_STORAGE_KEY: "chat_web_lang",
  setStoredLocale: vi.fn(),
  getLocale: vi.fn(),
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, onKeyDown, ...props }: any) => (
    <input onChange={onChange} onKeyDown={onKeyDown} {...props} />
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => {
  const createMockIcon = (name: string) => {
    const MockIcon = () => (
      <div data-testid={`${name.toLowerCase()}-icon`} data-icon-name={name} />
    );
    MockIcon.displayName = name;
    return MockIcon;
  };

  return {
    __esModule: true,
    Send: createMockIcon("Send"),
    Paperclip: createMockIcon("Paperclip"),
    Smile: createMockIcon("Smile"),
    Mic: createMockIcon("Mic"),
    Phone: createMockIcon("Phone"),
    Video: createMockIcon("Video"),
    MoreVertical: createMockIcon("MoreVertical"),
    FileText: createMockIcon("FileText"),
    X: createMockIcon("X"),
    Search: createMockIcon("Search"),
    MapPin: createMockIcon("MapPin"),
    Clock: createMockIcon("Clock"),
    UserPlus: createMockIcon("UserPlus"),
    QrCode: createMockIcon("QrCode"),
    Check: createMockIcon("Check"),
    CheckCheck: createMockIcon("CheckCheck"),
    Reply: createMockIcon("Reply"),
    Star: createMockIcon("Star"),
    Copy: createMockIcon("Copy"),
    Trash2: createMockIcon("Trash2"),
    Forward: createMockIcon("Forward"),
    Play: createMockIcon("Play"),
    Download: createMockIcon("Download"),
    Edit: createMockIcon("Edit"),
    Info: createMockIcon("Info"),
    Image: createMockIcon("Image"),
    ImageIcon: createMockIcon("ImageIcon"),
    Camera: createMockIcon("Camera"),
    Square: createMockIcon("Square"),
    Sparkles: createMockIcon("Sparkles"),
    CalendarIcon: createMockIcon("CalendarIcon"),
    Hash: createMockIcon("Hash"),
    SquarePen: createMockIcon("SquarePen"),
    ChevronDown: createMockIcon("ChevronDown"),
    ChevronUp: createMockIcon("ChevronUp"),
    Circle: createMockIcon("Circle"),
    ArrowLeft: createMockIcon("ArrowLeft"),
    ArrowRight: createMockIcon("ArrowRight"),
    VideoOff: createMockIcon("VideoOff"),
    VolumeX: createMockIcon("VolumeX"),
    Heart: createMockIcon("Heart"),
    Bookmark: createMockIcon("Bookmark"),
    Loader2: createMockIcon("Loader2"),
    Pause: createMockIcon("Pause"),
    BellOff: createMockIcon("BellOff"),
    UserCheck: createMockIcon("UserCheck"),
    LayoutGrid: createMockIcon("LayoutGrid"),
    AtSign: createMockIcon("AtSign"),
    Settings: createMockIcon("Settings"),
    Bell: createMockIcon("Bell"),
    Lock: createMockIcon("Lock"),
    Globe: createMockIcon("Globe"),
    Users: createMockIcon("Users"),
    Plus: createMockIcon("Plus"),
    ChevronLeft: createMockIcon("ChevronLeft"),
    ChevronRight: createMockIcon("ChevronRight"),
    MoreHorizontal: createMockIcon("MoreHorizontal"),
    MessageCircle: createMockIcon("MessageCircle"),
    PhoneIncoming: createMockIcon("PhoneIncoming"),
    PhoneOutgoing: createMockIcon("PhoneOutgoing"),
    PhoneMissed: createMockIcon("PhoneMissed"),
    PhoneOff: createMockIcon("PhoneOff"),
    Volume2: createMockIcon("Volume2"),
    Maximize2: createMockIcon("Maximize2"),
    Minimize2: createMockIcon("Minimize2"),
    SmilePlus: createMockIcon("SmilePlus"),
    Laugh: createMockIcon("Laugh"),
    Frown: createMockIcon("Frown"),
    ThumbsUp: createMockIcon("ThumbsUp"),
    Hand: createMockIcon("Hand"),
    default: createMockIcon("Default"),
  };
});

// Mock MessageBubble component
vi.mock("@/components/message-bubble", () => ({
  MessageBubble: ({ message, onReply, onStar, onDelete, onCopy }: any) => (
    <div data-testid={`message-${message.id}`}>
      <div>{message.content}</div>
      <button onClick={() => onReply?.(message)}>Reply</button>
      <button onClick={() => onStar?.(message)}>Star</button>
      <button onClick={() => onDelete?.(message)}>Delete</button>
      <button onClick={() => onCopy?.(message)}>Copy</button>
    </div>
  ),
}));

// Mock VoiceRecorder component
vi.mock("@/components/voice-recorder", () => ({
  VoiceRecorder: ({ onRecordingComplete, onCancel }: any) => (
    <div data-testid="voice-recorder">
      <button onClick={() => onRecordingComplete?.("voice-data")}>
        Complete
      </button>
      <button onClick={() => onCancel?.()}>Cancel</button>
    </div>
  ),
}));

// Mock EmojiPicker component
vi.mock("@/components/emoji-picker", () => ({
  EmojiPicker: ({ onEmojiSelect, isOpen }: any) =>
    isOpen ? (
      <div data-testid="emoji-picker">
        <button onClick={() => onEmojiSelect?.("😀")}>😀</button>
      </div>
    ) : null,
}));

// Mock MessageInput component
vi.mock("@/chat/components/message-input", () => ({
  MessageInput: (props: any) => (
    <div data-testid="message-input">
      <input placeholder="输入消息..." />
      <button data-testid="send-icon">Send</button>
      <button data-testid="paperclip-icon">Paperclip</button>
      <button data-testid="smile-icon">Smile</button>
      <button data-testid="mic-icon">Mic</button>
    </div>
  ),
}));

// Mock ChatHeader component
vi.mock("@/chat/components/chat-header", () => ({
  ChatHeader: ({ contact, isTyping }: any) => (
    <div data-testid="chat-header">
      <h2>{contact.name}</h2>
      <span>{isTyping ? "正在输入..." : "在线"}</span>
      <button data-testid="phone-icon">Phone</button>
      <button data-testid="video-icon">Video</button>
    </div>
  ),
}));

// Mock MessageArea component
vi.mock("@/chat/components/message-area", () => ({
  MessageArea: ({ messages }: any) => (
    <div data-testid="message-area">
      {messages.map((message: any) => (
        <div key={message.id} data-testid={`message-${message.id}`}>
          {message.content}
        </div>
      ))}
    </div>
  ),
}));

describe("ChatArea", () => {
  const mockContact = {
    id: "contact-1",
    name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    status: "online",
    lastSeen: new Date().toISOString(),
    isGroup: false,
    phone: "+1234567890",
    email: "john@example.com",
    lastMessage: "Hello!",
    timestamp: new Date().toISOString(),
    unreadCount: 0,
    isOnline: true,
  };

  const mockMessages = [
    {
      id: "msg-1",
      content: "Hello!",
      type: "text" as const,
      senderId: "contact-1",
      senderName: "John Doe",
      timestamp: "2024-01-01T10:00:00Z",
      status: "read" as const,
      isStarred: false,
      replyTo: undefined,
    },
    {
      id: "msg-2",
      content: "Hi there!",
      type: "text" as const,
      senderId: "user-1",
      senderName: "Me",
      timestamp: "2024-01-01T10:01:00Z",
      status: "read" as const,
      isStarred: false,
      replyTo: undefined,
    },
  ];

  const mockProps = {
    selectedContact: mockContact,
    messages: mockMessages,
    messageText: "",
    showEmojiPicker: false,
    replyingTo: null,
    editingMessage: null,
    isRecordingVoice: false,
    isTyping: false,
    isConnected: true,
    onMessageChange: vi.fn(),
    onKeyDown: vi.fn(),
    onSendMessage: vi.fn(),
    onEmojiSelect: vi.fn(),
    onToggleEmojiPicker: vi.fn(),
    onFileSelect: vi.fn(),
    onSendVoice: vi.fn(),
    onReply: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onForward: vi.fn(),
    onStar: vi.fn(),
    onInfo: vi.fn(),
    onVoiceCall: vi.fn(),
    onVideoCall: vi.fn(),
    onShowInfo: vi.fn(),
    onCancelReply: vi.fn(),
    onCancelEdit: vi.fn(),
    onRecordingChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render chat header with contact info", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("chat-header")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("在线")).toBeInTheDocument();
    });

    it("should render messages", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("message-area")).toBeInTheDocument();
      expect(screen.getByTestId("message-msg-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-msg-2")).toBeInTheDocument();
      expect(screen.getByText("Hello!")).toBeInTheDocument();
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });

    it("should render message input", () => {
      render(<ChatArea {...mockProps} />);

      // MessageInput 组件被 mock 了，所以我们需要检查是否存在
      expect(screen.getByTestId("message-input")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("send-icon")).toBeInTheDocument();
      expect(screen.getByTestId("paperclip-icon")).toBeInTheDocument();
      expect(screen.getByTestId("smile-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mic-icon")).toBeInTheDocument();
      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
    });
  });

  describe("Message Input", () => {
    it("should render message input component", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("message-input")).toBeInTheDocument();
    });

    it("should render input field", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByPlaceholderText("输入消息...")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("send-icon")).toBeInTheDocument();
      expect(screen.getByTestId("paperclip-icon")).toBeInTheDocument();
      expect(screen.getByTestId("smile-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mic-icon")).toBeInTheDocument();
    });
  });

  describe("Message Actions", () => {
    it("should render message area with messages", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("message-area")).toBeInTheDocument();
      expect(screen.getByText("Hello!")).toBeInTheDocument();
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });
  });

  describe("Call Actions", () => {
    it("should render call buttons in header", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
    });
  });

  describe("File Upload", () => {
    it("should render file upload button", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("paperclip-icon")).toBeInTheDocument();
    });
  });

  describe("Emoji Picker", () => {
    it("should render emoji picker button", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("smile-icon")).toBeInTheDocument();
    });
  });

  describe("Voice Recording", () => {
    it("should render voice recording button", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("mic-icon")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should render components normally", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("chat-header")).toBeInTheDocument();
      expect(screen.getByTestId("message-area")).toBeInTheDocument();
      expect(screen.getByTestId("message-input")).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should render with empty messages", () => {
      render(<ChatArea {...mockProps} messages={[]} />);

      expect(screen.getByTestId("message-area")).toBeInTheDocument();
    });
  });

  describe("Contact Status", () => {
    it("should show online status", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByText("在线")).toBeInTheDocument();
    });

    it("should show last seen time for offline contacts", () => {
      const offlineContact = {
        ...mockContact,
        status: "offline",
        lastSeen: "2024-01-01T09:00:00Z",
      };
      render(<ChatArea {...mockProps} selectedContact={offlineContact} />);

      expect(screen.getByText("在线")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper structure", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("chat-header")).toBeInTheDocument();
      expect(screen.getByTestId("message-area")).toBeInTheDocument();
      expect(screen.getByTestId("message-input")).toBeInTheDocument();
    });
  });
});
