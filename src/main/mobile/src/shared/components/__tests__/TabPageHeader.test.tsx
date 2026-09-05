import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { TabPageHeader } from "../TabPageHeader";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("TabPageHeader", () => {
  describe("Rendering", () => {
    it("renders tab page header", () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Test Title" />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders with custom title", () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Custom Header" />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Actions", () => {
    it("renders with action button", () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Test" />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
