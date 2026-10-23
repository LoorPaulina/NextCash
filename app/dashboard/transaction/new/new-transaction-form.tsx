"use client";

import { format } from "date-fns";
import TransactionForm from "@/components/transaction-form";
import { type Category } from "@/types/Category";
import { type TransactionFormValues } from "@/lib/validations/transaction";
import { createTransaction } from "./actions";

export default function NewTransactionForm({
  categories,
}: {
  categories: Category[];
}) {
  const handleSubmit = (values: TransactionFormValues) =>
    createTransaction({
      transactionType: values.transactionType,
      categoryId: values.categoryId,
      amount: values.amount,
      description: values.description,
      transactionDate: format(values.date, "yyyy-MM-dd"),
    });

  return <TransactionForm categories={categories} onSubmit={handleSubmit} />;
}
