"use client";

import { Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ActiveToggleRowButtonProps = {
  id: string;
  isActive: boolean;
  activateAction: (id: string) => Promise<void>;
  deactivateAction: (id: string) => Promise<void>;
  entityName: string;
};

export function ActiveToggleRowButton({
  id,
  isActive,
  activateAction,
  deactivateAction,
  entityName
}: ActiveToggleRowButtonProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const Icon = isActive ? PowerOff : Power;
  const label = isActive ? "Pasifleştir" : "Aktifleştir";
  const action = isActive ? deactivateAction : activateAction;
  const nextState = isActive ? "pasifleştirmek" : "aktifleştirmek";
  const successState = isActive ? "pasifleştirildi" : "aktifleştirildi";

  function handleConfirm() {
    setIsConfirmOpen(false);
    startTransition(async () => {
      try {
        await action(id);
        toast.success(`${entityName} ${successState}`);
        router.refresh();
      } catch {
        toast.error(`${entityName} durumu güncellenemedi`);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={isActive ? "danger" : "secondary"}
        className="min-h-9 px-3"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
      >
        <Icon className="size-4" aria-hidden />
        {label}
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        title={`${entityName} ${isActive ? "pasifleştirilsin" : "aktifleştirilsin"} mi?`}
        description={`Bu ${entityName} kaydını ${nextState} üzeresiniz. Devam etmek istiyor musunuz?`}
        confirmLabel={label}
        cancelLabel="Vazgeç"
        variant={isActive ? "danger" : "primary"}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
