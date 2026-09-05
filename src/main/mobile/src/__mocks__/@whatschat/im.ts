// Mock for @whatschat/im workspace package
const mock = {
  // Redux slices
  setChats: jest.fn(),
  addChat: jest.fn(),
  updateChat: jest.fn(),
  deleteChat: jest.fn(),
  setSelectedChat: jest.fn(),
  addMessage: jest.fn(),
  updateMessage: jest.fn(),
  deleteMessage: jest.fn(),
  setMessages: jest.fn(),

  // Re-export types if needed
  ChatType: {
    DIRECT: 'DIRECT',
    GROUP: 'GROUP',
  },
};

module.exports = mock;
