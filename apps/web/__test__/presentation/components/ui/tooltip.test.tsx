import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";

describe("Tooltip", () => {
  describe("TooltipProvider", () => {
    it("should render provider with children", () => {
      render(
        <TooltipProvider>
          <div data-testid="provider-content">Provider Content</div>
        </TooltipProvider>,
      );
      expect(screen.getByTestId("provider-content")).toBeInTheDocument();
    });
  });

  describe("TooltipTrigger", () => {
    it("should render trigger button", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button data-testid="trigger">Hover</button>
            </TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
    });
  });

  describe("TooltipContent", () => {
    it("should render tooltip content when open", () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger asChild>
              <button>Hover</button>
            </TooltipTrigger>
            <TooltipContent data-testid="content">Helpful tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});
