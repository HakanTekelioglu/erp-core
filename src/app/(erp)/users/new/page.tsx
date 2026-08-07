import { UserForm } from "@/components/forms/user-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewUserPage() {
  return (
    <>
      <PageHeader title="Yeni Kullanici" description="Kullanici hesabi, rol ve aktiflik durumunu kaydedin." />
      <div className="p-4">
        <UserForm />
      </div>
    </>
  );
}
