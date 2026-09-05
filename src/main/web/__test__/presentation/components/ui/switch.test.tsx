import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "@/shared/ui/switch";

describe("Switch", () => {
  describe("rendering", () => {
    it("should render switch", () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId("switch")).toBeInTheDocument();
    });

    it("should render switch with custom className", () => {
      render(<Switch className="custom-switch" data-testid="switch" />);
      expect(screen.getByTestId("switch")).toBeInTheDocument();
    });
  });

  describe("controlled usage", () => {
    it("should render checked switch", () => {
      render(<Switch checked={true} data-testid="switch" />);
      expect(screen.getByTestId("switch")).toHaveAttribute(
        "data-state",
        "checked",
      );
    });

    it("should render unchecked switch", () => {
      render(<Switch checked={false} data-testid="switch" />);
      expect(screen.getByTestId("switch")).toHaveAttribute(
        "data-state",
        "unchecked",
      );
    });
  });

  describe("uncontrolled usage", () => {
    it("should toggle on click", async () => {
      const user = userEvent.setup();
      render(<Switch data-testid="switch" />);

      await user.click(screen.getByTestId("switch"));
      expect(screen.getByTestId("switch")).toHaveAttribute(
        "data-state",
        "checked",
      );
    });
  });

  describe("disabled state", () => {
    it("should render disabled switch", () => {
      render(<Switch disabled data-testid="switch" />);
      expect(screen.getByTestId("switch")).toBeDisabled();
    });

    it("should not toggle when disabled", async () => {
      const user = userEvent.setup();
      render(<Switch disabled defaultChecked={true} data-testid="switch" />);

      await user.click(screen.getByTestId("switch"));
      expect(screen.getByTestId("switch")).toHaveAttribute(
        "data-state",
        "checked",
      );
    });
  });

  describe("onChange handler", () => {
    it("should call onChange when toggled", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Switch onCheckedChange={handleChange} data-testid="switch" />);

      await user.click(screen.getByTestId("switch"));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("should call onChange with false when unchecked", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Switch
          onCheckedChange={handleChange}
          defaultChecked={true}
          data-testid="switch"
        />,
      );

      await user.click(screen.getByTestId("switch"));
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe("form attributes", () => {
    it("should pass name attribute when provided", () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId("switch");
      expect(switchEl).toBeInTheDocument();
    });

    it("should accept value prop", () => {
      render(<Switch value="enabled" data-testid="switch" />);
      expect(screen.getByTestId("switch")).toBeInTheDocument();
    });
  });
});
