"use client";

import { useTransition } from "react";
import { FileText, RotateCcw, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveSalesOrderAction, cancelSalesOrderAction, createSalesInvoiceAction } from "@/app/sales/actions";
import { Button } from "@/components/ui/button";

export function SalesOrderActions({
  id,
  status,
  hasInvoice,
  stockPosted
}: {
  id: string;
  status: string;
  hasInvoice: boolean;
  stockPosted: boolean;
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
        disabled={isPending || stockPosted || isCancelled}
        onClick={() => runAction(() => approveSalesOrderAction(id), "Satis onaylandi ve stok dusuldu", "Satis onaylanamadi")}
      >
        <CheckCircle2 className="size-4" aria-hidden />
        Onayla ve stogu dus
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending || hasInvoice || isCancelled || !stockPosted}
        onClick={() => runAction(() => createSalesInvoiceAction(id).then(() => undefined), "Fatura olusturuldu", "Fatura olusturulamadi")}
      >
        <FileText className="size-4" aria-hidden />
        Fatura olustur
      </Button>
      <Button
        type="button"
        variant="danger"
        disabled={isPending || isCancelled}
        onClick={() => runAction(() => cancelSalesOrderAction(id), "Satis iptal edildi", "Satis iptal edilemedi")}
      >
        <RotateCcw className="size-4" aria-hidden />
        Iptal et
      </Button>
    </div>
  );
}
