import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authMock } from "@/tests/mocks/clerk";
import { mockDb, resolvingQuery, rejectingQuery } from "@/tests/mocks/db";
import { revalidatePathMock } from "@/tests/mocks/next-cache";
import { transactionsTable } from "@/db/schema";
import {
  createTransaction,
  type CreateTransactionInput,
} from "@/app/dashboard/transaction/new/actions";

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

const SIGNED_IN_USER_ID = "user_123";

const WRITE_METHODS = ["values"] as const;

function validInput(
  overrides: Partial<CreateTransactionInput> = {},
): CreateTransactionInput {
  return {
    transactionType: "outcome",
    categoryId: 2,
    amount: 42.5,
    description: "Groceries",
    transactionDate: "2025-03-10",
    ...overrides,
  };
}

describe("createTransaction", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: SIGNED_IN_USER_ID });
    mockDb.insert.mockReturnValue(resolvingQuery([], WRITE_METHODS));
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("when there is no signed-in user", () => {
    it("returns an Unauthorized failure", async () => {
      authMock.mockResolvedValue({ userId: null });

      const result = await createTransaction(validInput());

      expect(result).toEqual({ success: false, message: "Unauthorized" });
    });

    it("does not insert anything into the database", async () => {
      authMock.mockResolvedValue({ userId: null });

      await createTransaction(validInput());

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it("does not revalidate the transaction list", async () => {
      authMock.mockResolvedValue({ userId: null });

      await createTransaction(validInput());

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  describe("when the input is invalid", () => {
    it("returns the first validation message when the amount is 0", async () => {
      const result = await createTransaction(validInput({ amount: 0 }));

      expect(result).toEqual({
        success: false,
        message: "Amount must be greater than 0",
      });
    });

    it("returns a failure when the transaction date is not an ISO date", async () => {
      const result = await createTransaction(
        validInput({ transactionDate: "10/03/2025" }),
      );

      expect(result.success).toBe(false);
      expect(result.message.length).toBeGreaterThan(0);
    });

    it("does not insert anything into the database", async () => {
      await createTransaction(validInput({ amount: 0 }));

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it("does not revalidate the transaction list", async () => {
      await createTransaction(validInput({ amount: 0 }));

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  describe("when the input is valid", () => {
    it("inserts into the transactions table", async () => {
      await createTransaction(validInput());

      expect(mockDb.insert).toHaveBeenCalledWith(transactionsTable);
    });

    it("stores the row with the userId from auth(), not from the input", async () => {
      const input = { ...validInput(), userId: "attacker_456" } as CreateTransactionInput;

      await createTransaction(input);

      const insertedRow = mockDb.insert.mock.results[0]?.value.values.mock.calls[0]?.[0];
      expect(insertedRow).toMatchObject({ userId: SIGNED_IN_USER_ID });
    });

    it("stores the category, description and transaction date as given", async () => {
      await createTransaction(validInput());

      const insertedRow = mockDb.insert.mock.results[0]?.value.values.mock.calls[0]?.[0];
      expect(insertedRow).toEqual({
        userId: SIGNED_IN_USER_ID,
        description: "Groceries",
        amount: "42.5",
        transactionDate: "2025-03-10",
        categoryId: 2,
      });
    });

    it("stores the amount as a plain decimal string", async () => {
      await createTransaction(validInput({ amount: 12.34 }));

      const insertedRow = mockDb.insert.mock.results[0]?.value.values.mock.calls[0]?.[0];
      expect(insertedRow.amount).toBe("12.34");
    });

    it("stores a whole-number amount without a decimal part", async () => {
      await createTransaction(validInput({ amount: 10 }));

      const insertedRow = mockDb.insert.mock.results[0]?.value.values.mock.calls[0]?.[0];
      expect(insertedRow.amount).toBe("10");
    });

    it("returns a success result with the confirmation message", async () => {
      const result = await createTransaction(validInput());

      expect(result).toEqual({ success: true, message: "Transaction created" });
    });

    it("revalidates the transaction list only after a successful insert", async () => {
      await createTransaction(validInput());

      expect(revalidatePathMock).toHaveBeenCalledTimes(1);
      expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/transaction");
    });
  });

  describe("when the database write fails", () => {
    beforeEach(() => {
      mockDb.insert.mockReturnValue(
        rejectingQuery(new Error("connection terminated"), WRITE_METHODS),
      );
    });

    it("returns a failure result with a generic message", async () => {
      const result = await createTransaction(validInput());

      expect(result).toEqual({
        success: false,
        message: "Could not save the transaction",
      });
    });

    it("logs the underlying error to the console", async () => {
      await createTransaction(validInput());

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it("does not revalidate the transaction list", async () => {
      await createTransaction(validInput());

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  // Known gap: transactionSchema.refine rejects future dates, but
  // createTransactionSchema in actions.ts omits `date` and only checks the
  // transactionDate string format, so a future date reaches the database.
  // Source: app/dashboard/transaction/new/actions.ts:10-12.
  it.todo(
    "rejects a transactionDate in the future on the server (known gap: no date refine in actions.ts:10-12)",
  );

  // Known gap: transactionType is validated on its own but never compared with
  // the category type (income/expense). A categoryId for an expense category
  // can be saved with transactionType "income".
  // Source: app/dashboard/transaction/new/actions.ts:30-48 (categoryType is never loaded or compared).
  it.todo(
    "rejects a transactionType that does not match the category type (known gap: actions.ts:30-48)",
  );
});
