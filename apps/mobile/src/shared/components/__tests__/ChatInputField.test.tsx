import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ChatInputField } from "../ChatInputField";
import { ThemeProvider } from "@/shared/theme";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("ChatInputField", () => {
  const mockOnChangeText = jest.fn();
  const mockOnSend = jest.fn();
  const mockOnCameraPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it("should render TextInput for message input", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const inputs = UNSAFE_root.findAllByType(TextInput);
      expect(inputs).toHaveLength(1);
    });
  });

  describe("Value handling", () => {
    it("should display the provided value", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value="Hello there!"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      expect(input.props.value).toBe("Hello there!");
    });

    it("should call onChangeText when text changes", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent.changeText(input, "New message");

      expect(mockOnChangeText).toHaveBeenCalledWith("New message");
    });

    it("should call onChangeText for each keystroke", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent.changeText(input, "A");
      fireEvent.changeText(input, "AB");
      fireEvent.changeText(input, "ABC");

      expect(mockOnChangeText).toHaveBeenCalledTimes(3);
    });

    it("should update displayed value when prop changes", () => {
      const { rerender, UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value="Initial"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input1 = UNSAFE_root.findByType(TextInput);
      expect(input1.props.value).toBe("Initial");

      rerender(
        <ThemeProvider>
          <ChatInputField
            value="Updated"
            onChangeText={mockOnChangeText}
            onSend={mockOnSend}
          />
        </ThemeProvider>,
      );

      const input2 = UNSAFE_root.findByType(TextInput);
      expect(input2.props.value).toBe("Updated");
    });
  });

  describe("Send functionality", () => {
    it("should send message on submit editing", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value="Submit test"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent(input, "submitEditing");

      expect(mockOnSend).toHaveBeenCalledWith("Submit test");
    });

    it("should clear input after sending", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value="Test"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent(input, "submitEditing");

      expect(mockOnChangeText).toHaveBeenCalledWith("");
    });

    it("should trim message before sending", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value="  Trimmed message  "
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent(input, "submitEditing");

      expect(mockOnSend).toHaveBeenCalledWith("Trimmed message");
    });

    it("should not send empty message on submit", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent(input, "submitEditing");

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("should not send whitespace-only message", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value="   "
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      fireEvent(input, "submitEditing");

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe("onCameraPress callback", () => {
    it("should render with onCameraPress prop provided", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onCameraPress={mockOnCameraPress}
        />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Input constraints", () => {
    it("should have maxLength of 1000", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      expect(input.props.maxLength).toBe(1000);
    });

    it("should be multiline", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatInputField
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />,
      );

      const input = UNSAFE_root.findByType(TextInput);
      expect(input.props.multiline).toBe(true);
    });
  });
});
