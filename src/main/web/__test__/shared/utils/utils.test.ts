import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn } from "@/src/shared/utils/utils";

describe("cn utility function", () => {
  describe("Basic Class Name Combination", () => {
    it("should combine two class names", () => {
      const result = cn("class-one", "class-two");
      expect(result).toBe("class-one class-two");
    });

    it("should combine multiple class names", () => {
      const result = cn("a", "b", "c", "d");
      expect(result).toBe("a b c d");
    });

    it("should handle single class name", () => {
      const result = cn("single-class");
      expect(result).toBe("single-class");
    });

    it("should handle no inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle empty string", () => {
      const result = cn("");
      expect(result).toBe("");
    });

    it("should filter out empty strings", () => {
      const result = cn("class-one", "", "class-two", "");
      expect(result).toBe("class-one class-two");
    });
  });

  describe("Conditional Classes", () => {
    it("should include class when condition is true", () => {
      const result = cn("base-class", true && "conditional-class");
      expect(result).toBe("base-class conditional-class");
    });

    it("should exclude class when condition is false", () => {
      const result = cn("base-class", false && "conditional-class");
      expect(result).toBe("base-class");
    });

    it("should handle truthy values", () => {
      const result = cn("base", 1 && "one", "two");
      expect(result).toContain("base");
      expect(result).toContain("one");
      expect(result).toContain("two");
    });

    it("should handle falsy values", () => {
      const result = cn("base", 0 && "zero", false && "false");
      expect(result).toBe("base");
    });
  });

  describe("Undefined and Null Values", () => {
    it("should filter out undefined values", () => {
      const result = cn("base-class", undefined);
      expect(result).toBe("base-class");
    });

    it("should filter out null values", () => {
      const result = cn("base-class", null);
      expect(result).toBe("base-class");
    });

    it("should handle mixed undefined and null", () => {
      const result = cn(undefined, "class1", null, "class2", undefined);
      expect(result).toBe("class1 class2");
    });
  });

  describe("Object Classes", () => {
    it("should include class when object value is true", () => {
      const result = cn({ "active-class": true });
      expect(result).toBe("active-class");
    });

    it("should exclude class when object value is false", () => {
      const result = cn({ "inactive-class": false });
      expect(result).toBe("");
    });

    it("should include multiple true object classes", () => {
      const result = cn({ "class-a": true, "class-b": true });
      expect(result).toContain("class-a");
      expect(result).toContain("class-b");
    });

    it("should filter out false object classes", () => {
      const result = cn({ "class-a": true, "class-b": false });
      expect(result).toBe("class-a");
    });

    it("should combine string and object classes", () => {
      const result = cn("base-class", { "active-class": true, "disabled": false });
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
      expect(result).not.toContain("disabled");
    });
  });

  describe("Array Classes", () => {
    it("should flatten nested arrays", () => {
      const result = cn(["class-one", "class-two"], "class-three");
      expect(result).toBe("class-one class-two class-three");
    });

    it("should handle empty arrays", () => {
      const result = cn([], "class");
      expect(result).toBe("class");
    });

    it("should handle multiple nested arrays", () => {
      const result = cn(["a", "b"], ["c", "d"], ["e"]);
      expect(result).toBe("a b c d e");
    });

    it("should handle arrays with empty strings", () => {
      const result = cn(["class1", "", "class2"], "");
      expect(result).toBe("class1 class2");
    });

    it("should handle deeply nested arrays", () => {
      const result = cn([["a", "b"], ["c"]]);
      expect(result).toBe("a b c");
    });
  });

  describe("Mixed Input Types", () => {
    it("should handle mixed types of inputs", () => {
      const result = cn(
        "base",
        { "conditional": true },
        ["array-item"],
        false && "ignored",
        undefined,
        null
      );
      expect(result).toContain("base");
      expect(result).toContain("conditional");
      expect(result).toContain("array-item");
      expect(result).not.toContain("ignored");
    });

    it("should handle complex nested structures", () => {
      const result = cn(
        "level-1",
        ["level-2a", "level-2b"],
        { "level-3a": true, "level-3b": false },
        [["nested"]]
      );
      expect(result).toContain("level-1");
      expect(result).toContain("level-2a");
      expect(result).toContain("level-2b");
      expect(result).toContain("level-3a");
      expect(result).toContain("nested");
    });
  });

  describe("Edge Cases", () => {
    it("should handle whitespace-only strings", () => {
      const result = cn("  ", "class", "  ");
      // cn preserves whitespace, it just filters falsy values
      expect(result).toContain("class");
    });

    it("should handle special characters in class names", () => {
      const result = cn("class-name", "class_name", "class.name");
      expect(result).toBe("class-name class_name class.name");
    });

    it("should handle numeric values", () => {
      const result = cn(0, 1, "class");
      // cn filters out only null, undefined, and boolean false
      expect(result).toContain("class");
    });

    it("should handle NaN values", () => {
      const result = cn(NaN, "class");
      expect(result).toBe("class");
    });

    it("should preserve class name order", () => {
      const result = cn("first", "second", "third");
      expect(result).toBe("first second third");
    });
  });

  describe("Tailwind CSS Integration", () => {
    it("should combine multiple Tailwind classes", () => {
      const result = cn(
        "flex",
        "items-center",
        "justify-between",
        "p-4",
        "bg-white"
      );
      expect(result).toContain("flex");
      expect(result).toContain("items-center");
      expect(result).toContain("justify-between");
      expect(result).toContain("p-4");
      expect(result).toContain("bg-white");
    });

    it("should handle conditional Tailwind classes", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn(
        "base-class",
        isActive && "bg-blue-500",
        isDisabled && "opacity-50"
      );

      expect(result).toContain("base-class");
      expect(result).toContain("bg-blue-500");
      expect(result).not.toContain("opacity-50");
    });

    it("should handle responsive Tailwind classes", () => {
      const result = cn(
        "w-full",
        "md:w-1/2",
        "lg:w-1/3"
      );
      expect(result).toBe("w-full md:w-1/2 lg:w-1/3");
    });
  });

  describe("Performance", () => {
    it("should handle many inputs efficiently", () => {
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...classes);
      
      classes.forEach((cls) => {
        expect(result).toContain(cls);
      });
    });

    it("should handle deeply nested arrays", () => {
      let nested: any = ["class"];
      for (let i = 0; i < 10; i++) {
        nested = [nested];
      }
      const result = cn(nested);
      expect(result).toContain("class");
    });
  });
});

describe("cn utility with clsx behavior", () => {
  it("should use clsx for class name resolution", () => {
    const result = cn("a", "b");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle clsx keyvals behavior", () => {
    const isActive = true;
    const isDisabled = false;
    const variant = "primary";

    const result = cn(
      "btn",
      {
        "btn-active": isActive,
        "btn-disabled": isDisabled,
      },
      {
        "btn-primary": variant === "primary",
        "btn-secondary": variant === "secondary",
      }
    );

    expect(result).toContain("btn");
    expect(result).toContain("btn-active");
    expect(result).not.toContain("btn-disabled");
    expect(result).toContain("btn-primary");
    expect(result).not.toContain("btn-secondary");
  });

  it("should handle string arrays", () => {
    const baseClasses = ["base", "component"];
    const modifierClasses = ["modifier1", "modifier2"];

    const result = cn(baseClasses, modifierClasses);
    expect(result).toContain("base");
    expect(result).toContain("component");
    expect(result).toContain("modifier1");
    expect(result).toContain("modifier2");
  });
});
