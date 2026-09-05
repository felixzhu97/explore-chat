import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RegisterPage from "@/app/register/page";

const mockRegister = vi.fn().mockResolvedValue({ success: true });
const mockPush = vi.fn();

const mockUseAuth: any = {
  register: mockRegister,
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
    back: vi.fn(),
  }),
}));

vi.mock("@/src/shared/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "register.title": "Get started on Instagram",
        "register.subtitle":
          "Sign up to see photos and videos from your friends.",
        "register.mobileOrEmail": "Mobile number or email",
        "register.mobileOrEmailPlaceholder": "Mobile number or email",
        "register.contactInfoNotePrefix":
          "You may receive notifications from us. ",
        "register.learnWhyContact":
          "Learn why we ask for your contact information.",
        "register.password": "Password",
        "register.passwordPlaceholder": "Password",
        "register.birthday": "Birthday",
        "register.month": "Month",
        "register.day": "Day",
        "register.year": "Year",
        "register.name": "Name",
        "register.fullNamePlaceholder": "Full name",
        "register.username": "Username",
        "register.usernamePlaceholder": "Username",
        "register.contactUploadPrefix":
          "People who use our service may have uploaded your contact information to Instagram. ",
        "register.learnMore": "Learn more.",
        "register.agreeTermsPrefix":
          "By tapping Submit, you agree to create an account and to Instagram's ",
        "register.terms": "Terms",
        "register.privacyPolicy": "Privacy Policy",
        "register.cookiesPolicy": "Cookies Policy",
        "register.agreeTermsSuffix": ".",
        "register.privacyNote": "The Privacy Policy describes...",
        "register.submit": "Submit",
        "register.submitting": "Submitting...",
        "register.alreadyHaveAccount": "I already have an account",
        "register.meta": "Meta",
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

vi.mock("@/shared/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange?.("January")}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  return {
    ...actual,
    ChevronLeft: () =>
      React.createElement("span", { "data-testid": "chevron-left" }),
    HelpCircle: () =>
      React.createElement("span", { "data-testid": "help-circle" }),
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isLoading = false;
    mockUseAuth.error = null;
  });

  describe("Basic Rendering", () => {
    it("should render title and subtitle", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("heading", { name: /get started on instagram/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Sign up to see photos and videos from your friends/),
      ).toBeInTheDocument();
    });

    it("should render form inputs", () => {
      render(<RegisterPage />);
      expect(
        screen.getByPlaceholderText("Mobile number or email"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Full name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("button", { name: "Submit" }),
      ).toBeInTheDocument();
    });

    it("should render already have account button", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("button", { name: "I already have an account" }),
      ).toBeInTheDocument();
    });

    it("should render header with back and Meta", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Meta")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should update mobile or email field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      const input = screen.getByPlaceholderText("Mobile number or email");
      await user.type(input, "test@example.com");
      expect(input).toHaveValue("test@example.com");
    });

    it("should update password field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      const input = screen.getByPlaceholderText("Password");
      await user.type(input, "password123");
      expect(input).toHaveValue("password123");
    });

    it("should update username field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      const input = screen.getByPlaceholderText("Username");
      await user.type(input, "testuser");
      expect(input).toHaveValue("testuser");
    });

    it("should navigate to login on I already have an account", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      await user.click(
        screen.getByRole("button", { name: "I already have an account" }),
      );
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  describe("Form Submission", () => {
    it("should submit with valid email, password and username", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      await user.type(
        screen.getByPlaceholderText("Mobile number or email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.type(screen.getByPlaceholderText("Username"), "testuser");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });
    });

    it("should not submit with invalid email", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      await user.type(
        screen.getByPlaceholderText("Mobile number or email"),
        "notanemail",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.type(screen.getByPlaceholderText("Username"), "testuser");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(mockRegister).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Please enter a valid email/),
      ).toBeInTheDocument();
    });

    it("should navigate to home on success", async () => {
      mockRegister.mockResolvedValueOnce({ success: true });
      const user = userEvent.setup();
      render(<RegisterPage />);
      await user.type(
        screen.getByPlaceholderText("Mobile number or email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.type(screen.getByPlaceholderText("Username"), "testuser");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Loading and Error", () => {
    it("should show loading state", () => {
      mockUseAuth.isLoading = true;
      render(<RegisterPage />);
      expect(
        screen.getByRole("button", { name: "Submitting..." }),
      ).toBeDisabled();
    });

    it("should display error message", () => {
      mockUseAuth.error = "Email already in use";
      render(<RegisterPage />);
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });
});
