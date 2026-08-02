import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { LiquidGlassBar } from "../LiquidGlassBar";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("LiquidGlassBar", () => {
  describe("Rendering", () => {
    it("renders liquid glass bar", () => {
      const { UNSAFE_root } = renderWithProviders(<LiquidGlassBar />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
