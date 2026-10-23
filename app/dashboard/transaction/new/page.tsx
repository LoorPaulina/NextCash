import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { getCategories } from "@/data/getCategories";
import NewTransactionForm from "./new-transaction-form";

export default async function NewTransactionPage() {
    const categories = await getCategories();
  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRightIcon className="size-4" />
        <Link href="/dashboard/transaction" className="hover:text-foreground">
          Transactions
        </Link>
        <ChevronRightIcon className="size-4" />
        <span className="text-foreground">New Transaction</span>
      </nav>
        <NewTransactionForm categories={categories} /> 
    </main>
  );
}