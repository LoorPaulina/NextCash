import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, type CategoryType } from "@/lib/dashboard";

export type RecentTransaction = {
  id: number;
  description: string;
  transactionDate: string; // yyyy-mm-dd
  categoryName: string;
  categoryType: CategoryType;
  amount: number;
};

type RecentTransactionsProps = {
  year: number;
  transactions: RecentTransaction[];
};

const TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

// Badge colors use the darker text tokens from app/globals.css for WCAG AA contrast.
const TYPE_BADGE_CLASSES: Record<CategoryType, string> = {
  income: "bg-income-badge text-income-text",
  expense: "bg-expense-badge text-expense-text",
};

export default function RecentTransactions({
  year,
  transactions,
}: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Transactions</CardTitle>
        <CardAction className="flex gap-2">
          {/* TODO: the transaction list page is not built yet (no app/dashboard/transaction/page.tsx),
              so this link currently leads to a 404. Keep the href until that page exists. */}
          <Link
            href="/dashboard/transaction"
            className={buttonVariants({ variant: "outline" })}
          >
            View All
          </Link>
          <Link
            href="/dashboard/transaction/new"
            className={buttonVariants({ variant: "default" })}
          >
            Create New
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption className="sr-only">
            Recent transactions for {year}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  No transactions for {year}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(parseISO(transaction.transactionDate), "do MMM yyyy")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={TYPE_BADGE_CLASSES[transaction.categoryType]}
                    >
                      {TYPE_LABELS[transaction.categoryType]}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.categoryName}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
