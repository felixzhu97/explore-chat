import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/shared/ui/checkbox";

describe("Checkbox", () => {
  describe("rendering", () => {
    it("should render checkbox", () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toBeInTheDocument();
    });

    it("should render checkbox with custom className", () => {
      render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toBeInTheDocument();
    });
  });

  describe("states", () => {
    it("should render unchecked checkbox by default", () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toHaveAttribute(
        "data-state",
        "unchecked",
      );
    });

    it("should render checked checkbox", () => {
      render(<Checkbox checked={true} data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toHaveAttribute(
        "data-state",
        "checked",
      );
    });

    it("should render indeterminate checkbox", () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toHaveAttribute(
        "data-state",
        "indeterminate",
      );
    });
  });

  describe("disabled state", () => {
    it("should render disabled checkbox", () => {
      render(<Checkbox disabled data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("should toggle on click", async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      await user.click(screen.getByTestId("checkbox"));
      expect(screen.getByTestId("checkbox")).toHaveAttribute(
        "data-state",
        "checked",
      );
    });

    it("should call onChange handler", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Checkbox onCheckedChange={handleChange} data-testid="checkbox" />,
      );

      await user.click(screen.getByTestId("checkbox"));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("form attributes", () => {
    it("should render checkbox with data-testid", () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toBeInTheDocument();
    });

    it("should accept value prop", () => {
      render(<Checkbox value="yes" data-testid="checkbox" />);
      expect(screen.getByTestId("checkbox")).toBeInTheDocument();
    });
  });

  describe("required attribute", () => {
    it("should accept required prop", () => {
      render(<Checkbox required data-testid="checkbox" />);
      const checkbox = screen.getByTestId("checkbox");
      expect(checkbox).toBeInTheDocument();
    });
  });
});
