"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteRowButtonProps = {
  id: string;
  disabled?: boolean;
  disabledLabel?: string;
  confirmMessage: string;
  successMessage: string;
  errorMessage: string;
  action: (id: string) => Promise<void>;
};

export function DeleteRowButton({
  id,
  disabled,
  disabledLabel = "Silinemez",
  confirmMessage,
  successMessage,
  errorMessage,
  action
}: DeleteRowButtonProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setIsConfirmOpen(false);
    startTransition(async () => {
      try {
        await action(id);
        toast.success(successMessage);
        router.refresh();
      } catch {
        toast.error(errorMessage);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        className="min-h-9 px-3"
        onClick={() => setIsConfirmOpen(true)}
        disabled={disabled || isPending}
      >
        <Trash2 className="size-4" aria-hidden />
        {disabled ? disabledLabel : "Sil"}
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        title="Kayıt silinsin mi?"
        description={confirmMessage}
        confirmLabel="Sil"
        cancelLabel="Vazgeç"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
