import { ExpenseForm } from "@/components/forms/expense-form";
import { ExpensesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getExpensesPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows: expenseRows, pagination } = await getExpensesPage(parsePagination(await searchParams));

  return (
    <>
      <PageHeader title="Gider Yonetimi" description="Operasyon, lojistik ve diger isletme giderlerini takip edin." />
      <div className="expense-layout grid min-w-0 gap-4 p-4 [&>*]:min-w-0">
        <ExpenseForm />
        <ExpensesTable rows={expenseRows} pagination={pagination} />
      </div>
    </>
  );
}
