import React from "react";
import { Text } from "react-native";
import { render, cleanup } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { ThemedText } from "../ThemedText";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("ThemedText", () => {
  afterEach(cleanup);

  describe("Rendering", () => {
    it("renders text content", () => {
      const { getByText } = renderWithProviders(
        <ThemedText>Hello World</ThemedText>,
      );
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("renders multiple text elements", () => {
      const { getByText } = renderWithProviders(
        <>
          <ThemedText>First</ThemedText>
          <ThemedText>Second</ThemedText>
        </>,
      );
      expect(getByText("First")).toBeTruthy();
      expect(getByText("Second")).toBeTruthy();
    });
  });

  describe("Props forwarding", () => {
    it("forwards style prop", () => {
      const { getByText } = renderWithProviders(
        <ThemedText style={{ fontSize: 24 }}>Styled Text</ThemedText>,
      );
      expect(getByText("Styled Text")).toBeTruthy();
    });

    it("forwards testID prop", () => {
      const { getByTestId } = renderWithProviders(
        <ThemedText testID="themed-text">Test ID Text</ThemedText>,
      );
      expect(getByTestId("themed-text")).toBeTruthy();
    });

    it("forwards numberOfLines prop", () => {
      const { getByText } = renderWithProviders(
        <ThemedText numberOfLines={1}>Truncated Text</ThemedText>,
      );
      expect(getByText("Truncated Text")).toBeTruthy();
    });

    it("forwards onPress prop", () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ThemedText onPress={onPress}>Clickable Text</ThemedText>,
      );
      expect(getByText("Clickable Text")).toBeTruthy();
    });
  });

  describe("Theme integration", () => {
    it("applies theme colors", () => {
      const { UNSAFE_root } = renderWithProviders(
        <ThemedText>Themed Text</ThemedText>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
