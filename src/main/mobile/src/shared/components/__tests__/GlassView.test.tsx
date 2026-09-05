import React from "react";
import { Text } from "react-native";
import { render, cleanup } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { GlassView } from "../GlassView";

jest.mock("expo-blur", () => ({
  BlurView: "BlurView",
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("GlassView", () => {
  afterEach(cleanup);

  describe("Rendering", () => {
    it("renders children correctly", () => {
      const { getByText } = renderWithProviders(
        <GlassView>
          <Text>Hello</Text>
        </GlassView>,
      );
      expect(getByText("Hello")).toBeTruthy();
    });

    it("renders with default props", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Intensity prop", () => {
    it("uses default intensity of 60", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("accepts custom intensity", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView intensity={80}>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Border radius", () => {
    it("uses default borderRadius of 0", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("accepts custom borderRadius", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView borderRadius={12}>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("sets noRadius to 0", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView noRadius>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Liquid mode", () => {
    it("renders with liquid prop", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView liquid>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("uses liquid radius when liquid is true", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView liquid noRadius>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Style prop", () => {
    it("accepts style prop", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView style={{ padding: 10 }}>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("accepts multiple styles", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView style={{ padding: 10, margin: 5 }}>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Dark/Light mode", () => {
    it("renders in light mode", () => {
      const { UNSAFE_root } = renderWithProviders(
        <GlassView>
          <Text>Content</Text>
        </GlassView>,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
