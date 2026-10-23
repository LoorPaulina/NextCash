"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  formatAxisCurrency,
  formatCurrency,
  getYAxisTicks,
  type CashflowTotals,
  type MonthlyCashflow,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";

// Bright brand colors: used only for chart bars and legend dots.
const chartConfig = {
  income: {
    label: "Income",
    color: "#7AC00C",
    icon: IncomeLegendIcon,
  },
  expenses: {
    label: "Expenses",
    color: "#F07C1E",
    icon: ExpensesLegendIcon,
  },
} satisfies ChartConfig;

function IncomeLegendIcon() {
  return <span className="size-2.5 rounded-full bg-(--color-income)" />;
}

function ExpensesLegendIcon() {
  return <span className="size-2.5 rounded-full bg-(--color-expenses)" />;
}

type CashflowChartProps = {
  year: number;
  data: MonthlyCashflow[];
  totals: CashflowTotals;
};

export default function CashflowChart({ year, data, totals }: CashflowChartProps) {
  const maxValue = Math.max(
    0,
    ...data.flatMap((month) => [month.income, month.expenses]),
  );
  const ticks = getYAxisTicks(maxValue);
  const topTick = ticks[ticks.length - 1] ?? 0;

  const chartSummary = `Monthly cashflow for ${year}: total income ${formatCurrency(totals.income)}, total expenses ${formatCurrency(totals.expenses)}. Monthly figures are in the table that follows.`;

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="min-w-0 lg:flex-[7]">
        {/* role="img" hides the chart's children from assistive tech, so the data table is a sibling, not a child. */}
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label={chartSummary}
          className="aspect-auto h-80 w-full"
        >
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              ticks={ticks}
              domain={[0, topTick]}
              tickFormatter={(value: number) => formatAxisCurrency(value)}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
              }
            />
            <ChartLegend
              verticalAlign="top"
              content={<ChartLegendContent className="justify-end pt-0 pb-3" />}
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>

        <table className="sr-only">
          <caption>Monthly cashflow for {year}</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Income</th>
              <th scope="col">Expenses</th>
            </tr>
          </thead>
          <tbody>
            {data.map((month) => (
              <tr key={month.month}>
                <th scope="row">{month.month}</th>
                <td>{formatCurrency(month.income)}</td>
                <td>{formatCurrency(month.expenses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col lg:flex-[3] lg:border-l lg:pl-6">
        <CashflowStat label="Income" value={formatCurrency(totals.income)} />
        <CashflowStat label="Expenses" value={formatCurrency(totals.expenses)} />
        <CashflowStat
          label="Balance"
          value={formatCurrency(totals.balance)}
          valueClassName="font-semibold text-income-text"
        />
      </div>
    </div>
  );
}

type CashflowStatProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function CashflowStat({ label, value, valueClassName }: CashflowStatProps) {
  return (
    <div className="flex flex-col gap-2 border-b py-5 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className={cn("text-3xl", valueClassName)}>{value}</span>
    </div>
  );
}
