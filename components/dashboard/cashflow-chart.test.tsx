// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import CashflowChart from "@/components/dashboard/cashflow-chart";
import type { CashflowTotals, MonthlyCashflow } from "@/lib/dashboard";

// Recharts' ResponsiveContainer observes its size; jsdom does not implement ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function buildData(overrides: Partial<Record<number, Partial<MonthlyCashflow>>> = {}): MonthlyCashflow[] {
  return MONTH_NAMES.map((month, index) => ({
    month,
    income: 0,
    expenses: 0,
    ...overrides[index],
  }));
}

// Totals are passed in independently of the monthly data, as the server computes them.
const TOTALS: CashflowTotals = {
  income: 3000,
  expenses: 1000.5,
  balance: 1999.5,
};

const DATA = buildData({
  0: { income: 100, expenses: 40.5 },
  2: { income: 250.75 },
});

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  cleanup();
});

function renderChart(data: MonthlyCashflow[] = DATA, totals: CashflowTotals = TOTALS) {
  render(<CashflowChart year={2025} data={data} totals={totals} />);
  return screen.getByRole("table", { name: "Monthly cashflow for 2025" });
}

function rowForMonth(table: HTMLElement, month: string): HTMLElement {
  return within(table).getByRole("rowheader", { name: month }).closest("tr") as HTMLElement;
}

describe("CashflowChart", () => {
  describe("accessible data table", () => {
    it("has a header row plus one row for each of the 12 months", () => {
      const table = renderChart();

      expect(within(table).getAllByRole("row")).toHaveLength(13);
    });

    it("lists the months in calendar order", () => {
      const table = renderChart();

      const monthHeaders = within(table)
        .getAllByRole("rowheader")
        .map((header) => header.textContent);
      expect(monthHeaders).toEqual([...MONTH_NAMES]);
    });

    it("formats the income and expense values as pounds", () => {
      const table = renderChart();

      const january = within(rowForMonth(table, "Jan")).getAllByRole("cell");
      expect(january[0]).toHaveTextContent("£100.00");
      expect(january[1]).toHaveTextContent("£40.50");
    });

    it("shows zero values for months without transactions", () => {
      const table = renderChart();

      const june = within(rowForMonth(table, "Jun")).getAllByRole("cell");
      expect(june[0]).toHaveTextContent("£0.00");
      expect(june[1]).toHaveTextContent("£0.00");
    });

    it("shows the income for a month that has only income", () => {
      const table = renderChart();

      const march = within(rowForMonth(table, "Mar")).getAllByRole("cell");
      expect(march[0]).toHaveTextContent("£250.75");
    });
  });

  describe("summary statistics", () => {
    it("shows the total income in the Income stat", () => {
      renderChart();

      expect(screen.getByText("£3,000.00").parentElement).toHaveTextContent("Income");
    });

    it("shows the total expenses in the Expenses stat", () => {
      renderChart();

      expect(screen.getByText("£1,000.50").parentElement).toHaveTextContent("Expenses");
    });

    it("shows the balance in the Balance stat", () => {
      renderChart();

      expect(screen.getByText("Balance").parentElement).toHaveTextContent("£1,999.50");
    });
  });

  describe("chart summary", () => {
    it("exposes a text summary of the year's totals on the chart image", () => {
      renderChart();

      expect(
        screen.getByRole("img", {
          name: /Monthly cashflow for 2025: total income £3,000\.00, total expenses £1,000\.50/,
        }),
      ).toBeInTheDocument();
    });
  });
});
