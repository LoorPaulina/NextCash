import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_DESCRIPTION_LENGTH,
  transactionSchema,
} from "@/lib/validations/transaction";

const NOW = new Date("2026-10-22T12:00:00.000Z");

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    transactionType: "income",
    categoryId: 1,
    date: new Date("2026-10-01T00:00:00.000Z"),
    amount: 25.5,
    description: "Monthly salary",
    ...overrides,
  };
}

function firstIssue(input: unknown) {
  const result = transactionSchema.safeParse(input);

  if (result.success) {
    throw new Error("Expected the schema to reject the input");
  }

  return result.error.issues[0];
}

describe("transactionSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("valid input", () => {
    it("accepts a complete income transaction", () => {
      expect(transactionSchema.safeParse(validInput()).success).toBe(true);
    });

    it("accepts an outcome transaction type", () => {
      expect(transactionSchema.safeParse(validInput({ transactionType: "outcome" })).success).toBe(
        true,
      );
    });

    it("accepts a numeric string amount and coerces it to a number", () => {
      const result = transactionSchema.safeParse(validInput({ amount: "12.75" }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(12.75);
      }
    });

    it("accepts a numeric string categoryId and coerces it to a number", () => {
      const result = transactionSchema.safeParse(validInput({ categoryId: "3" }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBe(3);
      }
    });

    it("accepts a description of exactly MAX_DESCRIPTION_LENGTH characters", () => {
      const description = "a".repeat(MAX_DESCRIPTION_LENGTH);

      expect(transactionSchema.safeParse(validInput({ description })).success).toBe(true);
    });

    it("accepts a date that is today", () => {
      const today = new Date("2026-10-22T00:00:00.000Z");

      expect(transactionSchema.safeParse(validInput({ date: today })).success).toBe(true);
    });
  });

  describe("amount", () => {
    it("rejects an amount of 0", () => {
      const issue = firstIssue(validInput({ amount: 0 }));

      expect(issue.path).toEqual(["amount"]);
      expect(issue.message).toEqual(expect.any(String));
      expect(issue.message.length).toBeGreaterThan(0);
    });

    it("rejects a negative amount", () => {
      const issue = firstIssue(validInput({ amount: -5 }));

      expect(issue.path).toEqual(["amount"]);
    });

    it("rejects a non-numeric amount", () => {
      const issue = firstIssue(validInput({ amount: "abc" }));

      expect(issue.path).toEqual(["amount"]);
      expect(issue.message.length).toBeGreaterThan(0);
    });

    it("accepts the smallest positive amount of 0.01", () => {
      expect(transactionSchema.safeParse(validInput({ amount: 0.01 })).success).toBe(true);
    });
  });

  describe("description", () => {
    it("accepts a description of exactly 300 characters", () => {
      expect(
        transactionSchema.safeParse(validInput({ description: "a".repeat(300) })).success,
      ).toBe(true);
    });

    it("rejects a description of 301 characters", () => {
      const issue = firstIssue(validInput({ description: "a".repeat(301) }));

      expect(issue.path).toEqual(["description"]);
      expect(issue.message.length).toBeGreaterThan(0);
    });
  });

  describe("date", () => {
    it("rejects a date in the future", () => {
      const issue = firstIssue(validInput({ date: new Date("2026-10-23T00:00:00.000Z") }));

      expect(issue.path).toEqual(["date"]);
      expect(issue.message.length).toBeGreaterThan(0);
    });

    it("rejects a value that is not a Date", () => {
      const issue = firstIssue(validInput({ date: "2026-10-01" }));

      expect(issue.path).toEqual(["date"]);
    });
  });

  describe("categoryId", () => {
    it("rejects a missing categoryId", () => {
      const withoutCategory: Record<string, unknown> = validInput();
      delete withoutCategory.categoryId;
      const issue = firstIssue(withoutCategory);

      expect(issue.path).toEqual(["categoryId"]);
      expect(issue.message.length).toBeGreaterThan(0);
    });

    it("rejects a categoryId of 0, which is the form placeholder", () => {
      const issue = firstIssue(validInput({ categoryId: 0 }));

      expect(issue.path).toEqual(["categoryId"]);
    });

    it("rejects a categoryId that is not an integer", () => {
      const issue = firstIssue(validInput({ categoryId: 1.5 }));

      expect(issue.path).toEqual(["categoryId"]);
    });
  });

  describe("transactionType", () => {
    it("rejects a transaction type outside the enum", () => {
      const issue = firstIssue(validInput({ transactionType: "transfer" }));

      expect(issue.path).toEqual(["transactionType"]);
      expect(issue.message.length).toBeGreaterThan(0);
    });

    it("rejects the category type name 'expense', which is not a form transaction type", () => {
      const issue = firstIssue(validInput({ transactionType: "expense" }));

      expect(issue.path).toEqual(["transactionType"]);
    });
  });

  // Known violation: CLAUDE.md requires Spanish error messages, but the schema
  // messages are currently in English (lib/validations/transaction.ts).
  it.todo("error messages are in Spanish per CLAUDE.md");
});
