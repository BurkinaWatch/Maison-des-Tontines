import { describe, it, expect } from "vitest";
import { generateOtp } from "../../../src/utils/phone.js";
import { formatCurrency, parseCurrency } from "../../../src/utils/currency.js";
import { isOverdue, calculateLateDays, getNextDate } from "../../../src/utils/date.js";

describe("Utils", () => {
  describe("generateOtp", () => {
    it("should generate a 6-digit OTP by default", () => {
      const otp = generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("should generate a 4-digit OTP when length is 4", () => {
      const otp = generateOtp(4);
      expect(otp).toHaveLength(4);
    });
  });

  describe("formatCurrency", () => {
    it("should format XOF currency", () => {
      const formatted = formatCurrency(1500, "XOF");
      expect(formatted).toBe("XOF 1 500");
    });

    it("should format USD currency", () => {
      const formatted = formatCurrency(1500, "USD");
      expect(formatted).toBe("USD 1 500");
    });
  });

  describe("parseCurrency", () => {
    it("should parse valid currency string", () => {
      expect(parseCurrency("1,500.50")).toBe(1500.5);
      expect(parseCurrency("1500")).toBe(1500);
    });
  });

  describe("isOverdue", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(isOverdue(pastDate)).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(isOverdue(futureDate)).toBe(false);
    });
  });

  describe("calculateLateDays", () => {
    it("should calculate correct late days", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(calculateLateDays(pastDate)).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getNextDate", () => {
    it("should calculate monthly dates correctly", () => {
      const start = new Date("2024-01-15");
      const next = getNextDate(start, "monthly", 1);
      expect(next.getMonth()).toBe(1);
    });

    it("should calculate weekly dates correctly", () => {
      const start = new Date("2024-01-15");
      const next = getNextDate(start, "weekly", 1);
      expect(next.getDate()).toBe(22);
    });
  });
});
