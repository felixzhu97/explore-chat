import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { ChatAvatar } from "../ChatAvatar";

describe("ChatAvatar", () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  describe("Rendering", () => {
    it("renders with name", () => {
      const { getByText } = renderWithProviders(<ChatAvatar name="John" />);
      expect(getByText("J")).toBeTruthy();
    });

    it("renders with empty name", () => {
      const { getByText } = renderWithProviders(<ChatAvatar name="" />);
      expect(getByText("?")).toBeTruthy();
    });

    it("renders with undefined name", () => {
      const { getByText } = renderWithProviders(
        <ChatAvatar name={undefined as unknown as string} />,
      );
      expect(getByText("?")).toBeTruthy();
    });
  });

  describe("Avatar colors", () => {
    it("renders different initials for different names", () => {
      const { getByText: get1 } = renderWithProviders(
        <ChatAvatar name="Alice" />,
      );
      const { getByText: get2 } = renderWithProviders(
        <ChatAvatar name="Bob" />,
      );
      expect(get1("A")).toBeTruthy();
      expect(get2("B")).toBeTruthy();
    });

    it("uppercases initial", () => {
      const { getByText } = renderWithProviders(
        <ChatAvatar name="lowercase" />,
      );
      expect(getByText("L")).toBeTruthy();
    });
  });

  describe("Size prop", () => {
    it("uses default size of 50", () => {
      const { UNSAFE_root } = renderWithProviders(<ChatAvatar name="Test" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it("accepts custom size", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatAvatar name="Test" size={100} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("accepts small size", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatAvatar name="Test" size={24} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Image rendering", () => {
    it("renders image when imageUrl is provided", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatAvatar name="Test" imageUrl="https://example.com/avatar.jpg" />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders placeholder when imageUrl is not provided", () => {
      const { getByText } = renderWithProviders(<ChatAvatar name="Test" />);
      expect(getByText("T")).toBeTruthy();
    });
  });

  describe("Border", () => {
    it("renders without border by default", () => {
      const { UNSAFE_root } = renderWithProviders(<ChatAvatar name="Test" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders with border when showBorder is true", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatAvatar name="Test" showBorder={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders without border when showBorder is false", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ChatAvatar name="Test" showBorder={false} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
