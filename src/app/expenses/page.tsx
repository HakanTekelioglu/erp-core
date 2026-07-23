import { AppShell } from "@/components/layout/app-shell";
import { ExpenseForm } from "@/components/forms/expense-form";
import { ExpensesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listExpenseRows } from "@/services/expense-service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

function formatPaymentMethod(method: string) {
  if (method === "INVOICE") return "Fatura";
  if (method === "CASH") return "Nakit";
  if (method === "CREDIT_CARD") return "Kredi karti";
  return "Banka transferi";
}

export default async function ExpensesPage() {
  const expenses = await listExpenseRows();
  const expenseRows = expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,
    date: formatDate(expense.expenseDate),
    method: formatPaymentMethod(expense.method),
    amount: Number(expense.amount)
  }));

  return (
    <AppShell>
      <PageHeader title="Gider Yonetimi" description="Operasyon, lojistik ve diger isletme giderlerini takip edin." />
      <div className="expense-layout grid min-w-0 gap-4 p-4 [&>*]:min-w-0">
        <ExpenseForm />
        <ExpensesTable rows={expenseRows} />
      </div>
    </AppShell>
  );
}
