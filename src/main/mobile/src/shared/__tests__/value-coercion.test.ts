import {
  toOptionalDate,
  toRequiredDate,
  toOptionalNumber,
} from "@/shared/value-coercion";

describe("valueCoercion", () => {
  describe("toOptionalDate", () => {
    it("should return undefined for undefined input", () => {
      const result = toOptionalDate(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined for null input", () => {
      const result = toOptionalDate(null as any);
      expect(result).toBeUndefined();
    });

    it("should return Date for string input", () => {
      const result = toOptionalDate("2024-01-15T10:30:00Z");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should return same Date for Date input", () => {
      const input = new Date("2024-06-20T15:45:00Z");
      const result = toOptionalDate(input);
      expect(result).toBe(input);
    });

    it("should handle empty string", () => {
      const result = toOptionalDate("");
      expect(result).toBeInstanceOf(Date);
    });

    it("should handle ISO date string", () => {
      const result = toOptionalDate("2024-12-25");
      expect(result).toBeInstanceOf(Date);
    });

    it("should handle invalid date string", () => {
      const result = toOptionalDate("not-a-date");
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe("toRequiredDate", () => {
    it("should return epoch date for undefined input", () => {
      const result = toRequiredDate(undefined);
      expect(result).toEqual(new Date(0));
    });

    it("should return epoch date for null input", () => {
      const result = toRequiredDate(null as any);
      expect(result).toEqual(new Date(0));
    });

    it("should return Date for string input", () => {
      const result = toRequiredDate("2024-03-10T08:00:00Z");
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2024-03-10T08:00:00.000Z");
    });

    it("should return same Date for Date input", () => {
      const input = new Date("2024-07-15T12:00:00Z");
      const result = toRequiredDate(input);
      expect(result).toBe(input);
    });

    it("should handle empty string as epoch", () => {
      const result = toRequiredDate("");
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe("toOptionalNumber", () => {
    it("should return undefined for undefined input", () => {
      const result = toOptionalNumber(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined for null input", () => {
      const result = toOptionalNumber(null as any);
      expect(result).toBeUndefined();
    });

    it("should return same number for number input", () => {
      const result = toOptionalNumber(42);
      expect(result).toBe(42);
    });

    it("should convert string to number", () => {
      const result = toOptionalNumber("123");
      expect(result).toBe(123);
    });

    it("should convert numeric string", () => {
      const result = toOptionalNumber("0");
      expect(result).toBe(0);
    });

    it("should handle negative numbers", () => {
      const result = toOptionalNumber(-50);
      expect(result).toBe(-50);
    });

    it("should handle decimal numbers", () => {
      const result = toOptionalNumber("3.14");
      expect(result).toBe(3.14);
    });

    it("should handle string with whitespace", () => {
      const result = toOptionalNumber("  42  ");
      expect(result).toBe(42);
    });

    it("should handle empty string", () => {
      const result = toOptionalNumber("");
      expect(result).toBe(0);
    });
  });
});
