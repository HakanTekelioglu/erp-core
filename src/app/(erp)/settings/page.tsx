import { SettingsForm } from "@/components/forms/settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { getCompanySettings } from "@/services/settings-service";

export default async function SettingsPage() {
  const settings = await getCompanySettings();

  return (
    <>
      <PageHeader title="Ayarlar" description="Sirket bilgileri, varsayilan para birimi, KDV ve fatura numarasi ayarlarini yonetin." />
      <div className="p-4">
        <SettingsForm
          defaultValues={{
            companyName: settings.companyName,
            address: settings.address ?? "",
            phone: settings.phone ?? "",
            email: settings.email ?? "",
            taxNumber: settings.taxNumber ?? "",
            defaultCurrency: settings.defaultCurrency as "TRY" | "USD" | "EUR",
            defaultVatRate: settings.defaultVatRate.toNumber(),
            invoicePrefix: settings.invoicePrefix,
            nextInvoiceCounter: settings.nextInvoiceCounter
          }}
        />
      </div>
    </>
  );
}
