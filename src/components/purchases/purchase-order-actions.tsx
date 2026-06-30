"use client";

import { useTransition } from "react";
import { CheckCircle2, FileText, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelPurchaseOrderAction, createPurchaseInvoiceAction, receivePurchaseOrderAction } from "@/app/purchases/actions";
import { Button } from "@/components/ui/button";

export function PurchaseOrderActions({
  id,
  status,
  hasInvoice,
  stockReceived
}: {
  id: string;
  status: string;
  hasInvoice: boolean;
  stockReceived: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isCancelled = status === "CANCELLED";

  function runAction(action: () => Promise<void>, successMessage: string, errorMessage: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : errorMessage);
      }
    });
  }

  return (
    <div className="mt-5 grid gap-2">
      <Button
        type="button"
        disabled={isPending || stockReceived || isCancelled}
        onClick={() => runAction(() => receivePurchaseOrderAction(id), "Satin alma teslim alindi ve stok artirildi", "Satin alma teslim alinamadi")}
      >
        <CheckCircle2 className="size-4" aria-hidden />
        Teslim al ve stogu artir
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending || hasInvoice || isCancelled || !stockReceived}
        onClick={() => runAction(() => createPurchaseInvoiceAction(id).then(() => undefined), "Alis faturasi olusturuldu", "Alis faturasi olusturulamadi")}
      >
        <FileText className="size-4" aria-hidden />
        Fatura olustur
      </Button>
      <Button
        type="button"
        variant="danger"
        disabled={isPending || hasInvoice || isCancelled}
        onClick={() => runAction(() => cancelPurchaseOrderAction(id), "Satin alma iptal edildi", "Satin alma iptal edilemedi")}
      >
        <RotateCcw className="size-4" aria-hidden />
        Iptal et
      </Button>
    </div>
  );
}
