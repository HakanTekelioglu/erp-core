import { AppShell } from "@/components/layout/app-shell";
import { UserForm } from "@/components/forms/user-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewUserPage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Kullanici" description="Kullanici hesabi, rol ve aktiflik durumunu kaydedin." />
      <div className="p-4">
        <UserForm />
      </div>
    </AppShell>
  );
}
