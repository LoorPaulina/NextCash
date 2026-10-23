// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionForm from "@/components/transaction-form";
import { CATEGORY_FIXTURES } from "@/tests/fixtures/categories";

afterEach(() => {
  cleanup();
});

function renderForm(onSubmit = vi.fn(async () => ({
  success: true,
  message: "Transaction created",
}))) {
  render(<TransactionForm categories={CATEGORY_FIXTURES} onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
}

describe("TransactionForm", () => {
  describe("validation on an untouched form", () => {
    it("shows the category and amount errors and does not call onSubmit", async () => {
      const { onSubmit, user } = renderForm();

      await user.click(screen.getByRole("button", { name: "Submit" }));

      // "Select a category" is also the select placeholder, so the error is read from role="alert".
      const alerts = await screen.findAllByRole("alert");
      const messages = alerts.map((alert) => alert.textContent);
      expect(messages).toEqual(
        expect.arrayContaining(["Select a category", "Amount must be greater than 0"]),
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("marks the amount input as invalid after a failed submit", async () => {
      const { user } = renderForm();

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await screen.findByText("Amount must be greater than 0");
      expect(screen.getByLabelText("Amount")).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("category selection", () => {
    it("clears the chosen category when the transaction type changes", async () => {
      const { user } = renderForm();

      await user.click(screen.getByRole("combobox", { name: "Category" }));
      await user.click(await screen.findByRole("option", { name: "Salary" }));
      expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent("Salary");

      await user.click(screen.getByRole("combobox", { name: "Transaction Type" }));
      await user.click(await screen.findByRole("option", { name: "Outcome" }));

      expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent(
        "Select a category",
      );
    });
  });

  describe("successful submission", () => {
    it("calls onSubmit with the entered values", async () => {
      const { onSubmit, user } = renderForm();

      await user.click(screen.getByRole("combobox", { name: "Category" }));
      await user.click(await screen.findByRole("option", { name: "Salary" }));
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "25.5");
      await user.type(screen.getByLabelText("Description"), "March pay");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: "income",
          categoryId: 1,
          amount: 25.5,
          description: "March pay",
        }),
      );
    });

    it("shows the success message and resets the form", async () => {
      const { user } = renderForm();

      await user.click(screen.getByRole("combobox", { name: "Category" }));
      await user.click(await screen.findByRole("option", { name: "Salary" }));
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "25.5");
      await user.type(screen.getByLabelText("Description"), "March pay");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(await screen.findByText("Transaction created")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toHaveValue("");
      expect(screen.getByLabelText("Amount")).toHaveValue(0);
      expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent(
        "Select a category",
      );
    });
  });

  describe("failed submission", () => {
    it("shows the error message and keeps the entered values", async () => {
      const onSubmit = vi.fn(async () => ({
        success: false,
        message: "Could not save the transaction",
      }));
      const { user } = renderForm(onSubmit);

      await user.click(screen.getByRole("combobox", { name: "Category" }));
      await user.click(await screen.findByRole("option", { name: "Salary" }));
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "25.5");
      await user.type(screen.getByLabelText("Description"), "March pay");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(await screen.findByText("Could not save the transaction")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toHaveValue("March pay");
      expect(screen.getByLabelText("Amount")).toHaveValue(25.5);
    });
  });
});
