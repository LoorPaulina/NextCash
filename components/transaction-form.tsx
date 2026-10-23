"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Category } from "@/types/Category";
import {
  transactionSchema,
  type TransactionFormInput,
  type TransactionFormValues,
} from "@/lib/validations/transaction";

const TRANSACTION_TYPES = [
  { value: "income", label: "Income" },
  { value: "outcome", label: "Outcome" },
];

const DEFAULT_VALUES: TransactionFormInput = {
  transactionType: "income",
  categoryId: 0,
  date: new Date(2025, 0, 13),
  amount: 0,
  description: "",
};

type SubmitResult = {
  success: boolean;
  message: string;
};

type Props = {
  categories: Category[];
  onSubmit: (data: TransactionFormValues) => Promise<SubmitResult>;
};

export default function TransactionForm({ categories, onSubmit }: Props) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const transactionType = useWatch({
    control: form.control,
    name: "transactionType",
  });

  const categoryType = transactionType === "outcome" ? "expense" : "income";

  const filteredCategories = categories.filter(
    (category) => category.type === categoryType,
  );

  const handleFormSubmit = async (values: TransactionFormValues) => {
    const result = await onSubmit(values);
    setSubmitResult(result);

    if (result.success) {
      form.reset(DEFAULT_VALUES);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="transactionType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="transaction-type">
                      Transaction Type
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("categoryId", 0);
                      }}
                    >
                      <SelectTrigger
                        id="transaction-type"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                      name={field.name}
                      items={filteredCategories.map((category) => ({
                        value: String(category.id),
                        label: category.name,
                      }))}
                      value={field.value ? String(field.value) : null}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id="category"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label>Transaction Date</Label>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            aria-invalid={fieldState.invalid}
                            className="w-full justify-start font-normal"
                          />
                        }
                      >
                        <CalendarIcon className="text-muted-foreground" />
                        {format(field.value, "MMMM do, yyyy")}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(selected) => {
                            if (selected) {
                              field.onChange(selected);
                              setIsCalendarOpen(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                      {...field}
                      id="amount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={String(field.value ?? "")}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {submitResult && (
              <p
                className={
                  submitResult.success
                    ? "text-sm text-green-600"
                    : "text-sm text-destructive"
                }
              >
                {submitResult.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Submit
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
