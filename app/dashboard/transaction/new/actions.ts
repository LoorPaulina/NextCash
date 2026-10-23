"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { transactionsTable } from "@/db/schema";
import { transactionSchema } from "@/lib/validations/transaction";

const createTransactionSchema = transactionSchema.omit({ date: true }).extend({
  transactionDate: z.iso.date("Select a valid date"),
});

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;

export type CreateTransactionResult = {
  success: boolean;
  message: string;
};

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<CreateTransactionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = createTransactionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const { description, amount, transactionDate, categoryId } = parsed.data;

  try {
    await db.insert(transactionsTable).values({
      userId,
      description,
      amount: String(amount),
      transactionDate,
      categoryId,
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not save the transaction" };
  }

  revalidatePath("/dashboard/transaction");

  return { success: true, message: "Transaction created" };
}
