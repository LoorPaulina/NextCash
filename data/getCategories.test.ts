import { beforeEach, describe, expect, it, vi } from "vitest";
import { categoriesTable } from "@/db/schema";
import { mockDb, rejectingQuery, resolvingQuery } from "@/tests/mocks/db";
import { getCategories } from "@/data/getCategories";

vi.mock("@/db", () => ({
  db: mockDb,
}));

const SELECT_METHODS = ["from"] as const;

describe("getCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the categories returned by the database", async () => {
    const categories = [
      { id: 1, name: "Salary", type: "income" },
      { id: 2, name: "Groceries", type: "expense" },
    ];
    mockDb.select.mockReturnValue(resolvingQuery(categories, SELECT_METHODS));

    await expect(getCategories()).resolves.toEqual(categories);
  });

  it("returns an empty list when there are no categories", async () => {
    mockDb.select.mockReturnValue(resolvingQuery([], SELECT_METHODS));

    await expect(getCategories()).resolves.toEqual([]);
  });

  it("selects from the categories table", async () => {
    mockDb.select.mockReturnValue(resolvingQuery([], SELECT_METHODS));

    await getCategories();

    expect(mockDb.select.mock.results[0]?.value.from).toHaveBeenCalledWith(categoriesTable);
  });

  it("propagates database errors to the caller", async () => {
    mockDb.select.mockReturnValue(rejectingQuery(new Error("db down"), SELECT_METHODS));

    await expect(getCategories()).rejects.toThrow("db down");
  });
});
