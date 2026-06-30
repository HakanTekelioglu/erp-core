import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CustomersTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listCustomers } from "@/services/customer-service";

function formatCustomerType(type: string) {
  return type === "CORPORATE" ? "Kurumsal" : "Bireysel";
}

export default async function CustomersPage() {
  const customers = await listCustomers();
  const rows = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    type: formatCustomerType(customer.type),
    phone: customer.phone ?? "-",
    email: customer.email ?? "-",
    balance: Number(customer.balance),
    status: customer.isActive ? "Aktif" : "Pasif",
    usageCount: customer._count.salesOrders + customer._count.invoices
  }));

  return (
    <AppShell>
      <PageHeader title="Musteri Yonetimi" description="Bireysel ve kurumsal musterileri, bakiyeleri ve satis gecmisini takip edin." action={{ label: "Yeni musteri", href: "/customers/new", icon: Plus }} />
      <div className="p-4">
        <CustomersTable rows={rows} />
      </div>
    </AppShell>
  );
}
