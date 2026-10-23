// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import RecentTransactions, {
  type RecentTransaction,
} from "@/components/dashboard/recent-transactions";

afterEach(() => {
  cleanup();
});

const TRANSACTIONS: RecentTransaction[] = [
  {
    id: 1,
    description: "March pay",
    transactionDate: "2025-03-01",
    categoryName: "Salary",
    categoryType: "income",
    amount: 1234.5,
  },
  {
    id: 2,
    description: "Weekly shop",
    transactionDate: "2025-03-15",
    categoryName: "Groceries",
    categoryType: "expense",
    amount: 56.2,
  },
];

function rowFor(description: string): HTMLElement {
  const row = screen.getByText(description).closest("tr");

  if (!row) {
    throw new Error(`No table row found for "${description}"`);
  }

  return row;
}

describe("RecentTransactions", () => {
  describe("empty state", () => {
    it("shows a message naming the selected year when there are no transactions", () => {
      render(<RecentTransactions year={2025} transactions={[]} />);

      expect(screen.getByText("No transactions for 2025")).toBeInTheDocument();
    });

    it("renders no data rows other than the header and the empty message", () => {
      render(<RecentTransactions year={2025} transactions={[]} />);

      const table = screen.getByRole("table", { name: "Recent transactions for 2025" });
      expect(within(table).getAllByRole("row")).toHaveLength(2);
    });
  });

  describe("with transactions", () => {
    it("renders one row per transaction", () => {
      render(<RecentTransactions year={2025} transactions={TRANSACTIONS} />);

      const table = screen.getByRole("table", { name: "Recent transactions for 2025" });
      expect(within(table).getAllByRole("row")).toHaveLength(3);
      expect(screen.queryByText("No transactions for 2025")).not.toBeInTheDocument();
    });

    it("shows the transaction date as a long day, month and year", () => {
      render(<RecentTransactions year={2025} transactions={TRANSACTIONS} />);

      expect(within(rowFor("March pay")).getByText("1st Mar 2025")).toBeInTheDocument();
      expect(within(rowFor("Weekly shop")).getByText("15th Mar 2025")).toBeInTheDocument();
    });

    it("shows the category name in its row", () => {
      render(<RecentTransactions year={2025} transactions={TRANSACTIONS} />);

      expect(within(rowFor("March pay")).getByText("Salary")).toBeInTheDocument();
      expect(within(rowFor("Weekly shop")).getByText("Groceries")).toBeInTheDocument();
    });

    it("labels income and expense rows with the matching badge text", () => {
      render(<RecentTransactions year={2025} transactions={TRANSACTIONS} />);

      expect(within(rowFor("March pay")).getByText("Income")).toBeInTheDocument();
      expect(within(rowFor("Weekly shop")).getByText("Expense")).toBeInTheDocument();
    });

    it("formats each amount as pounds with two decimals", () => {
      render(<RecentTransactions year={2025} transactions={TRANSACTIONS} />);

      expect(within(rowFor("March pay")).getByText("£1,234.50")).toBeInTheDocument();
      expect(within(rowFor("Weekly shop")).getByText("£56.20")).toBeInTheDocument();
    });
  });

  describe("links", () => {
    it("links 'View All' to the transaction list", () => {
      render(<RecentTransactions year={2025} transactions={[]} />);

      expect(screen.getByRole("link", { name: "View All" })).toHaveAttribute(
        "href",
        "/dashboard/transaction",
      );
    });

    it("links 'Create New' to the new transaction form", () => {
      render(<RecentTransactions year={2025} transactions={[]} />);

      expect(screen.getByRole("link", { name: "Create New" })).toHaveAttribute(
        "href",
        "/dashboard/transaction/new",
      );
    });
  });
});
