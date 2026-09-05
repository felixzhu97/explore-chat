import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginPage from "@/app/login/page";

const mockLogin = vi.fn();
const mockPush = vi.fn();
const mockBack = vi.fn();

const mockUseAuth: any = {
  login: mockLogin,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
};

vi.mock("@/auth/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

vi.mock("@/src/shared/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "login.logIntoInstagram": "Log into Instagram",
        "login.usernamePlaceholder": "Mobile number, username or email",
        "login.passwordPlaceholder": "Password",
        "login.logIn": "Log in",
        "login.loggingIn": "Logging in...",
        "login.forgotPassword": "Forgot password?",
        "login.logInWithFacebook": "Log in with Facebook",
        "login.createNewAccount": "Create new account",
        "login.meta": "Meta",
        "login.footerLinks":
          "Meta About Blog Jobs Help API Privacy Terms Locations Instagram Lite Meta AI Threads Contact Uploading & Non-Users Meta Verified",
        "login.language": "English",
        "login.copyright": "© 2026 Instagram from Meta",
        "login.settings": "Settings",
        "login.taglinePart1": "See everyday moments from your",
        "login.taglinePart2": "close friends.",
        "common.cancel": "Cancel",
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock("@/shared/ui/input", () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  ),
}));

vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  Settings: () => <span data-testid="settings-icon" />,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isLoading = false;
    mockUseAuth.error = null;
  });

  describe("Basic Rendering", () => {
    it("should render login form title", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("heading", { name: /log into instagram/i }),
      ).toBeInTheDocument();
    });

    it("should render form inputs", () => {
      render(<LoginPage />);
      expect(
        screen.getByPlaceholderText(/mobile number, username or email/i),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<LoginPage />);
      const buttons = screen.getAllByRole("button", { name: /log in/i });
      expect(buttons.some((b) => b.getAttribute("type") === "submit")).toBe(
        true,
      );
    });

    it("should render create new account button", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: /create new account/i }),
      ).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("link", { name: /forgot password/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should update username field", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      const input = screen.getByPlaceholderText(
        /mobile number, username or email/i,
      );
      await user.clear(input);
      await user.type(input, "test@example.com");
      expect(input).toHaveValue("test@example.com");
    });

    it("should update password field", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      const input = screen.getByPlaceholderText(/password/i);
      await user.clear(input);
      await user.type(input, "password123");
      expect(input).toHaveValue("password123");
    });

    it("should navigate to register on create new account click", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      await user.click(
        screen.getByRole("button", { name: /create new account/i }),
      );
      expect(mockPush).toHaveBeenCalledWith("/register");
    });
  });

  describe("Form Validation", () => {
    it("should have required fields", () => {
      render(<LoginPage />);
      expect(
        screen.getByPlaceholderText(/mobile number, username or email/i),
      ).toBeRequired();
      expect(screen.getByPlaceholderText(/password/i)).toBeRequired();
    });

    it("should have password input type", () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute(
        "type",
        "password",
      );
    });
  });

  describe("Loading States", () => {
    it("should show loading state", () => {
      mockUseAuth.isLoading = true;
      render(<LoginPage />);
      const submitButton = screen.getByRole("button", { name: /logging in/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message", () => {
      mockUseAuth.error = "Invalid credentials";
      render(<LoginPage />);
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  describe("Form Structure", () => {
    it("should have form containing submit button", () => {
      render(<LoginPage />);
      const submitBtn = screen.getByRole("button", { name: "Log in" });
      expect(submitBtn.closest("form")).toBeInTheDocument();
    });

    it("should have submit button type submit", () => {
      render(<LoginPage />);
      const submitBtn = screen.getByRole("button", { name: "Log in" });
      expect(submitBtn).toHaveAttribute("type", "submit");
    });
  });
});
