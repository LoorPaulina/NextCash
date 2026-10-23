import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import "server-only";
import { and, desc, eq, gte, lte } from "drizzle-orm";

// Returns the user's transactions for a calendar year, newest first, joined with their category.
export async function getTransactions(userId: string, year: number) {
  const transactions = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      transactionDate: transactionsTable.transactionDate,
      categoryName: categoriesTable.name,
      categoryType: categoriesTable.type,
    })
    .from(transactionsTable)
    .innerJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
    )
    .where(
      and(
        eq(transactionsTable.userId, userId),
        gte(transactionsTable.transactionDate, `${year}-01-01`),
        lte(transactionsTable.transactionDate, `${year}-12-31`),
      ),
    )
    // id breaks ties between transactions on the same day, so the order is stable.
    .orderBy(
      desc(transactionsTable.transactionDate),
      desc(transactionsTable.id),
    );

  return transactions;
}
