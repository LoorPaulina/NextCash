import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { mockDb, resolvingQuery } from "@/tests/mocks/db";
import { getTransactions } from "@/data/getTransactions";

vi.mock("@/db", () => ({
  db: mockDb,
}));

const SELECT_METHODS = ["from", "innerJoin", "where", "orderBy"] as const;

const dialect = new PgDialect();

// Returns the SQL text and bound parameters of the WHERE clause passed to .where().
function compileWhereClause(): { sql: string; params: unknown[] } {
  const chain = mockDb.select.mock.results[0]?.value;
  const whereArgument = chain.where.mock.calls[0]?.[0];

  return dialect.sqlToQuery(whereArgument);
}

describe("getTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnValue(resolvingQuery([], SELECT_METHODS));
  });

  it("returns the rows produced by the query", async () => {
    const rows = [
      {
        id: 2,
        description: "Rent",
        amount: "850.00",
        transactionDate: "2025-05-01",
        categoryName: "Housing",
        categoryType: "expense",
      },
    ];
    mockDb.select.mockReturnValue(resolvingQuery(rows, SELECT_METHODS));

    await expect(getTransactions("user_123", 2025)).resolves.toEqual(rows);
  });

  it("reads from the transactions table joined to the categories table", async () => {
    await getTransactions("user_123", 2025);

    const chain = mockDb.select.mock.results[0]?.value;
    expect(chain.from).toHaveBeenCalledWith(transactionsTable);
    expect(chain.innerJoin).toHaveBeenCalledWith(
      categoriesTable,
      expect.anything(),
    );
  });

  it("filters by the given userId", async () => {
    await getTransactions("user_123", 2025);

    const { sql, params } = compileWhereClause();
    expect(sql).toContain('"user_id"');
    expect(params).toContain("user_123");
  });

  it("does not match transactions of other users when the userId differs", async () => {
    await getTransactions("user_999", 2025);

    const { params } = compileWhereClause();
    expect(params).toContain("user_999");
    expect(params).not.toContain("user_123");
  });

  it("limits the results to the start and end of the requested year", async () => {
    await getTransactions("user_123", 2025);

    const { sql, params } = compileWhereClause();
    expect(sql).toContain('"transaction_date" >=');
    expect(sql).toContain('"transaction_date" <=');
    expect(params).toEqual(expect.arrayContaining(["2025-01-01", "2025-12-31"]));
  });

  it("uses the year passed in, not the current year", async () => {
    await getTransactions("user_123", 2019);

    const { params } = compileWhereClause();
    expect(params).toEqual(expect.arrayContaining(["2019-01-01", "2019-12-31"]));
    expect(params).not.toContain("2025-01-01");
  });

  it("orders the results newest first, with id as a tie breaker", async () => {
    await getTransactions("user_123", 2025);

    const chain = mockDb.select.mock.results[0]?.value;
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
    expect(chain.orderBy.mock.calls[0]).toHaveLength(2);
  });
});
