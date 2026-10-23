import { z } from "zod";

export const MAX_DESCRIPTION_LENGTH = 300;

export const transactionSchema = z.object({
  transactionType: z.enum(["income", "outcome"], {
    error: "Select a transaction type",
  }),
  categoryId: z.coerce
    .number({ error: "Select a category" })
    .int("Select a category")
    .positive("Select a category"),
  date: z
    .date({ error: "Select a valid date" })
    .refine((date) => date <= new Date(), "Date cannot be in the future"),
  amount: z.coerce
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  description: z
    .string()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`,
    ),
});

export type TransactionFormInput = z.input<typeof transactionSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
